#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "  SIH26092: Yojana Setu — AI-Driven Scheme Matching                  "
echo "  Stack: Node.js + Express | MongoDB | Google Gemini | React + Vite  "
echo "======================================================================"

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Check MongoDB
echo ""
echo "[1/3] Checking MongoDB connection..."
if mongosh --quiet --eval "db.runCommand({ ping: 1 })" yojana_setu > /dev/null 2>&1; then
  echo "  -> MongoDB is running and reachable."
else
  echo "  -> WARNING: MongoDB does not appear to be running."
  echo "     Please start MongoDB before continuing."
  echo "     Windows: net start MongoDB"
  echo "     Mac/Linux: sudo systemctl start mongod"
  echo ""
fi

# 2. Seed MongoDB with 16 statutory schemes (only seeds if collection is empty)
echo ""
echo "[2/3] Seeding MongoDB with 16 statutory schemes (if not already seeded)..."
cd "$BASE_DIR/backend-node"
node src/db/seed.js

# 3. Start Node.js Backend + React Frontend concurrently
echo ""
echo "[3/3] Starting backend (Node.js) and frontend (Vite React)..."

# Start Node.js Express backend on port 8000
node src/index.js &
BACKEND_PID=$!

# Start Vite React frontend on port 5173
cd "$BASE_DIR/frontend"
npm run dev -- --port 5173 &
FRONTEND_PID=$!

echo ""
echo "======================================================================"
echo "  System Ready!"
echo "  Backend API:  http://localhost:8000"
echo "  Frontend UI:  http://localhost:5173"
echo "  Gemini AI:    Google Gemini (via GEMINI_API_KEY in backend-node/.env)"
echo "  Database:     MongoDB (yojana_setu collection)"
echo "======================================================================"
echo ""
echo "  Useful commands:"
echo "    Seed DB manually:   cd backend-node && node src/db/seed.js"
echo "    Backend dev mode:   cd backend-node && npm run dev"
echo "    Frontend dev mode:  cd frontend && npm run dev"
echo "======================================================================"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT
wait
