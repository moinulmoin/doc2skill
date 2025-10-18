#!/bin/bash

echo "🚀 Starting Skill Seekers Web..."

# Start backend
echo "Starting backend..."
cd backend && ../.venv/bin/uvicorn app:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a bit
sleep 2

# Start frontend
echo "Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
