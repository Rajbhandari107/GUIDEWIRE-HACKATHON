from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Persona Validation
    if not (300 <= user.avg_daily_income <= 1500):
        raise HTTPException(status_code=400, detail="Daily income must be between ₹300 and ₹1500")
    if not (2 <= user.work_hours_per_day <= 12):
        raise HTTPException(status_code=400, detail="Work hours must be between 2 and 12")
    
    db_user = crud.get_user_by_phone(db, phone=user.phone)
    if db_user:
        raise HTTPException(status_code=400, detail="Phone already registered")
    return crud.create_user(db=db, user=user)
@router.post("/login", response_model=schemas.User)
def login_user(phone: str = Body(..., embed=True), db: Session = Depends(get_db)):
    db_user = crud.get_user_by_phone(db, phone=phone)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
