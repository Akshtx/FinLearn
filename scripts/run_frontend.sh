#!/usr/bin/env bash
# ==============================================================================
# run_frontend.sh — Start FinLearn AI Frontend Dev Server
# ==============================================================================
set -e

# Navigate to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo " Starting FinLearn AI Interactive Frontend"
echo " Working directory: $PROJECT_ROOT"
echo "=========================================================="

# Check node & npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in PATH."
    exit 1
fi

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (npm install)..."
    npm install
fi

echo "Launching Vite dev server at http://localhost:3000 ..."
echo "Press Ctrl+C to stop."
npm run dev
