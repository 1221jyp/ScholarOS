from pydantic import BaseModel
from typing import Optional
from app.models.staff_user import StaffRole


# ──────────────── 로그인 ────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str        # "staff" | "student"
    role: Optional[str]   # "director" | "instructor" | None(학생)
    name: str
    user_id: str
    instructor_id: Optional[str] = None  # 조교인 경우만


# ──────────────── 직원(원장/조교) 계정 ────────────────

class StaffUserCreate(BaseModel):
    username: str
    password: str
    name: str
    role: StaffRole
    phone: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None


class StaffUserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[StaffRole] = None
    is_active: Optional[bool] = None


class StaffUserResponse(BaseModel):
    id: str
    username: str
    name: str
    role: StaffRole
    is_active: bool
    instructor_id: Optional[str] = None

    model_config = {"from_attributes": True}


# ──────────────── 학생 계정 ────────────────

class StudentUserCreate(BaseModel):
    username: str
    password: str
    name: str
    phone: Optional[str] = None


class StudentUserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class StudentUserResponse(BaseModel):
    id: str
    username: str
    name: str
    is_active: bool
    student_id: Optional[str] = None

    model_config = {"from_attributes": True}


# ──────────────── 비밀번호 변경 ────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
