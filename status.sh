#!/bin/bash
# ScholarOS 상태 확인

cd "$(dirname "$0")"

echo "========================================="
echo "  ScholarOS 상태"
echo "========================================="
echo ""

echo "Backend 서버:"
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "  실행 중 (PID: $BACKEND_PID)"
        if curl -s http://localhost:8000/health > /dev/null; then
            echo "  정상 작동 중 - http://localhost:8000"
        else
            echo "  프로세스는 있지만 응답 없음"
        fi
    else
        echo "  종료됨"
    fi
else
    echo "  실행 안 됨"
fi

echo ""
echo "배포 URL: https://scholarios.fly.dev"
echo "========================================="
echo ""
