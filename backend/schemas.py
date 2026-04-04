from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    phone: str
    location: str
    platform: str
    avg_daily_income: float = 500.0
    work_hours_per_day: int = 8
    work_type: str = "full-time"

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PolicyBase(BaseModel):
    base_premium: float
    current_premium: float
    coverage: float
    plan_name: str
    start_date: datetime
    end_date: datetime

class PolicyCreate(BaseModel):
    user_id: int
    plan_name: str
    base_premium: float
    current_premium: float
    coverage: float

class Policy(PolicyBase):
    id: int
    is_active: bool
    user_id: int

    class Config:
        from_attributes = True

class ClaimBase(BaseModel):
    trigger_type: str
    trigger_data: str
    amount: float

class ClaimCreate(ClaimBase):
    policy_id: int

class Claim(ClaimBase):
    id: int
    status: str
    payout_id: Optional[str] = None
    created_at: datetime
    policy_id: int

    class Config:
        from_attributes = True

class RiskFactor(BaseModel):
    name: str
    value: float

class PremiumResponse(BaseModel):
    premium: float
    coverage: float
    breakdown: List[RiskFactor]
    message: str
