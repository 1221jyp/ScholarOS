#!/bin/bash
# ScholarOS 서버 종료

cd "$(dirname "$0")"

echo "ScholarOS 종료 중..."

if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        kill $BACKEND_PID
        sleep 1
        if ps -p $BACKEND_PID > /dev/null; then
            kill -9 $BACKEND_PID
        fi
        echo "Backend 종료됨"
    else
        echo "Backend가 이미 종료됨"
    fi
    rm .backend.pid
else
    pkill -f "uvicorn app.main:app" && echo "Backend 프로세스 종료됨"
fi

echo "종료 완료"
