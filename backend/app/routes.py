"""HTTP routes and request/response handling."""

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from .schemas import AnalyzeRequest, PaymentCheckRequest, SafetyQuestion
from .services import analyze_message, ask_safety, check_payment, learning_scenarios

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "PayGuard AI"}


@router.post("/analyze-message")
def analyze(payload: AnalyzeRequest) -> dict:
    try:
        return analyze_message(payload.message)
    except (ValueError, ValidationError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/check-payment")
def payment_check(payload: PaymentCheckRequest) -> dict:
    try:
        return check_payment(payload.intended_amount, payload.entered_amount, payload.recipient_name)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/ask-safety")
def safety_answer(payload: SafetyQuestion) -> dict[str, str]:
    return ask_safety(payload.question)


@router.get("/learning-scenarios")
def scenarios() -> list[dict]:
    return learning_scenarios()
