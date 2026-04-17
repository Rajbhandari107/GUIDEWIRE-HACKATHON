# GigInsure
**AI-powered parametric income protection for gig delivery workers**

> *Protecting the earnings of 12+ million gig workers against weather disruptions, AQI hazards, and zone restrictions — automatically, with zero paperwork.*

---

## Problem Statement

Food delivery partners in India earn **only when they work**. When external conditions like heavy rain, floods, extreme heat, or dangerous AQI prevent them from working, they lose income with no recourse.

Today there is **no financial product** that protects gig workers from climate-driven income loss.

---

## Delivery Worker Persona Scenarios

### Ravi – Swiggy Delivery Partner, Chennai
- Earns ~₹600/day, works 8+ hrs
- During heavy monsoon, roads flood → 0 orders, ₹0 earned
- **Weekly income loss: ₹1,800–₹2,400**

### Priya – Zomato Partner, Mumbai
- Part-time, ₹300/day, 4 hrs
- AQI spikes to 350+ due to industrial pollution → stays home
- **Weekly income loss: ₹600–₹900**

### Arjun – Swiggy Partner, Bangalore
- ₹1,000/day full-time, 10 hrs
- Extreme heat advisory issued (46°C) → unsafe to operate
- **Weekly income loss: ₹3,000+**

---

## Application Workflow

```
Register → Premium Calculated (ML + Weather + Persona)
         → Weekly Plan Purchased (₹19 / ₹29 / ₹49)
         → Policy Active (7-day rolling)
         ↓
Live Monitoring: Rain/AQI/Heat/Flood/Zone Closure
         ↓
Threshold Exceeded → Zero-Touch Claim Auto-Created
         ↓
Fraud Engine: ML Scoring → Approve / Delay / Block
         ↓
Approved → Razorpay Payout (Test Mode) → PAID
         ↓
Worker Dashboard Updated in Real Time
```

---

## Weekly Premium Model

GigInsure uses a **weekly subscription model** because gig workers operate week-to-week and irregular monthly premiums create friction.

| Plan     | Weekly Premium | Coverage Cap |
|----------|--------------:|-------------:|
| Basic    | ₹19           | ₹500         |
| Standard | ₹29           | ₹800         |
| Premium  | ₹49           | ₹1,200       |

Premiums are **dynamically adjusted** above base prices using:
- **Live Weather Data** (OpenWeatherMap API): rain, temperature, humidity
- **AQI** (estimated from city baseline + condition)
- **ML Model** (Random Forest): trained on environmental features
- **User Persona**: daily income × work hours × work type × city risk
- **Time-of-Day Volatility**: Peak Rush hours attract higher exposure

---

## Parametric Trigger Explanation

GigInsure uses **parametric insurance** — claims are triggered automatically when real-world environmental parameters cross predefined thresholds. Workers **never file claims manually**.

| Trigger Type      | Threshold                    |
|-------------------|------------------------------|
| Heavy Rain        | Rainfall > 30mm/hr           |
| Flood Alert       | Official Flood level "Danger" |
| Extreme Heat      | Temperature > 42°C           |
| High AQI          | AQI > 300 (Hazardous)        |
| Zone Closure      | Govt. curfew / restriction alert |

Once triggered:
1. Zero-touch claim is auto-created in DB
2. Fraud engine assigns ML risk score
3. Payout calculated based on income × severity × time multiplier
4. Approved claims proceed to Razorpay payout

---

## Why Mobile / Web?

We chose a **Progressive Web App (PWA-ready React)** because:
- Gig workers primarily use Android smartphones
- No app store download barrier
- Instant load, offline-safe caching possible
- Backend-first architecture allows any frontend to integrate
- Demo-ready across all devices without installation

---

## AI / ML Strategy

### 1. Dynamic Premium Calculation (Random Forest)
- **Input features**: rainfall_mm, AQI, temperature, disruption_frequency, location_risk_score
- **Output**: Weekly premium prediction
- **Fallback**: Rule-based calculator if model unavailable
- **Model file**: `backend/ml/premium_model.pkl` (4.3MB trained model)

