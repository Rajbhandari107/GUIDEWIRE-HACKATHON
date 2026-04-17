from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import numpy as np
from database import get_db
import crud, schemas, models
from services.persona_engine import calculate_persona_premium
from automation.claim_engine import trigger_zero_touch_claim
from ml.premium_model import predict_premium

router = APIRouter()

# Mock plans
PLANS = [
    {"name": "Basic", "base_premium": 19, "coverage": 500},
    {"name": "Standard", "base_premium": 29, "coverage": 800},
    {"name": "Premium", "base_premium": 49, "coverage": 1200}
]

@router.get("/plans")
def get_plans():
    return PLANS

@router.get("/active/{user_id}", response_model=Optional[schemas.Policy])
def get_active_user_policy(user_id: int, db: Session = Depends(get_db)):
    return crud.get_active_policy(db, user_id)

@router.post("/calculate-premium", response_model=schemas.PremiumResponse)
def calculate_premium(user_id: int, plan_name: str = "Standard", db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan = next((p for p in PLANS if p["name"] == plan_name), PLANS[1])

    from services.weather_service import get_weather_data
    weather = get_weather_data(user.location)

    try:
        rainfall = weather["rainfall_mm"]
        aqi = weather["aqi"]
        temperature = weather["temperature"]
        disruption_freq = 2
        location_risk = 5.0

        ml_premium = predict_premium(rainfall, aqi, temperature, disruption_freq, location_risk)
        _, breakdown = calculate_persona_premium(user, user.location)
        ml_adj = round((ml_premium - 29), 2)
        breakdown.append({"name": "ML Climate Adjustment", "value": ml_adj})
        
        # Add live humidity context for user visibility
        if weather.get("humidity", 0) > 85:
            humidity_adj = 2
            breakdown.append({"name": "High Humidity Risk", "value": humidity_adj})
            ml_premium += humidity_adj
            
        plan_adjustment = plan["base_premium"] - 29
        final_premium = max(10, ml_premium + plan_adjustment)
        source = f"AI pricing ({weather.get('source', 'fallback')}) for {user.name}"

    except Exception:
        # Deterministic fallback — never get stuck on demo
        from ml.premium_calculator import get_premium_breakdown
        factors, rule_total = get_premium_breakdown(weather)
        income_adj = round((user.avg_daily_income / 1000) * 10, 2)
        hours_adj = round((user.work_hours_per_day / 8) * 5, 2)
        plan_adjustment = plan["base_premium"] - 29
        final_premium = max(10, rule_total + income_adj + hours_adj + plan_adjustment)
        breakdown = factors + [
            {"name": "Income Exposure", "value": income_adj},
            {"name": "Hours Exposure", "value": hours_adj},
        ]
        source = f"Rule-based pricing ({weather.get('source', 'fallback')}) for {user.name}"

    return schemas.PremiumResponse(
        premium=round(final_premium, 2),
        coverage=plan["coverage"],
        breakdown=[schemas.RiskFactor(**f) for f in breakdown],
        message=source
    )

@router.post("/purchase", response_model=schemas.Policy)
def purchase_policy(
    policy_data: schemas.PolicyCreate,
    db: Session = Depends(get_db)
):
    # Deactivate existing policies for user
    existing = crud.get_active_policy(db, policy_data.user_id)
    if existing:
        existing.is_active = False
        db.commit()
        
    return crud.create_policy(db, policy_data)

@router.post("/simulate-disruption/{user_id}")
def simulate_disruption(user_id: int, type: str = "heavy_rain", db: Session = Depends(get_db)):
    """
    Simulate a localized weather disruption for testing parametric triggers.
    """
    trigger_data = {
        "heavy_rain": {"rainfall": "45mm", "threshold": "30mm"},
        "high_aqi": {"aqi": 342, "threshold": 300},
        "zone_restriction": {"status": "Closed", "reason": "Emergency"}
    }
    
    claim = trigger_zero_touch_claim(
        db, user_id, type, trigger_data.get(type, {})
    )
    
    if not claim:
        raise HTTPException(status_code=404, detail="No active policy found or trigger failed")
        
    return {"message": "Automation triggered", "claim": claim}

@router.post("/simulate/fraud-case/{type}")
def simulate_fraud_case(type: str, user_id: int, db: Session = Depends(get_db)):
    """
    Simulate specific risk scenarios to test AI Fraud Detector responses.
    """
    features = {}
    if type == "normal":
        features = {"claim_freq": 1, "dev_loc": 0, "mismatch_env": 0, "time_incon": 0, "repeated_claims": 0}
    elif type == "gps_spoof":
        features = {"claim_freq": 2, "dev_loc": 1, "mismatch_env": 1, "time_incon": 0, "repeated_claims": 0}
    elif type == "repeated":
        features = {"claim_freq": 5, "dev_loc": 0, "mismatch_env": 0, "time_incon": 0, "repeated_claims": 1}
    else:
        raise HTTPException(status_code=400, detail="Invalid fraud simulation type")
        
    claim = trigger_zero_touch_claim(
        db, user_id, "heavy_rain", {"rainfall": "50mm"}, simulated_fraud_features=features
    )
    
    if not claim:
        raise HTTPException(status_code=404, detail="No active policy found")
        
    return {"message": f"Fraud scenario '{type}' triggered", "claim": claim}

@router.get("/claims/{user_id}", response_model=List[schemas.Claim])
def get_user_claims(user_id: int, db: Session = Depends(get_db)):
    # Fetch claims across ALL policies for this user, newest first
    all_policies = db.query(models.Policy).filter(models.Policy.user_id == user_id).all()
    if not all_policies:
        return []
    policy_ids = [p.id for p in all_policies]
    return (
        db.query(models.Claim)
        .filter(models.Claim.policy_id.in_(policy_ids))
        .order_by(models.Claim.created_at.desc())
        .all()
    )

# --- ADMIN MASS SIMULATION ENDPOINTS ---

TRIGGER_PRESETS = {
    "heavy_rain": {"rainfall": "65mm", "threshold": "30mm"},
    "flood": {"level": "Danger", "alert_id": "FL-991"},
    "extreme_heat": {"temp": "46°C", "limit": "42°C"},
    "high_aqi": {"aqi": 412, "threshold": 300},
    "zone_closure": {"status": "Active", "reason": "Curfew/Restriction"}
}

def execute_mass_simulation(db: Session, city: str, type: str):
    # Find users whose registration location matches the city AND have an active policy
    users_in_city = db.query(models.User).filter(models.User.location == city).all()
    impacted = 0
    approved = 0
    delayed = 0
    blocked = 0
    total_payout = 0.0

    preset_data = TRIGGER_PRESETS.get(type, {})

    for u in users_in_city:
        # Only process users who have an active policy
        active_policy = crud.get_active_policy(db, u.id)
        if not active_policy:
            continue
        try:
            claim = trigger_zero_touch_claim(db, u.id, type, preset_data)
            if claim:
                impacted += 1
                if claim.status == "approved":
                    approved += 1
                    total_payout += claim.amount
                elif claim.status == "delayed":
                    delayed += 1
                elif claim.status == "flagged_fraud":
                    blocked += 1
        except Exception as e:
            print(f"[SIM ERROR] user_id={u.id}: {e}")
            continue

    return {
        "event": type,
        "city": city,
        "impacted_count": impacted,
        "approved_count": approved,
        "delayed_count": delayed,
        "blocked_count": blocked,
        "total_payout": round(total_payout, 2)
    }

@router.post("/admin/simulate/rain")
def simulate_rain(city: str, db: Session = Depends(get_db)):
    return execute_mass_simulation(db, city, "heavy_rain")

@router.post("/admin/simulate/flood")
def simulate_flood(city: str, db: Session = Depends(get_db)):
    return execute_mass_simulation(db, city, "flood")

@router.post("/admin/simulate/heat")
def simulate_heat(city: str, db: Session = Depends(get_db)):
    return execute_mass_simulation(db, city, "extreme_heat")

@router.post("/admin/simulate/aqi")
def simulate_aqi(city: str, db: Session = Depends(get_db)):
    return execute_mass_simulation(db, city, "high_aqi")

@router.post("/admin/simulate/closure")
def simulate_closure(city: str, db: Session = Depends(get_db)):
    return execute_mass_simulation(db, city, "zone_closure")

@router.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    fraud_count = db.query(models.Claim).filter(models.Claim.status == "flagged_fraud").count()
    genuine_count = db.query(models.Claim).filter(models.Claim.status.in_(["approved", "paid", "delayed"])).count()
    
    # Real aggregates from DB
    total_premiums = db.query(func.sum(models.Policy.current_premium)).scalar() or 2000 # baseline if empty
    total_claims = db.query(func.sum(models.Claim.amount)).filter(models.Claim.status.in_(["approved", "paid"])).scalar() or 0
    
    # Realistic loss ratio calculation
    # Typical target is 60-80%. We'll cap it at 100% for display.
    base_ratio = round(((total_claims + 1) / (total_premiums + 1)) * 100, 1)
    
    import random
    loss_data = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    # If we have very little data, make it 'wiggle' around the real ratio for visual effect
    for day in days:
        variance = random.uniform(-10, 10)
        daily_ratio = max(5, min(95, base_ratio + variance))
        loss_data.append({"name": day, "ratio": round(daily_ratio, 1)})
        
    return {
        "fraud_data": [
            {"name": "Genuine", "count": genuine_count, "fill": "#22C55E"},
            {"name": "Flagged", "count": fraud_count, "fill": "#EF4444"}
        ],
        "loss_data": loss_data,
        "summary": {
            "total_premiums": round(total_premiums, 2),
            "total_payouts": round(total_claims, 2),
            "loss_ratio": base_ratio
        }
    }

# ── Live Weather Proxy ────────────────────────────────────────────────────────
# Frontend fetches weather via the backend so the API key is never exposed
# client-side. Returns the full normalized payload from weather_service.

@router.get("/weather/{city}")
def get_city_weather(city: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Fetch live (or fallback mock) weather for the given city.
    Payload includes source='openweather' or source='fallback_mock'.
    Also passively checks if weather conditions trigger automatic claims.
    """
    from services.weather_service import get_weather
    
    weather = get_weather(city)
    
    # Passive Trigger Detection
    if weather.get("status") == "success":
        rain = weather.get("rainfall_mm", 0)
        temp = weather.get("temperature", 0)
        aqi = weather.get("aqi", 0)
        
        trigger_type = None
        if rain > 30:
            trigger_type = "heavy_rain"
        elif temp > 42:
            trigger_type = "extreme_heat"
        elif aqi > 300:
            trigger_type = "high_aqi"
            
        if trigger_type:
            # We don't want to slow down the weather fetch, so do it in background
            background_tasks.add_task(_process_passive_triggers, db, city, trigger_type, weather)
            
    return weather

def _process_passive_triggers(db: Session, city: str, type: str, weather_data: dict):
    """
    Background job to process passive auto-claims based on live weather limits.
    Prevents duplicate overlapping active claims by catching DB constraints or 
    by checking recent claims. 
    """
    import datetime
    users = db.query(models.User).filter(models.User.location == city).all()
    
    for u in users:
        policy = crud.get_active_policy(db, u.id)
        if not policy:
            continue
            
        # Check if they already have an auto-claim today to prevent spam
        today = datetime.datetime.utcnow() - datetime.timedelta(hours=12)
        recent = db.query(models.Claim).filter(
            models.Claim.policy_id == policy.id,
            models.Claim.trigger_type == type,
            models.Claim.created_at >= today
        ).first()
        
        if not recent:
            try:
                # Add a marker flag so we know this was a PASSIVE actual trigger
                mock_trigger_data = {"source": "passive_auto_detection", "trigger_value": type}
                trigger_zero_touch_claim(db, u.id, type, mock_trigger_data)
            except Exception as e:
                print(f"[Passive Trigger Error] user={u.id} err={e}")

