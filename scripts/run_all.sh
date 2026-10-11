#!/usr/bin/env bash
# ==============================================================================
# run_all.sh — Run both FinLearn AI Backend and Frontend concurrently
# ==============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo " Starting Full FinLearn AI Application (Backend + Frontend)"
echo " Project root: $PROJECT_ROOT"
echo "=========================================================="

cleanup() {
    echo ""
    echo "Shutting down FinLearn AI services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start backend in the background
echo "1. Starting Flask Backend on port 5001..."
bash scripts/run_backend.sh &
BACKEND_PID=$!

echo "Waiting for backend to initialize..."
sleep 2

# Start frontend in the foreground
echo "2. Starting React Vite Frontend on port 3000..."
bash scripts/run_frontend.sh
