import os
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression

MODEL_PATH = os.path.join(os.path.dirname(__file__), "fraud_model.pkl")

def train_and_save_model():
    """
    Trains a mock fraud detection model.
    Inputs: [claim_freq_per_week, deviation_from_loc(0 or 1), mismatch_env(0 or 1), time_inconsistency(0 or 1), repeated_claims_pattern(0 or 1)]
    Output: Fraud Probability Score
    """
    # Synthesize data
    np.random.seed(42)
    # Normal claims
    X_normal = np.random.randint(0, 2, size=(800, 5))
    X_normal[:, 0] = np.random.randint(0, 3, size=800) # low frequency
    y_normal = np.zeros(800)

    # Fraud claims
    X_fraud = np.ones((200, 5))
    X_fraud[:, 0] = np.random.randint(3, 10, size=200) # high frequency
    # We add some randomness so it's not perfect
    X_fraud[:, 1] = np.random.randint(0, 2, size=200)
    y_fraud = np.ones(200)

    X = np.vstack([X_normal, X_fraud])
    y = np.concatenate([y_normal, y_fraud])

    model = LogisticRegression(class_weight='balanced')
    model.fit(X, y)
    
    joblib.dump(model, MODEL_PATH)
    print(f"Fraud model trained and saved to {MODEL_PATH}")

def predict_fraud_score(claim_freq, dev_loc, mismatch_env, time_incon, repeated_claims):
    if not os.path.exists(MODEL_PATH):
        train_and_save_model()
    model = joblib.load(MODEL_PATH)
    
    X_new = np.array([[claim_freq, dev_loc, mismatch_env, time_incon, repeated_claims]])
    # Get probability of class 1 (fraud)
    score = float(model.predict_proba(X_new)[0][1])
    
    risk_level = "low"
    if score > 0.7:
        risk_level = "high"
    elif score > 0.4:
        risk_level = "medium"
        
    return score, risk_level

if __name__ == "__main__":
    train_and_save_model()
