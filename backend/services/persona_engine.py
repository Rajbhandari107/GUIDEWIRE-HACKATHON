from typing import Dict, List, Tuple
from ml.premium_calculator import get_premium_breakdown
from services.volatility_engine import get_time_multiplier

# Severity mapping for different disruption types
SEVERITY_MAP = {
    "heavy_rain": 0.6,
    "flood": 0.9,          # major disruption, similar to curfew
    "extreme_heat": 0.5,   # moderate — still deliverable but risky
    "high_aqi": 0.4,
    "zone_closure": 0.9,   # matches admin simulator endpoint
    "zone_restriction": 0.9  # legacy alias — keep for backward compat
}

def calculate_persona_premium(user: any, location: str, weather_data: dict = None) -> Tuple[float, List[Dict]]:
    """
    Advanced premium calculation based on user persona and location risk.
    """
    # 1. Get base location-based breakdown
    # If weather_data is not passed, premium_calculator will fallback to location-based risk
    base_factors, location_total = get_premium_breakdown(weather_data or location)
    
    # 2. Daily Income Factor (Exposure)
    # Target: ₹1000/day adds approx ₹10 to premium
    income_impact = round((user.avg_daily_income / 1000) * 10, 2)
    
    # 3. Work Hours Factor (Risk Exposure)
    # Target: 8 hours adds approx ₹5 to premium
    hours_impact = round((user.work_hours_per_day / 8) * 5, 2)
    
    # 4. Work Type Multiplier
    # Full-time workers have 10% higher base risk
    type_multiplier = 1.1 if user.work_type == "full-time" else 1.0

    # 5. Time Volatility / peak Hour Exposure (NEW)
    # If the user works 8+ hours or is full-time, they are more exposed to peak rush volatility
    volatility_impact = 0
    if user.work_hours_per_day >= 8 or user.work_type == "full-time":
        volatility_impact = round(location_total * 0.15, 2) # 15% bump on location risk
    
    # Combine factors
    persona_factors = [
        {"name": "Base Location Risk", "value": location_total},
        {"name": "Income Exposure", "value": income_impact},
        {"name": "Hours Exposure", "value": hours_impact}
    ]
    if volatility_impact > 0:
        persona_factors.append({"name": "Peak Hour Exposure", "value": volatility_impact})
    
    raw_total = location_total + income_impact + hours_impact + volatility_impact
    final_premium = round(raw_total * type_multiplier, 2)
    
    # Return final premium and detailed factors
    return final_premium, persona_factors

def calculate_persona_payout(user: any, disruption_type: str, hour_of_day: int = None) -> Tuple[float, float, str]:
    """
    Personalized payout logic based on average daily income, disruption severity,
    and a time-aware payout model.
    Returns: (payout_amount, time_multiplier, time_band)
    """
    from datetime import datetime
    if hour_of_day is None:
        hour_of_day = datetime.now().hour
        
    severity = SEVERITY_MAP.get(disruption_type, 0.5)
    
    # Loss = income_per_hour x disruption_duration x time_multiplier
    # Mocking disruption_duration based on severity
    disruption_duration = 2 if severity < 0.6 else 4
    
    income_per_hour = user.avg_daily_income / max(1, user.work_hours_per_day)
    
    # Get official time multiplier from engine
    time_multiplier, time_band = get_time_multiplier(hour_of_day)
        
    # Introduce multiplier to ensure decent baseline payout for demo
    base_multiplier = 1.5
        
    payout = round(income_per_hour * disruption_duration * time_multiplier * severity * base_multiplier, 2)
    return payout, time_multiplier, time_band
