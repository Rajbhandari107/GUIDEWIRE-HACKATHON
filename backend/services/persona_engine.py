from typing import Dict, List, Tuple
from ml.premium_calculator import get_premium_breakdown

# Severity mapping for different disruption types
SEVERITY_MAP = {
    "heavy_rain": 0.6,
    "high_aqi": 0.4,
    "zone_restriction": 0.9  # curfew mapping
}

def calculate_persona_premium(user: any, location: str) -> Tuple[float, List[Dict]]:
    """
    Advanced premium calculation based on user persona and location risk.
    """
    # 1. Get base location-based breakdown
    base_factors, location_total = get_premium_breakdown(location)
    
    # 2. Daily Income Factor (Exposure)
    # Target: ₹1000/day adds approx ₹10 to premium
    income_impact = round((user.avg_daily_income / 1000) * 10, 2)
    
    # 3. Work Hours Factor (Risk Exposure)
    # Target: 8 hours adds approx ₹5 to premium
    hours_impact = round((user.work_hours_per_day / 8) * 5, 2)
    
    # 4. Work Type Multiplier
    # Full-time workers have 10% higher base risk
    type_multiplier = 1.1 if user.work_type == "full-time" else 1.0
    
    # Combine factors
    persona_factors = [
        {"name": "Location Risk", "value": location_total},
        {"name": "Income Exposure", "value": income_impact},
        {"name": "Hours Exposure", "value": hours_impact}
    ]
    
    raw_total = location_total + income_impact + hours_impact
    final_premium = round(raw_total * type_multiplier, 2)
    
    # Return final premium and detailed factors
    return final_premium, persona_factors

def calculate_persona_payout(user: any, disruption_type: str) -> float:
    """
    Personalized payout logic based on average daily income and disruption severity.
    """
    severity = SEVERITY_MAP.get(disruption_type, 0.5)
    payout = round(user.avg_daily_income * severity, 2)
    return payout
