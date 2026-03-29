# ScholarOS — 학원 관리 시스템

수학 학원의 조교 배치·학생·시험 관리 통합 시스템.

## 기술 스택

- **백엔드**: Python FastAPI + SQLite (Alembic 마이그레이션)
- **프론트엔드**: React + Tailwind CSS (Vite 빌드)
- **인증**: JWT 토큰, 역할: `director`(원장) / `instructor`(조교) / `student`(학생)
- **배포**: fly.io (`fly deploy --app scholarios --local-only`)

## 디렉터리 구조

```
app/
  main.py              # FastAPI 앱, 라우터 등록, 초기 원장 계정 생성
  api/v1/              # REST 엔드포인트 (students, instructors, study_sessions, instructor_assignments, exams, time_records, auth 등)
  models/              # SQLAlchemy 모델
  schemas/             # Pydantic 스키마
  core/security.py     # JWT, 비밀번호 해싱
alembic/versions/      # DB 마이그레이션 파일
frontend/src/
  pages/               # 페이지 컴포넌트 (Dashboard, Instructors, Exams, InstructorTimeManagement 등)
  components/Calendar/ # WeeklyCalendar, AssignmentModal
  contexts/AuthContext.jsx
  services/api.js      # axios API 클라이언트
  utils/dateHelpers.js # 날짜 유틸 (getWeekDates, formatDate, getDayOfWeekKorean)
```

## 핵심 데이터 모델

- **StudySession**: `day_of_week`(0=월~6=일), `start_time`, `end_time`, `name`
- **InstructorAssignment**: `study_session_id`, `instructor_id`, `assignment_date`
- **InstructorTimeRecord**: 조교 근무 시간 기록, 정산용
- **Exam / ExamSubmission**: 시험 관리

## 요일 인덱스 규칙

`DAY_OF_WEEK_MAP` (dateHelpers.js): 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
`getWeekDates()` 는 월요일 시작 7일 배열 반환.
WeeklyCalendar는 `weekDates.slice(0, 7)` 로 월~일 전체 표시 (토=파란색, 일=빨간색).

## 시간 슬롯

`TIME_SLOTS`: 09:00~22:00, 30분 단위 (27슬롯). `UNIT_HEIGHT = 64px`.

## 자주 쓰는 명령

```bash
# 개발 서버
cd frontend && npm run dev        # 프론트 (port 5173)
uvicorn app.main:app --reload     # 백엔드 (port 8000)

# 프론트 빌드 (배포 전)
cd frontend && npm run build

# DB 마이그레이션 추가
alembic revision --autogenerate -m "설명"
alembic upgrade head
```

## API 패턴

- 모든 엔드포인트: `/api/v1/{resource}`
- 인증 필요 시: `Authorization: Bearer <token>` 헤더
- API 문서: `http://localhost:8000/docs`
