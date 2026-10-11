#!/usr/bin/env bash
# ==============================================================================
# run_backend.sh — Start FinLearn AI Flask REST API Server
# ==============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/finlearn-backend"
cd "$BACKEND_DIR"

echo "=========================================================="
echo " Starting FinLearn AI Backend API Server"
echo " Directory: $BACKEND_DIR"
echo "=========================================================="

# Select Python interpreter: prefer venv if exists, else python3
PYTHON_BIN="python3"
if [ -f "$BACKEND_DIR/venv/bin/python3" ]; then
    PYTHON_BIN="$BACKEND_DIR/venv/bin/python3"
elif [ -f "$PROJECT_ROOT/.venv/bin/python3" ]; then
    PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python3"
fi

echo "Using Python: $PYTHON_BIN ($($PYTHON_BIN --version 2>&1))"

# Check if Flask and core dependencies are installed
if ! $PYTHON_BIN -c "import flask, flask_cors, joblib, sklearn, xgboost" &> /dev/null; then
    echo "Warning: Required Python packages not found in current environment."
    echo "Attempting to install from requirements.txt..."
    if [ -f "$BACKEND_DIR/venv/bin/pip" ]; then
        "$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt" || true
    else
        pip3 install -r "$BACKEND_DIR/requirements.txt" || true
    fi
fi

PORT="${PORT:-5001}"
echo "Running Flask REST API on http://127.0.0.1:$PORT ..."
echo "Endpoints:"
echo "  - GET  http://127.0.0.1:$PORT/health"
echo "  - GET  http://127.0.0.1:$PORT/api/ml/valuation/<ticker>"
echo "  - POST http://127.0.0.1:$PORT/api/ml/valuation/predict"
echo "  - GET  http://127.0.0.1:$PORT/api/ml/valuation/stats"
echo "Press Ctrl+C to stop."
echo "=========================================================="

$PYTHON_BIN server.py
