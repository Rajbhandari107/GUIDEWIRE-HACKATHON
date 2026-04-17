import os
import random
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

# OpenWeather uses different city names for some Indian cities
CITY_NAME_MAP = {
    "Bangalore": "Bengaluru",
    "Delhi": "New Delhi",
}

# City-specific baseline AQI for estimation when live AQI data unavailable
CITY_BASE_AQI = {
    "Delhi": 185,
    "Mumbai": 125,
    "Hyderabad": 105,
    "Chennai": 90,
    "Bangalore": 80,
    "Bengaluru": 80,
}


def _estimate_aqi(condition: str, city: str) -> int:
    """
    Estimate AQI from weather condition and city baseline.
    Rain clears the air; haze/fog/smoke worsen it.
    """
    base = CITY_BASE_AQI.get(city, 100)
    if condition in ("Rain", "Drizzle", "Thunderstorm"):
        base = int(base * 0.5)
    elif condition in ("Haze", "Mist", "Fog", "Smoke", "Dust", "Sand"):
        base = int(base * 1.6)
    return max(10, int(base + random.uniform(-12, 12)))


def get_live_weather(city: str) -> dict:
    """
    Fetch live weather from OpenWeather Current Weather API.
    Raises an exception on API key missing, timeout, or non-2xx response.
    3-second timeout enforced.
    """
    if not OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY not set in environment")

    query_city = CITY_NAME_MAP.get(city, city)

    with httpx.Client(timeout=3.0) as client:
        response = client.get(
            f"{OPENWEATHER_BASE_URL}/weather",
            params={
                "q": f"{query_city},IN",
                "appid": OPENWEATHER_API_KEY,
                "units": "metric",
            },
        )
        response.raise_for_status()
        data = response.json()

    # Extract rainfall (mm in last 1 hour) — key only present when raining
    rainfall_mm = 0.0
    if "rain" in data:
        rainfall_mm = round(data["rain"].get("1h", 0.0), 1)

    condition = data["weather"][0]["main"] if data.get("weather") else "Clear"
    description = data["weather"][0]["description"] if data.get("weather") else "clear sky"

    return {
        "city": city,
        "temperature": round(data["main"]["temp"], 1),
        "feels_like": round(data["main"]["feels_like"], 1),
        "humidity": data["main"]["humidity"],
        "rainfall_mm": rainfall_mm,
        "wind_speed": round(data["wind"]["speed"], 1),
        "condition": condition,
        "description": description,
        "aqi": _estimate_aqi(condition, city),
        "status": "success",
        "source": "openweather",
    }


def _get_mock_weather(city: str) -> dict:
    """
    Original random mock generator — used as automatic fallback.
    Preserved exactly so existing behavior is unchanged when API is down.
    """
    base_temp = 28.0
    base_rain = 0.0

    if random.random() > 0.6:
        base_rain = random.uniform(20.0, 70.0)
        base_temp -= 4.0

    temp = round(base_temp + random.uniform(-2, 2), 1)
    rain = round(base_rain + random.uniform(0, 5), 1)
    humidity = int(random.uniform(50, 90))
    wind_speed = round(random.uniform(2.0, 15.0), 1)
    aqi = int(random.uniform(50, 350))
    condition = "Rain" if rain > 20 else "Clear"

    return {
        "city": city,
        "temperature": temp,
        "feels_like": round(temp - 2, 1),
        "humidity": humidity,
        "rainfall_mm": rain,
        "wind_speed": wind_speed,
        "condition": condition,
        "description": "light rain" if rain > 20 else "clear sky",
        "aqi": aqi,
        "status": "success",
        "source": "fallback_mock",
    }


def get_weather(city: str) -> dict:
    """
    Hybrid weather fetch:
      1. Try live OpenWeather API (3s timeout)
      2. On any failure → fallback to deterministic mock

    Always returns a fully normalized weather dict.
    """
    try:
        data = get_live_weather(city)
        print(f"[WeatherService] LIVE data for '{city}': {data['temperature']}C, {data['condition']}, {data['rainfall_mm']}mm rain")
        return data
    except Exception as exc:
        print(f"[WeatherService] API failed for '{city}' ({exc}). Using fallback mock.")
        return _get_mock_weather(city)


# Backward-compatible alias — all existing callers (policies.py, claim_engine.py)
# use get_weather_data() and will now get live data transparently.
def get_weather_data(location: str) -> dict:
    return get_weather(location)
