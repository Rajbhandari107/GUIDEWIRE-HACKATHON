from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    name = Column(String)
    location = Column(String)  # e.g., "Chennai"
    platform = Column(String)  # e.g., "Swiggy"
    avg_daily_income = Column(Float, default=500.0)
    work_hours_per_day = Column(Integer, default=8)
    work_type = Column(String, default="full-time") # part-time or full-time
    created_at = Column(DateTime, default=datetime.utcnow)

    policies = relationship("Policy", back_populates="user")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    base_premium = Column(Float)  # base weekly premium
    current_premium = Column(Float)  # adjusted weekly premium
    coverage = Column(Float)  # max payout
    plan_name = Column(String) # Basic, Standard, Premium
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    user = relationship("User", back_populates="policies")

    claims = relationship("Claim", back_populates="policy")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"))
    trigger_type = Column(String)  # e.g., "heavy_rain", "high_aqi", "zone_restriction"
    trigger_data = Column(String)  # JSON data (e.g., {"rainfall": "45mm", "threshold": "30mm"})
    amount = Column(Float)
    status = Column(String, default="pending")  # pending, approved, paid
    payout_id = Column(String, nullable=True) # Simulated payout ID
    fraud_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    payment_id = Column(String, nullable=True) # Razorpay payment ID
    payment_status = Column(String, default="pending") # pending, paid, failed 
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    policy = relationship("Policy", back_populates="claims")
