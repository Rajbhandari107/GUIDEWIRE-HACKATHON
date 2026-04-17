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

def get_premium_breakdown(weather_data: any):
    """
    Detailed breakdown of risk factors based on live weather data or location string.
    """
    if not isinstance(weather_data, dict):
        # Fallback if only location string is passed
        location = str(weather_data)
        risk_mult = calculate_premium_risk(location)
        base = 20 * risk_mult
        factors = [{"name": "Location Base Risk", "value": round(base, 2)}]
        return factors, round(base, 2)

    rain = weather_data.get("rainfall_mm", 0)
    aqi = weather_data.get("aqi", 50)
    humidity = weather_data.get("humidity", 50)
    temp = weather_data.get("temperature", 30)

    rain_risk = min(15, round(rain * 0.5))
    aqi_risk = 5 if aqi > 200 else (2 if aqi > 100 else 0)
    heat_risk = 4 if temp > 38 else 0
    humidity_risk = 2 if humidity > 85 else 0

    factors = [
        {"name": "Base Price", "value": 20},
    ]

    if rain_risk > 0: factors.append({"name": "Rain Risk", "value": rain_risk})
    if aqi_risk > 0: factors.append({"name": "AQI Risk", "value": aqi_risk})
    if heat_risk > 0: factors.append({"name": "Heat Risk", "value": heat_risk})
    if humidity_risk > 0: factors.append({"name": "Humidity Risk", "value": humidity_risk})
    
    # NEW: Time-of-Day Volatility Protection signaling
    from datetime import datetime
    hour = datetime.now().hour
    if 16 <= hour < 22: # Prime Rush
        factors.append({"name": "Peak Volatility", "value": 4})
    elif 6 <= hour < 10: # Morning Rush
        factors.append({"name": "Morning Surge Risk", "value": 2})

    if len(factors) == 1: factors.append({"name": "Good Conditions", "value": -2})

    total = sum(f["value"] for f in factors)
    return factors, round(total, 2)

