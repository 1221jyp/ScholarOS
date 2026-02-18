@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ========================================
echo   ScholarOS 시작
echo ========================================
echo.

REM Python 확인
python --version > nul 2>&1
if errorlevel 1 (
    echo [오류] Python이 설치되지 않았습니다.
    echo install.bat 을 먼저 실행해주세요.
    pause
    exit /b 1
)

REM .env 파일 확인
if not exist .env (
    if exist .env.example (
        copy .env.example .env > nul
    ) else (
        echo [오류] .env 파일이 없습니다. install.bat 을 먼저 실행해주세요.
        pause
        exit /b 1
    )
)

echo ScholarOS 서버를 시작합니다...
echo 브라우저에서 http://localhost:8000 으로 접속하세요.
echo.
echo [서버를 종료하려면 이 창을 닫으세요]
echo.

REM 브라우저 자동 열기 (2초 후)
start /b cmd /c "timeout /t 2 /nobreak > nul && start http://localhost:8000"

REM 서버 시작
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
