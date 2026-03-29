"""
시험지 모델
"""
import enum
from sqlalchemy import Column, String, Integer, Text, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class QuestionType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    short_answer = "short_answer"


class Exam(Base, UUIDMixin, TimestampMixin):
    """시험지"""
    __tablename__ = "exams"

    title = Column(String(200), nullable=False, comment="시험 제목")

    questions = relationship(
        "ExamQuestion",
        back_populates="exam",
        cascade="all, delete-orphan",
        order_by="ExamQuestion.question_number",
    )
    submissions = relationship(
        "ExamSubmission",
        back_populates="exam",
        cascade="all, delete-orphan",
    )


class ExamQuestion(Base, UUIDMixin, TimestampMixin):
    """시험 문제"""
    __tablename__ = "exam_questions"

    exam_id = Column(
        String,
        ForeignKey("exams.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_number = Column(Integer, nullable=False, comment="문제 번호 (1~30)")
    question_type = Column(
        Enum(QuestionType),
        nullable=False,
        default=QuestionType.multiple_choice,
        comment="문제 유형",
    )
    correct_answer = Column(String(500), nullable=False, comment="정답")

    exam = relationship("Exam", back_populates="questions")


class ExamSubmission(Base, UUIDMixin, TimestampMixin):
    """학생 답안 제출"""
    __tablename__ = "exam_submissions"

    exam_id = Column(
        String,
        ForeignKey("exams.id", ondelete="CASCADE"),
        nullable=False,
    )
    student_user_id = Column(
        String,
        ForeignKey("student_users.id", ondelete="CASCADE"),
        nullable=False,
    )

    exam = relationship("Exam", back_populates="submissions")
    student_user = relationship("StudentUser")
    answers = relationship(
        "ExamAnswer",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="ExamAnswer.question_number",
    )


class ExamAnswer(Base, UUIDMixin, TimestampMixin):
    """제출된 개별 답안"""
    __tablename__ = "exam_answers"

    submission_id = Column(
        String,
        ForeignKey("exam_submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_number = Column(Integer, nullable=False)
    answer = Column(String(500), nullable=False)

    submission = relationship("ExamSubmission", back_populates="answers")
