from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_director_or_instructor
from app.models.instructor import Instructor
from app.models.staff_user import StaffUser, StaffRole
from app.schemas.instructor import InstructorCreate, InstructorUpdate, InstructorResponse

router = APIRouter(dependencies=[Depends(require_director_or_instructor)])


@router.get("", response_model=List[InstructorResponse])
async def list_instructors(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """조교 계정이 있는 조교 목록만 반환"""
    linked_ids = db.query(StaffUser.instructor_id).filter(
        StaffUser.instructor_id.isnot(None),
        StaffUser.role == StaffRole.instructor,
    )
    query = db.query(Instructor).filter(Instructor.id.in_(linked_ids))

    if status:
        query = query.filter(Instructor.status == status)

    return query.offset(skip).limit(limit).all()


@router.get("/{instructor_id}", response_model=InstructorResponse)
async def get_instructor(
    instructor_id: str = Path(..., description="Instructor ID"),
    db: Session = Depends(get_db)
):
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return instructor


@router.put("/{instructor_id}", response_model=InstructorResponse)
async def update_instructor(
    instructor_data: InstructorUpdate,
    instructor_id: str = Path(..., description="Instructor ID"),
    db: Session = Depends(get_db)
):
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    update_data = instructor_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(instructor, field, value)

    db.commit()
    db.refresh(instructor)
    return instructor


@router.delete("/{instructor_id}", status_code=204)
async def delete_instructor(
    instructor_id: str = Path(..., description="Instructor ID"),
    db: Session = Depends(get_db)
):
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    db.delete(instructor)
    db.commit()
    return None
