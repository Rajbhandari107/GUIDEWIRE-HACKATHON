# GUIDEWIRE-HACKATHON

GigInsure

AI-powered income protection for food delivery workers

Requirement and Persona-Based Scenario

Food delivery partners working with platforms like Swiggy and Zomato earn only when they are actively delivering orders. Their income is directly affected by external conditions like weather, pollution, or city restrictions.

Take a simple example.

Ravi is a Swiggy delivery partner in Chennai. On a normal day, he earns around ₹500 by completing 15–20 deliveries. But during heavy rain or flooding:

roads become unsafe

restaurants close early

order demand drops

On such days, his income can fall to ₹0–₹200.

Over a week:

expected income is around ₹3000

actual income drops to around ₹1000

loss is nearly ₹2000

The problem is that this loss happens due to reasons outside his control, and there is currently no insurance that covers this type of income loss.

GigInsure is designed to solve this by providing a safety net specifically for gig workers.

Application Workflow

The platform is designed to be simple and automatic so that workers do not have to deal with complex insurance processes.

The flow is as follows:

User registers with basic details like location and platform

System calculates risk and suggests a weekly plan

User purchases the plan

Coverage becomes active for that week

System continuously monitors external data (weather, pollution, alerts)

If disruption occurs, claim is triggered automatically

Fraud check is performed

Payout is processed instantly

The key idea is that the worker does not need to file any claim manually.

Weekly Premium Model and Parametric Triggers

GigInsure follows a weekly pricing model, since gig workers typically operate week-to-week.

Weekly Plans

₹15 per week → coverage up to ₹500

₹20 per week → coverage up to ₹800

₹25 per week → coverage up to ₹1200

This keeps the insurance affordable and aligned with their earning pattern.

Parametric Triggers

Instead of manual claims, payouts are triggered automatically based on real-world conditions.

The system monitors:

Rainfall levels

Temperature

Air quality index

Flood alerts

Trigger examples:

Heavy rain → rainfall above threshold

Extreme heat → temperature above safe limit

Pollution → AQI in hazardous range

Flood → official alert in city

Once a condition is met:

system detects disruption

claim is generated

payout is processed

Platform Choice

We are building this as a web application.

Reason:

faster to develop within hackathon time

works on both mobile and desktop

no installation required

easier to demonstrate

AI and ML Integration

AI is used in two main areas.

1. Premium Calculation

The system uses data such as:

location

historical weather patterns

frequency of disruptions

Based on this, it calculates a fair weekly premium for each user.

2. Fraud Detection

To prevent misuse, the system checks:

mismatch between claim and weather data

suspicious location activity

repeated or duplicate claims

This is done using anomaly detection and rule-based validation.

Tech Stack

Frontend: React with Tailwind CSS

Backend: FastAPI (Python)

Database: PostgreSQL

AI Models: Scikit-learn

APIs: Weather API and AQI API

Payments: Razorpay sandbox

Deployment: Vercel or Render

Development Plan
Phase 1 (Weeks 1–2)

problem understanding

system design

define insurance model

basic UI prototype

Phase 2 (Weeks 3–4)

user registration

policy system

premium calculation

claim automation

Phase 3 (Weeks 5–6)

fraud detection

payout simulation

analytics dashboard

final demo

Final Idea

GigInsure focuses on one simple goal:

Helping food delivery workers stay financially stable even when they cannot work due to external disruptions.

It removes the complexity of insurance and replaces it with an automated, AI-driven system that works in the background.
