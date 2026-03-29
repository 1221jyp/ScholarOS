"""
시험지 API
- 직원(원장/조교): 시험 생성, 조회, 삭제 / 제출 목록 조회
- 학생: 시험 목록 및 상세 조회, 답안 제출, 본인 결과 조회
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_director_or_instructor, get_current_student_user
from app.models.exam import Exam, ExamQuestion, ExamSubmission, ExamAnswer, QuestionType
from app.models.student_user import StudentUser
from app.schemas.exam import (
    ExamCreate,
    ExamListItem,
    ExamResponse,
    ExamStudentResponse,
    ExamSubmitRequest,
    ExamSubmissionResponse,
    MySubmissionResponse,
    ExamAnswerResult,
)

router = APIRouter()


def _build_answer_results(submission: ExamSubmission) -> tuple[list, int, int, int]:
    """제출 답안을 결과 리스트로 변환. (answers, auto_score, total_mc, total_sa) 반환"""
    question_map = {q.question_number: q for q in submission.exam.questions}
    results = []
    auto_score = 0
    total_mc = 0
    total_sa = 0

    for ans in submission.answers:
        q = question_map.get(ans.question_number)
        if not q:
            continue
        if q.question_type == QuestionType.multiple_choice:
            total_mc += 1
            is_correct = ans.answer.strip() == q.correct_answer.strip()
            if is_correct:
                auto_score += 1
        else:
            total_sa += 1
            is_correct = None

        results.append(ExamAnswerResult(
            question_number=ans.question_number,
            answer=ans.answer,
            correct_answer=q.correct_answer,
            question_type=q.question_type,
            is_correct=is_correct,
        ))

    return results, auto_score, total_mc, total_sa


# ────────────────────────────────────────────────────────
# 직원 전용 엔드포인트
# ────────────────────────────────────────────────────────

@router.get("/staff", response_model=List[ExamListItem])
def list_exams_staff(
    db: Session = Depends(get_db),
    _: object = Depends(require_director_or_instructor),
):
    exams = db.query(Exam).order_by(Exam.created_at.desc()).all()
    return [
        ExamListItem(
            id=e.id,
            title=e.title,
            question_count=len(e.questions),
            created_at=e.created_at,
        )
        for e in exams
    ]


@router.post("/staff", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    payload: ExamCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_director_or_instructor),
):
    if len(payload.questions) > 30:
        raise HTTPException(status_code=400, detail="문제 수는 최대 30개입니다.")

    nums = [q.question_number for q in payload.questions]
    if len(nums) != len(set(nums)):
        raise HTTPException(status_code=400, detail="문제 번호가 중복되었습니다.")

    exam = Exam(title=payload.title)
    db.add(exam)
    db.flush()

    for q in payload.questions:
        db.add(ExamQuestion(
            exam_id=exam.id,
            question_number=q.question_number,
            question_type=q.question_type,
            correct_answer=q.correct_answer,
        ))

    db.commit()
    db.refresh(exam)
    return exam


@router.get("/staff/{exam_id}", response_model=ExamResponse)
def get_exam_staff(
    exam_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_director_or_instructor),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="시험을 찾을 수 없습니다.")
    return exam


@router.delete("/staff/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_director_or_instructor),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="시험을 찾을 수 없습니다.")
    db.delete(exam)
    db.commit()


@router.get("/staff/{exam_id}/submissions", response_model=List[ExamSubmissionResponse])
def list_submissions(
    exam_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_director_or_instructor),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="시험을 찾을 수 없습니다.")

    submissions = (
        db.query(ExamSubmission)
        .filter(ExamSubmission.exam_id == exam_id)
        .order_by(ExamSubmission.created_at.desc())
        .all()
    )
    result = []
    for sub in submissions:
        answers, auto_score, total_mc, total_sa = _build_answer_results(sub)
        result.append(ExamSubmissionResponse(
            id=sub.id,
            exam_id=exam_id,
            exam_title=exam.title,
            student_name=sub.student_user.name,
            submitted_at=sub.created_at,
            answers=answers,
            auto_score=auto_score,
            total_mc=total_mc,
            total_sa=total_sa,
        ))
    return result


# ────────────────────────────────────────────────────────
# 학생 전용 엔드포인트
# ────────────────────────────────────────────────────────

@router.get("/student", response_model=List[ExamListItem])
def list_exams_student(
    db: Session = Depends(get_db),
    current_student: StudentUser = Depends(get_current_student_user),
):
    exams = db.query(Exam).order_by(Exam.created_at.desc()).all()
    return [
        ExamListItem(
            id=e.id,
            title=e.title,
            question_count=len(e.questions),
            created_at=e.created_at,
        )
        for e in exams
    ]


@router.get("/student/{exam_id}", response_model=ExamStudentResponse)
def get_exam_student(
    exam_id: str,
    db: Session = Depends(get_db),
    current_student: StudentUser = Depends(get_current_student_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="시험을 찾을 수 없습니다.")
    return exam


@router.post("/student/{exam_id}/submit", response_model=MySubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_exam(
    exam_id: str,
    payload: ExamSubmitRequest,
    db: Session = Depends(get_db),
    current_student: StudentUser = Depends(get_current_student_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="시험을 찾을 수 없습니다.")

    existing = (
        db.query(ExamSubmission)
        .filter(
            ExamSubmission.exam_id == exam_id,
            ExamSubmission.student_user_id == current_student.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="이미 제출한 시험입니다.")

    submission = ExamSubmission(
        exam_id=exam_id,
        student_user_id=current_student.id,
    )
    db.add(submission)
    db.flush()

    for ans in payload.answers:
        db.add(ExamAnswer(
            submission_id=submission.id,
            question_number=ans.question_number,
            answer=ans.answer,
        ))

    db.commit()
    db.refresh(submission)

    answers, auto_score, total_mc, total_sa = _build_answer_results(submission)
    return MySubmissionResponse(
        id=submission.id,
        exam_id=exam_id,
        exam_title=exam.title,
        submitted_at=submission.created_at,
        answers=answers,
        auto_score=auto_score,
        total_mc=total_mc,
        total_sa=total_sa,
    )


@router.get("/student/{exam_id}/my-submission", response_model=MySubmissionResponse)
def get_my_submission(
    exam_id: str,
    db: Session = Depends(get_db),
    current_student: StudentUser = Depends(get_current_student_user),
):
    submission = (
        db.query(ExamSubmission)
        .filter(
            ExamSubmission.exam_id == exam_id,
            ExamSubmission.student_user_id == current_student.id,
        )
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="제출 내역이 없습니다.")

    answers, auto_score, total_mc, total_sa = _build_answer_results(submission)
    return MySubmissionResponse(
        id=submission.id,
        exam_id=exam_id,
        exam_title=submission.exam.title,
        submitted_at=submission.created_at,
        answers=answers,
        auto_score=auto_score,
        total_mc=total_mc,
        total_sa=total_sa,
    )
