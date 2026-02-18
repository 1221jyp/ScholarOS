import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.database import SessionLocal
from app.core.security import get_password_hash
from app.api.v1 import (
    students,
    instructors,
    class_schedules,
    study_sessions,
    instructor_assignments,
    attendance,
    grades,
    auth,
)

# Create FastAPI application
app = FastAPI(
    title="ScholarOS",
    description="수학 학원 관리 시스템 - 조교 배치 관리",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(
    students.router,
    prefix="/api/v1/students",
    tags=["Students"]
)

app.include_router(
    instructors.router,
    prefix="/api/v1/instructors",
    tags=["Instructors"]
)

app.include_router(
    class_schedules.router,
    prefix="/api/v1/class-schedules",
    tags=["Class Schedules"]
)

app.include_router(
    study_sessions.router,
    prefix="/api/v1/study-sessions",
    tags=["Study Sessions"]
)

app.include_router(
    instructor_assignments.router,
    prefix="/api/v1/instructor-assignments",
    tags=["Instructor Assignments"]
)

app.include_router(
    attendance.router,
    prefix="/api/v1/attendance",
    tags=["Attendance"]
)

app.include_router(
    grades.router,
    prefix="/api/v1/grades",
    tags=["Grades"]
)

app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Auth"]
)


@app.on_event("startup")
async def create_initial_admin():
    """서버 첫 실행 시 원장 계정이 없으면 자동 생성"""
    from app.models.staff_user import StaffUser, StaffRole
    db = SessionLocal()
    try:
        existing = db.query(StaffUser).filter(StaffUser.role == StaffRole.director).first()
        if not existing:
            admin = StaffUser(
                username=settings.INITIAL_ADMIN_USERNAME,
                hashed_password=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
                name=settings.INITIAL_ADMIN_NAME,
                role=StaffRole.director,
            )
            db.add(admin)
            db.commit()
            print(f"[ScholarOS] 초기 원장 계정이 생성되었습니다: {settings.INITIAL_ADMIN_USERNAME}")
    finally:
        db.close()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ScholarOS",
        "version": "2.0.0"
    }


# 빌드된 프론트엔드 정적 파일 서빙 (프로덕션용)
_dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")
if os.path.exists(_dist_path):
    _assets_path = os.path.join(_dist_path, "assets")
    if os.path.exists(_assets_path):
        app.mount("/assets", StaticFiles(directory=_assets_path), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        return FileResponse(os.path.join(_dist_path, "index.html"))

    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(os.path.join(_dist_path, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
