from sqlalchemy.orm import Session
from datetime import datetime
from services.persona_engine import calculate_persona_payout
import uuid
import models, schemas, crud

def trigger_zero_touch_claim(db: Session, user_id: int, trigger_type: str, trigger_data: dict):
    """
    Automated claim detection and approval logic with persona scaling.
    """
    # 1. Find user and active policy
    user = db.query(models.User).filter(models.User.id == user_id).first()
    policy = db.query(models.Policy).filter(
        models.Policy.user_id == user_id,
        models.Policy.is_active == True
    ).first()
    
    if not policy or not user:
        return None
        
    # 2. Persona-based Payout calculation
    payout_amount = calculate_persona_payout(user, trigger_type)
    
    # Cap payout at policy coverage (safety layer)
    payout_amount = min(payout_amount, policy.coverage)
    
    # 4. Create Claim
    import json
    db_claim = models.Claim(
        policy_id=policy.id,
        trigger_type=trigger_type,
        trigger_data=json.dumps(trigger_data),
        amount=payout_amount,
        status="paid",  # Auto-approved and "paid"
        payout_id=f"PAY-{uuid.uuid4().hex[:8].upper()}"
    )
    
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    
    return db_claim
