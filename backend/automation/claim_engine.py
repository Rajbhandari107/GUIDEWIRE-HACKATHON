from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from services.persona_engine import calculate_persona_payout
from services.weather_service import get_weather
from ml.fraud_model import predict_fraud_score
import uuid
import json
import models, schemas, crud


def trigger_zero_touch_claim(
    db: Session,
    user_id: int,
    trigger_type: str,
    raw_trigger_data: dict,
    simulated_fraud_features: dict = None,
):
    """
    Automated claim detection and approval logic with real AI/weather integrations.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    policy = db.query(models.Policy).filter(
        models.Policy.user_id == user_id,
        models.Policy.is_active == True,
    ).first()

    if not policy or not user:
        return None

    # ── Live weather context enrichment ─────────────────────────────────────
    weather = get_weather(user.location)
    trigger_data = {**raw_trigger_data, "weather_context": weather}

    # ── Fraud Detection scoring ──────────────────────────────────────────────
    if simulated_fraud_features:
        # Explicit demo/test fraud scenario — use injected features directly
        f_freq    = simulated_fraud_features.get("claim_freq", 0)
        f_dev     = simulated_fraud_features.get("dev_loc", 0)
        f_mismatch = simulated_fraud_features.get("mismatch_env", 0)
        f_time    = simulated_fraud_features.get("time_incon", 0)
        f_rep     = simulated_fraud_features.get("repeated_claims", 0)
    else:
        # ── Real claim: derive features from live data ───────────────────────

        # Feature 1: claim frequency this week (real DB query)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_count = (
            db.query(models.Claim)
            .filter(
                models.Claim.policy_id == policy.id,
                models.Claim.created_at >= week_ago,
            )
            .count()
        )
        f_freq = min(recent_count, 10)  # cap at 10 for model range

        # Feature 2: GPS deviation — no GPS data collected yet, default 0
        f_dev = 0

        # Feature 3: Environmental mismatch — cross-check live weather vs trigger type.
        # Only flag when we have live OpenWeather data (source='openweather'),
        # so mock fallback data doesn't produce false positives.
        f_mismatch = 0
        if weather.get("source") == "openweather":
            rain_mm  = weather.get("rainfall_mm", 0)
            temp     = weather.get("temperature", 28)
            aqi      = weather.get("aqi", 100)
            cond     = weather.get("condition", "Clear")
            rain_conditions = {"Rain", "Drizzle", "Thunderstorm"}

            if trigger_type == "heavy_rain":
                # Mismatch: claim of heavy rain but live data shows clear sky & <5mm
                if rain_mm < 5 and cond not in rain_conditions:
                    f_mismatch = 1
            elif trigger_type == "flood":
                # Mismatch: flood claim but barely any rain
                if rain_mm < 10 and cond not in rain_conditions:
                    f_mismatch = 1
            elif trigger_type == "extreme_heat":
                # Mismatch: heat claim but temperature is normal
                if temp < 38:
                    f_mismatch = 1
            elif trigger_type == "high_aqi":
                # Mismatch: AQI claim but air quality is acceptable
                if aqi < 150:
                    f_mismatch = 1
            # zone_closure has no weather proxy — skip mismatch check

        # Feature 4: time inconsistency — reserved for future GPS/timing data
        f_time = 0

        # Feature 5: repeated claims pattern this week
        f_rep = 1 if f_freq >= 3 else 0

    fraud_score, risk_level = predict_fraud_score(f_freq, f_dev, f_mismatch, f_time, f_rep)

    # ── Time-aware Payout Calculation ────────────────────────────────────────
    current_hour = datetime.now().hour
    payout_amount, time_mult, time_band = calculate_persona_payout(user, trigger_type, hour_of_day=current_hour)
    payout_amount = min(payout_amount, policy.coverage)

    # ── Enrich trigger data with volatility metadata for UI ──────────────────
    trigger_data["time_volatility"] = {
        "multiplier": time_mult,
        "band": time_band,
        "hour": current_hour
    }

    # ── Approve / Delay / Block based on risk ────────────────────────────────
    if risk_level == "low":
        status = "approved"
        payout_id = None
    elif risk_level == "medium":
        status = "delayed"
        payout_id = None
    else:
        status = "flagged_fraud"
        payout_id = None

    db_claim = models.Claim(
        policy_id=policy.id,
        trigger_type=trigger_type,
        trigger_data=json.dumps(trigger_data),
        amount=payout_amount,
        status=status,
        payout_id=payout_id,
        fraud_score=round(fraud_score, 4),
        risk_level=risk_level,
    )

    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)

    return db_claim
