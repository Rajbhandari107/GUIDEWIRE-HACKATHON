import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor

MODEL_PATH = os.path.join(os.path.dirname(__file__), "premium_model.pkl")

def train_and_save_model():
    """
    Trains a mock premium model and saves it.
    Inputs: [rainfall (mm), AQI, temperature (C), disruption_frequency (0-5), location_risk_score (0-10)]
    Output: Weekly Premium (Base: 29)
    """
    # Generate some synthetic data
    X = np.random.rand(1000, 5)
    # Scale features reasonably: 
    # rainfall 0-100, AQI 0-500, temp 20-45, freq 0-5, risk 0-10
    X[:, 0] *= 100
    X[:, 1] *= 500
    X[:, 2] = X[:, 2] * 25 + 20
    X[:, 3] *= 5
    X[:, 4] *= 10

    # Mock logic for premium (Base Rs 29, max around Rs 100)
    y = 29 + (X[:, 0] * 0.1) + (X[:, 1] * 0.05) + (X[:, 3] * 2) + (X[:, 4] * 1.5)
    
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, MODEL_PATH)
    print(f"Premium model trained and saved to {MODEL_PATH}")

def predict_premium(rainfall, aqi, temperature, disruption_freq, location_risk):
    if not os.path.exists(MODEL_PATH):
        train_and_save_model()
    model = joblib.load(MODEL_PATH)
    
    X_new = np.array([[rainfall, aqi, temperature, disruption_freq, location_risk]])
    return float(model.predict(X_new)[0])

if __name__ == "__main__":
    train_and_save_model()
