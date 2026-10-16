from typing import Literal

from pydantic import BaseModel, Field, field_validator

RiskCategory = Literal["Low Apparent Concern", "Needs Verification", "High Concern"]


class AnalyzeRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Message cannot be empty.")
        return value.strip()


class ScamAnalysis(BaseModel):
    risk_category: RiskCategory
    warning_signs: list[str]
    evidence_from_message: list[str]
    explanation: str
    recommended_actions: list[str]
    educational_tip: str
    limitations: str
    analysis_status: Literal["AI analysis complete", "AI analysis unavailable", "AI response invalid"]


class PaymentCheckRequest(BaseModel):
    intended_amount: str = Field(min_length=1, max_length=40)
    entered_amount: str = Field(min_length=1, max_length=40)
    recipient_name: str = Field(default="", max_length=120)


class PaymentCheckResponse(BaseModel):
    valid: bool
    warning: bool
    warnings: list[str]
    intended_amount: float
    entered_amount: float
    recipient_name: str
    next_steps: list[str]


class SafetyQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=2000)

    @field_validator("question")
    @classmethod
    def question_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Question cannot be empty.")
        return value.strip()


class SafetyAnswer(BaseModel):
    answer: str
    analysis_status: Literal["AI answer", "AI unavailable; general guidance"]
    safety_reminder: str


class LearningScenario(BaseModel):
    id: str
    title: str
    message: str
    choices: list[str]
    correct_index: int
    explanation: str
