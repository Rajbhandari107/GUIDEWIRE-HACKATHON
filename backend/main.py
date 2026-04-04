from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from database import engine, Base
from crud import *
from routes.auth import router as auth_router
from routes.policies import router as policies_router

load_dotenv()

app = FastAPI(title="GigInsure API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(policies_router, prefix="/policies", tags=["policies"])

@app.get("/")
def read_root():
    return {"message": "GigInsure API - Protecting Gig Workers Income"}
