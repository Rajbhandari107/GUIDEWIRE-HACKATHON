import random

def calculate_premium_risk(location: str):
    """
    Mock AI logic to calculate risk based on location/weather.
    Returns a multiplier for the base premium.
    """
    # Simple risk mapping for demonstration
    risk_map = {
        "Chennai": 1.2,
        "Bangalore": 1.0,
        "Mumbai": 1.5,
        "Delhi": 1.3
    }
    
    # Base risk factor
    risk_factor = risk_map.get(location, 1.0)
    
    # Simulate some "AI" variability
    variability = random.uniform(0.95, 1.05)
    
    return round(risk_factor * variability, 2)

def get_premium_breakdown(location: str):
    """
    Detailed breakdown of risk factors.
    """
    factors = [
        {"name": "Base Price", "value": 20},
        {"name": "Rain Risk", "value": 5 if location in ["Chennai", "Mumbai"] else 2},
        {"name": "AQI Risk", "value": 4 if location == "Delhi" else 1},
        {"name": "Zone Safety", "value": -2 if location == "Bangalore" else 0}
    ]
    
    total = sum(f["value"] for f in factors)
    return factors, total
