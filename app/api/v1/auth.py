from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_staff_user, require_director, get_current_student_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.staff_user import StaffUser, StaffRole
from app.models.student_user import StudentUser
from app.schemas.auth import (
    LoginRequest, TokenResponse,
    StaffUserCreate, StaffUserUpdate, StaffUserResponse,
    StudentUserCreate, StudentUserUpdate, StudentUserResponse,
    ChangePasswordRequest,
)

router = APIRouter()


# ──────────────── 로그인 ────────────────

@router.post("/staff/login", response_model=TokenResponse)
async def staff_login(login: LoginRequest, db: Session = Depends(get_db)):
    """직원(원장/조교) 로그인"""
    user = db.query(StaffUser).filter(StaffUser.username == login.username).first()
    if not user or not verify_password(login.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="비활성화된 계정입니다.")

    token = create_access_token({"sub": user.id}, user_type="staff")
    return TokenResponse(
        access_token=token,
        user_type="staff",
        role=user.role.value,
        name=user.name,
        user_id=user.id,
    )


@router.post("/student/login", response_model=TokenResponse)
async def student_login(login: LoginRequest, db: Session = Depends(get_db)):
    """학생 로그인"""
    user = db.query(StudentUser).filter(StudentUser.username == login.username).first()
    if not user or not verify_password(login.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="비활성화된 계정입니다.")

    token = create_access_token({"sub": user.id}, user_type="student")
    return TokenResponse(
        access_token=token,
        user_type="student",
        role=None,
        name=user.name,
        user_id=user.id,
    )


# ──────────────── 내 정보 ────────────────

@router.get("/me")
async def get_me(current_user: StaffUser = Depends(get_current_staff_user)):
    """현재 로그인한 직원 정보"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "role": current_user.role.value,
        "user_type": "staff",
    }


@router.put("/me/password", status_code=204)
async def change_my_password(
    req: ChangePasswordRequest,
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
):
    """비밀번호 변경 (직원용)"""
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 올바르지 않습니다.")
    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return None


# ──────────────── 직원 계정 관리 (원장 전용) ────────────────

@router.get("/staff-users", response_model=List[StaffUserResponse])
async def list_staff_users(
    db: Session = Depends(get_db),
    _: StaffUser = Depends(require_director),
):
    return db.query(StaffUser).all()


@router.post("/staff-users", response_model=StaffUserResponse, status_code=201)
async def create_staff_user(
    data: StaffUserCreate,
    db: Session = Depends(get_db),
    _: StaffUser = Depends(require_director),
):
    if db.query(StaffUser).filter(StaffUser.username == data.username).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다.")

    user = StaffUser(
        username=data.username,
        hashed_password=get_password_hash(data.password),
        name=data.name,
        role=data.role,
        instructor_id=data.instructor_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/staff-users/{user_id}", response_model=StaffUserResponse)
async def update_staff_user(
    user_id: str,
    data: StaffUserUpdate,
    db: Session = Depends(get_db),
    _: StaffUser = Depends(require_director),
):
    user = db.query(StaffUser).filter(StaffUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if data.name is not None:
        user.name = data.name
    if data.password is not None:
        user.hashed_password = get_password_hash(data.password)
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.instructor_id is not None:
        user.instructor_id = data.instructor_id

    db.commit()
    db.refresh(user)
    return user


@router.delete("/staff-users/{user_id}", status_code=204)
async def delete_staff_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: StaffUser = Depends(require_director),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="자기 자신은 삭제할 수 없습니다.")
    user = db.query(StaffUser).filter(StaffUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    db.delete(user)
    db.commit()
    return None


# ──────────────── 학생 계정 관리 (원장 전용) ────────────────

@router.get("/student-users", response_model=List[StudentUserResponse])
async def list_student_users(
    db: Session = Depends(get_db),
    _: StaffUser = Depends(require_director),
):
    return db.query(StudentUser).all()


@router.post("/student-users", response_model=StudentUserResponse, status_code=201)
async def create_student_user(
    data: StudentUserCreate,
    db: Session = Depends(get_db),
    _: StaffUser = Depends(require_director),
):
    if db.query(StudentUser).filter(StudentUser.username == data.username).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다.")

    user = StudentUser(
        username=data.username,
        hashed_password=get_password_hash(data.password),
        name=data.name,
        student_id=data.student_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/student-users/{user_id}", response_model=StudentUserResponse)
async def update_student_user(
    user_id: str,
    data: StudentUserUpdate,
    db: Session = Depends(get_db),
    _: StaffUser = Depends(require_director),
):
    user = db.query(StudentUser).filter(StudentUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if data.name is not None:
        user.name = data.name
    if data.password is not None:
        user.hashed_password = get_password_hash(data.password)
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.student_id is not None:
        user.student_id = data.student_id

    db.commit()
    db.refresh(user)
    return user


@router.delete("/student-users/{user_id}", status_code=204)
async def delete_student_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: StaffUser = Depends(require_director),
):
    user = db.query(StudentUser).filter(StudentUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    db.delete(user)
    db.commit()
    return None
