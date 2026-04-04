from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import numpy as np
from database import get_db
import crud, schemas, models
from services.persona_engine import calculate_persona_premium
from automation.claim_engine import trigger_zero_touch_claim

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
        
    # Find base plan stats
    plan = next((p for p in PLANS if p["name"] == plan_name), PLANS[1])
    
    # Use Persona Engine for calculating risk-adjusted premium
    premium, breakdown = calculate_persona_premium(user, user.location)
    
    # Adjust for plan (Basic/Premium)
    # Standard plan is the base (0 offset)
    plan_adjustment = plan["base_premium"] - 29 
    final_premium = max(10, premium + plan_adjustment)
    
    return schemas.PremiumResponse(
        premium=round(final_premium, 2),
        coverage=plan["coverage"],
        breakdown=[schemas.RiskFactor(**f) for f in breakdown],
        message=f"Personalized pricing activated for {user.name}"
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
    Demo endpoint: Trigger a disruption manually.
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

@router.get("/claims/{user_id}", response_model=List[schemas.Claim])
def get_user_claims(user_id: int, db: Session = Depends(get_db)):
    policy = crud.get_active_policy(db, user_id)
    if not policy:
        return []
    return db.query(models.Claim).filter(models.Claim.policy_id == policy.id).all()
