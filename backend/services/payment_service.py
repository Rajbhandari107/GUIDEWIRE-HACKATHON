import os
import razorpay
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_Se7f1RR35OMF2M")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "cdcHTwqnvEDNoZ4zjY8pM2jZ")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_claim_payout(amount: float, claim_id: int, user_id: int):
    """
    Creates a Razorpay order to simulate a claim payout via checkout.
    Amount should be in INR rupees, which we convert to paise.
    """
    amount_in_paise = int(amount * 100)

    order_data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": f"claim_{claim_id}_{user_id}"
    }

    order = client.order.create(data=order_data)

    return {
        "order_id": order["id"],
        "amount": amount_in_paise,
        "currency": "INR",
        "key": RAZORPAY_KEY_ID
    }

def verify_payment(payment_id: str, order_id: str, signature: str):
    """
    Verifies the Razorpay payment signature using razorpay 2.x SDK.
    Raises an error if the signature is invalid.
    """
    if str(payment_id).startswith("demo_payout_"):
        # Demo/Test mode bypass for hackathon presentations
        return True

    import hmac
    import hashlib

    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != signature:
        raise ValueError("Payment signature verification failed")

    return True
