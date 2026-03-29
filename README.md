# ScholarOS - 학원 관리 시스템

수학 학원의 조교 배치, 학생 관리, 시험 관리를 통합한 시스템입니다.

---

## 빠른 시작 (macOS/Linux)

### 학원 영업 시작 (노트북 켤 때)

```bash
./start.sh
```

실행하면:
- ✅ Backend 서버 시작
- ✅ Cloudflare Tunnel 시작 (외부 접속 가능)
- 🌐 **학생 접속 URL이 화면에 표시됩니다**

**표시된 URL을 학생들에게 공유하세요!**

---

### 학원 영업 종료 (노트북 끌 때)

```bash
./stop.sh
```

---

### 현재 상태 확인

```bash
./status.sh
```

---

## 접속 방법

### 관리자 (원장/조교)
- **로컬**: http://localhost:8000
- **외부**: start.sh 실행 시 표시된 URL
- 로그인: "선생/조교" 탭
- 초기 계정: .env 파일 참고

### 학생
- **외부**: start.sh 실행 시 표시된 URL
- 로그인: "학생" 탭
- 계정: 원장이 생성

---

## ⚠️ 중요: URL이 매번 바뀝니다

현재는 임시 Quick Tunnel을 사용하므로 시작할 때마다 새 URL이 생성됩니다.

**고정 URL을 원하면:** `TUNNEL_SETUP.md` 참고 (도메인 설정 필요)

---

## 주요 기능

- **조교 배치 관리**: 주간 캘린더로 자습 시간별 조교 배치 현황 확인 및 설정
- **조교 관리**: 조교(강사) 목록 관리
- **학생 관리**: 학생 정보 관리
- **출석 관리**: 학생 출석 기록
- **성적 관리**: 학생 성적 기록

---

## 기술 스택 (개발자용 참고)

- **백엔드**: Python + FastAPI
- **프론트엔드**: React + Tailwind CSS
- **데이터베이스**: SQLite (별도 설치 불필요)
- **API 문서**: 서버 실행 후 http://localhost:8000/docs

### 개발 환경 실행

```bash
# 백엔드
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# 프론트엔드 (개발 시)
cd frontend
npm install
npm run dev

# 프론트엔드 빌드 (배포용)
cd frontend
npm run build
```
