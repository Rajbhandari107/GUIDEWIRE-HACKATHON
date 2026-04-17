from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from database import engine, Base
from crud import *
from routes.auth import router as auth_router
from routes.policies import router as policies_router
from routes.payments import router as payments_router

load_dotenv()

app = FastAPI(title="GigInsure API", version="1.0.0")

# CORS for frontend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(policies_router, prefix="/policies", tags=["policies"])
app.include_router(payments_router, prefix="/api/payments", tags=["payments"])

@app.get("/")
def read_root():
    return {"message": "GigInsure API - Protecting Gig Workers Income"}
