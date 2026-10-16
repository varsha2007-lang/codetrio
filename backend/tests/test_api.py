import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.main import app
from app import services

client = TestClient(app)


def test_payment_mismatch_and_extra_zero():
    response = client.post("/api/check-payment", json={"intended_amount": "500", "entered_amount": "5000", "recipient_name": "Asha"})
    assert response.status_code == 200
    assert response.json()["warning"] is True
    assert "₹500" in response.json()["warnings"][0]
    assert "₹5,000" in response.json()["warnings"][0]
    assert any("ten times" in warning for warning in response.json()["warnings"])


def test_equal_amount_has_no_amount_warning():
    data = client.post("/api/check-payment", json={"intended_amount": "500", "entered_amount": "500", "recipient_name": "Asha"}).json()
    assert data["warning"] is False
    assert data["warnings"] == []


def test_negative_amount_is_validation_error():
    response = client.post("/api/check-payment", json={"intended_amount": "-1", "entered_amount": "2", "recipient_name": "Asha"})
    assert response.status_code == 422


def test_otp_and_suspension_are_warning_signs(monkeypatch):
    monkeypatch.setenv("MODEL_PROVIDER", "none")
    result = client.post("/api/analyze-message", json={"message": "Share your OTP immediately or your account will be suspended."}).json()
    assert result["analysis_status"] == "AI analysis unavailable"
    assert len(result["warning_signs"]) >= 2
    assert result["risk_category"] == "High Concern"


def test_ordinary_bill_reminder_not_auto_flagged(monkeypatch):
    monkeypatch.setenv("MODEL_PROVIDER", "none")
    result = client.post("/api/analyze-message", json={"message": "Your electricity bill of ₹850 is due on 25 October. Please pay using your usual method."}).json()
    assert result["warning_signs"] == []
    assert result["risk_category"] == "Low Apparent Concern"


def test_unavailable_model_has_explicit_fallback(monkeypatch):
    monkeypatch.setenv("MODEL_PROVIDER", "none")
    result = client.post("/api/analyze-message", json={"message": "A routine payment notice."}).json()
    assert result["analysis_status"] == "AI analysis unavailable"
    assert "rule-based" in result["limitations"].lower()


def test_malformed_ai_response_is_caught(monkeypatch):
    monkeypatch.setattr(services, "_model_request", lambda *_: "not json")
    result = client.post("/api/analyze-message", json={"message": "Pay now at https://example.invalid"}).json()
    assert result["analysis_status"] == "AI response invalid"
    assert result["warning_signs"]
    assert "malformed" in result["limitations"].lower()


def test_quiz_scenarios_and_scoring():
    scenarios = client.get("/api/learning-scenarios").json()
    assert len(scenarios) == 5
    assert services.score_quiz([scenario["correct_index"] for scenario in scenarios]) == 5
    assert services.score_quiz([-1, -1, -1, -1, -1]) == 0
