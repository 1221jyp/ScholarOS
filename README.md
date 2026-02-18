# ScholarOS - 학원 조교 배치 관리 시스템

수학 학원의 자습 시간 조교 배치를 관리하는 프로그램입니다.

---

## 처음 설치하기 (최초 1회)

### 1단계: Python 설치

[Python 공식 사이트](https://www.python.org/downloads/)에서 Python 3.10 이상을 다운로드하여 설치합니다.

> **중요**: 설치 중 **"Add Python to PATH"** 체크박스를 반드시 체크하세요.

### 2단계: 프로그램 다운로드

이 페이지 상단의 **Code → Download ZIP** 버튼을 눌러 다운로드한 후, 원하는 폴더에 압축을 해제합니다.

### 3단계: 설치 실행

압축 해제한 폴더에서 **`install.bat`** 파일을 더블클릭합니다.

설치 완료 메시지가 뜨면 아무 키나 눌러 창을 닫습니다.

---

## 프로그램 실행하기

**`start.bat`** 파일을 더블클릭합니다.

잠시 후 브라우저에서 프로그램이 자동으로 열립니다.

> 프로그램을 종료하려면 열린 검은색 창(서버 창)을 닫으세요.

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
