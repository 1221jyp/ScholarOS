"""
자습 시간 API
수업 후 자습 시간을 관리하는 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_director_or_instructor
from app.models.study_session import StudySession
from app.models.instructor_assignment import InstructorAssignment
from app.schemas.study_session import (
    StudySessionCreate,
    StudySessionUpdate,
    StudySessionResponse
)

router = APIRouter(dependencies=[Depends(require_director_or_instructor)])


@router.post("", response_model=StudySessionResponse, status_code=201)
def create_study_session(
    session: StudySessionCreate,
    db: Session = Depends(get_db)
):
    """자습 시간 생성"""
    db_session = StudySession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.get("", response_model=List[StudySessionResponse])
def list_study_sessions(
    skip: int = 0,
    limit: int = 100,
    is_active: bool = None,
    db: Session = Depends(get_db)
):
    """자습 시간 목록 조회"""
    query = db.query(StudySession)

    if is_active is not None:
        query = query.filter(StudySession.is_active == is_active)

    sessions = query.offset(skip).limit(limit).all()
    return sessions


@router.get("/{session_id}", response_model=StudySessionResponse)
def get_study_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """자습 시간 상세 조회"""
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    return session


@router.put("/{session_id}", response_model=StudySessionResponse)
def update_study_session(
    session_id: str,
    session_update: StudySessionUpdate,
    db: Session = Depends(get_db)
):
    """자습 시간 수정"""
    db_session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Study session not found")

    update_data = session_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_session, field, value)

    db.commit()
    db.refresh(db_session)
    return db_session


@router.delete("/{session_id}", status_code=204)
def delete_study_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """자습 시간 삭제"""
    db_session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Study session not found")

    # SQLite는 FK cascade가 비활성화이므로 연관 배치를 먼저 삭제
    db.query(InstructorAssignment).filter(
        InstructorAssignment.study_session_id == session_id
    ).delete(synchronize_session=False)
    db.delete(db_session)
    db.commit()
    return None
