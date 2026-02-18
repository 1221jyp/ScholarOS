from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.core.security import decode_token
from app.models.staff_user import StaffUser, StaffRole
from app.models.student_user import StudentUser

bearer_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _extract_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증이 필요합니다.")
    return credentials.credentials


def get_current_staff_user(
    token: str = Depends(_extract_token),
    db: Session = Depends(get_db),
) -> StaffUser:
    payload = decode_token(token)
    if not payload or payload.get("user_type") != "staff":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 인증 정보입니다.")

    user_id = payload.get("sub")
    user = db.query(StaffUser).filter(StaffUser.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="계정을 찾을 수 없거나 비활성화된 계정입니다.")
    return user


def require_director(
    current_user: StaffUser = Depends(get_current_staff_user),
) -> StaffUser:
    if current_user.role != StaffRole.director:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="원장만 접근할 수 있습니다.")
    return current_user


def require_director_or_instructor(
    current_user: StaffUser = Depends(get_current_staff_user),
) -> StaffUser:
    # StaffUser이면 모두 허용 (director + instructor)
    return current_user


def get_current_student_user(
    token: str = Depends(_extract_token),
    db: Session = Depends(get_db),
) -> StudentUser:
    payload = decode_token(token)
    if not payload or payload.get("user_type") != "student":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 인증 정보입니다.")

    user_id = payload.get("sub")
    user = db.query(StudentUser).filter(StudentUser.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="계정을 찾을 수 없거나 비활성화된 계정입니다.")
    return user
