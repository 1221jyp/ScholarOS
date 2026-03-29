#!/bin/bash
# ScholarOS 백엔드 서버 시작

cd "$(dirname "$0")"

echo "========================================="
echo "  ScholarOS 시작"
echo "========================================="
echo ""

# Backend 서버 시작
echo "Backend 서버를 시작합니다..."
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > logs/server.log 2>&1 &
BACKEND_PID=$!
echo "Backend 시작됨 (PID: $BACKEND_PID)"
sleep 2

# 서버 정상 작동 확인
if curl -s http://localhost:8000/health > /dev/null; then
    echo "Backend 정상 작동 중"
else
    echo "Backend 시작 실패"
    exit 1
fi

echo "$BACKEND_PID" > .backend.pid

echo ""
echo "========================================="
echo "  ScholarOS 실행 중"
echo "========================================="
echo ""
echo "로컬: http://localhost:8000"
echo "배포: https://scholarios.fly.dev"
echo "로그: tail -f logs/server.log"
echo "종료: ./stop.sh"
echo ""
