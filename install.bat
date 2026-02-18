@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ========================================
echo   ScholarOS 초기 설치
echo ========================================
echo.

REM Python 확인
python --version > nul 2>&1
if errorlevel 1 (
    echo [오류] Python이 설치되지 않았습니다.
    echo Python 3.10 이상을 설치해주세요: https://www.python.org/downloads/
    echo 설치 시 "Add Python to PATH" 옵션을 반드시 체크하세요.
    pause
    exit /b 1
)

echo [1/2] Python 라이브러리 설치 중...
pip install -r requirements.txt
if errorlevel 1 (
    echo [오류] 라이브러리 설치에 실패했습니다.
    pause
    exit /b 1
)

REM .env 파일 생성
if not exist .env (
    echo [2/2] 설정 파일 생성 중...
    copy .env.example .env > nul
    echo     .env 파일이 생성되었습니다.
) else (
    echo [2/2] 설정 파일이 이미 존재합니다. 건너뜁니다.
)

echo.
echo ========================================
echo   설치 완료!
echo   이제 start.bat 을 실행하세요.
echo ========================================
pause
