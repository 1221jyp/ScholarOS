from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.api.deps import get_db, require_director_or_instructor
from app.models.student import Student
from app.models.student_user import StudentUser
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse

router = APIRouter(dependencies=[Depends(require_director_or_instructor)])


@router.get("", response_model=List[StudentResponse])
async def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """계정이 있는 학생 목록만 반환"""
    linked_ids = db.query(StudentUser.student_id).filter(StudentUser.student_id.isnot(None))
    query = db.query(Student).filter(Student.id.in_(linked_ids))

    if status:
        query = query.filter(Student.status == status)

    return query.offset(skip).limit(limit).all()


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: UUID = Path(..., description="Student ID"),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_data: StudentUpdate,
    student_id: UUID = Path(..., description="Student ID"),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=204)
async def delete_student(
    student_id: UUID = Path(..., description="Student ID"),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return None