### 2. Fraud Detection (Logistic Regression)
- **Input features**: claim_freq_per_week, GPS_deviation, env_mismatch, time_inconsistency, repeated_claims_pattern
- **Output**: Fraud probability score (0–1)
- **Risk levels**: Low (<0.4) → Approve | Medium (0.4–0.7) → Delay | High (>0.7) → Block
- **Model file**: `backend/ml/fraud_model.pkl`

### 3. Time-of-Day Volatility Engine
- Payout multipliers based on earning-window analysis:
  - **Prime Rush (4 PM–10 PM)**: 1.6× (peak earning window)
  - **Morning Rush (6 AM–10 AM)**: 1.3×
  - **Off Peak (10 AM–4 PM)**: 0.8×
  - **Late Peak (10 PM–1 AM)**: 1.2×
  - **Low Activity (1 AM–6 AM)**: 0.6×

---

## Tech Stack

| Layer        | Technology                       |
|--------------|----------------------------------|
| Frontend     | React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend      | FastAPI (Python 3.11)            |
| Database     | SQLite (dev) → PostgreSQL (prod) |
| ORM          | SQLAlchemy + Pydantic            |
| ML Models    | scikit-learn (Random Forest, Logistic Regression) |
| Weather API  | OpenWeatherMap Current Weather API |
| Payments     | Razorpay Test Mode + Demo Fallback |
| Charts       | Recharts                         |

---

## Development Plan

### Phase 1 — Ideation & Foundation
- Problem research and persona definition
- System architecture design
- Core data models (User, Policy, Claim)
- Basic React UI shell
- FastAPI scaffold

### Phase 2 — Automation & Protection
- User registration + demo persona fast-entry
- Dynamic premium calculation via ML + weather
- Weekly policy purchase flow
- Zero-touch claim automation engine
- Fraud detection ML model integration
- Razorpay payment integration (test mode)
- Real-time dashboard polling

### Phase 3 — Scale & Optimise
- Admin disruption simulator (5 event types)
- Mass city-level simulation for all workers
- Advanced fraud scenarios (GPS spoof, repeated pattern)
- Admin Risk Desk with live charts (loss ratio, fraud vs genuine)
- Time-of-Day Volatility Protection
- Live OpenWeather API integration
- Predictive risk insights display

---

## System Architecture

The system uses real-time environmental data to trigger claims automatically,
while a multi-layer fraud detection engine assigns a risk score before payout.

```
[OpenWeather API] ─→ [Weather Service] ─→ [Passive Trigger Detection]
                                               │
[Admin Simulator] ─→ [Route: /admin/simulate/] ─→ [Claim Engine]
                                               │
                                         [Fraud Model (ML)]
                                               │
                                    ┌──────────┴──────────┐
                                  approved             flagged/delayed
                                    │
                              [Razorpay Order]
                                    │
                              [Payment Verify] → DB: status=paid
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register worker |
| POST | `/auth/login` | Login by phone |
| GET | `/policies/plans` | Available plans |
| POST | `/policies/calculate-premium` | Dynamic ML premium |
| POST | `/policies/purchase` | Buy/renew policy |
| GET | `/policies/active/{user_id}` | Active policy |
| GET | `/policies/claims/{user_id}` | Claim history |
| POST | `/policies/simulate-disruption/{user_id}` | Single user disruption |
| POST | `/policies/admin/simulate/{event}?city=X` | Mass city simulation |
| GET | `/policies/admin/stats` | Loss ratio + fraud stats |
| GET | `/policies/weather/{city}` | Live weather proxy |
| POST | `/policies/simulate/fraud-case/{type}` | Fraud scenario demo |
| POST | `/api/payments/create-order/{claim_id}` | Razorpay order |
| POST | `/api/payments/verify` | Payment verification |
| GET | `/api/payments/recent-payouts` | Payout history |

---

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## Git Repository
https://github.com/Rajbhandari107/GUIDEWIRE-HACKATHON

## Pitch Video Link
https://drive.google.com/file/d/1WYRMrpyMjJC1vgqnEff79H6lVm4SgsRF/view?usp=sharing
https://drive.google.com/file/d/1ytCGP2_7fMlPE7-MoTswfjG27soGLoym/view?usp=sharing

## Team MINI PEKKA
Buddham Rajbhandari · Aayush Pathak · Sneha Shariff · Achyut Poudel · Rahul Purbey
