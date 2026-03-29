from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.exam import QuestionType


# ─── 문제 ────────────────────────────────────────────────
class ExamQuestionCreate(BaseModel):
    question_number: int = Field(..., ge=1, le=30)
    question_type: QuestionType = QuestionType.multiple_choice
    correct_answer: str = Field(..., min_length=1, max_length=500)


class ExamQuestionResponse(BaseModel):
    id: str
    question_number: int
    question_type: QuestionType
    correct_answer: str

    class Config:
        from_attributes = True


class ExamQuestionStudentResponse(BaseModel):
    """학생용 – 정답 미포함"""
    id: str
    question_number: int
    question_type: QuestionType

    class Config:
        from_attributes = True


# ─── 시험 ────────────────────────────────────────────────
class ExamCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    questions: List[ExamQuestionCreate] = Field(..., min_length=1, max_length=30)


class ExamListItem(BaseModel):
    id: str
    title: str
    question_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExamResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    questions: List[ExamQuestionResponse]

    class Config:
        from_attributes = True


class ExamStudentResponse(BaseModel):
    """학생용 – 정답 미포함"""
    id: str
    title: str
    created_at: datetime
    questions: List[ExamQuestionStudentResponse]

    class Config:
        from_attributes = True


# ─── 제출 ────────────────────────────────────────────────
class ExamAnswerSubmit(BaseModel):
    question_number: int = Field(..., ge=1, le=30)
    answer: str = Field(..., max_length=500)


class ExamSubmitRequest(BaseModel):
    answers: List[ExamAnswerSubmit]


class ExamAnswerResult(BaseModel):
    question_number: int
    answer: str
    correct_answer: str
    question_type: QuestionType
    is_correct: Optional[bool]  # 객관식만 자동 채점; 주관식은 None

    class Config:
        from_attributes = True


class ExamSubmissionResponse(BaseModel):
    id: str
    exam_id: str
    exam_title: str
    student_name: str
    submitted_at: datetime
    answers: List[ExamAnswerResult]
    auto_score: int    # 객관식 정답 수
    total_mc: int      # 객관식 문제 수
    total_sa: int      # 주관식 문제 수

    class Config:
        from_attributes = True


class MySubmissionResponse(BaseModel):
    """학생 본인 제출 결과 (정답 포함)"""
    id: str
    exam_id: str
    exam_title: str
    submitted_at: datetime
    answers: List[ExamAnswerResult]
    auto_score: int
    total_mc: int
    total_sa: int

    class Config:
        from_attributes = True
