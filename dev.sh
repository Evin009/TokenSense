#!/bin/bash
# TokenSense — local development startup
# Starts the FastAPI backend and (when built) the Next.js frontend.
# Usage: bash dev.sh
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting TokenSense backend..."
cd "$ROOT_DIR/backend"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Backend running at http://localhost:8000"
echo "API docs at    http://localhost:8000/docs"

# Uncomment after Phase 3 (Next.js frontend) is built:
# echo "Starting TokenSense frontend..."
# cd "$ROOT_DIR/frontend"
# npm run dev &
# FRONTEND_PID=$!
# echo "Frontend running at http://localhost:3000"

echo ""
echo "Press Ctrl+C to stop all services."

trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT
wait
