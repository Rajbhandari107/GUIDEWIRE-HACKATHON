from sqlalchemy.orm import Session
import models, schemas

def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def create_user(db: Session, user: schemas.UserCreate):
    try:
        data = user.model_dump()  # Pydantic v2
    except AttributeError:
        data = user.dict()        # Pydantic v1 fallback
    db_user = models.User(**data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_policy(db: Session, policy: schemas.PolicyCreate):
    from datetime import datetime, timedelta
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=7)
    db_policy = models.Policy(
        user_id=policy.user_id,
        plan_name=policy.plan_name,
        base_premium=policy.base_premium,
        current_premium=policy.current_premium,
        coverage=policy.coverage,
        start_date=start_date,
        end_date=end_date,
        is_active=True
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

def create_claim(db: Session, claim: schemas.ClaimCreate):
    db_claim = models.Claim(**claim.dict())
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

def get_active_policy(db: Session, user_id: int):
    from datetime import datetime
    return db.query(models.Policy).filter(
        models.Policy.user_id == user_id,
        models.Policy.is_active == True,
        models.Policy.end_date >= datetime.utcnow()
    ).first()
