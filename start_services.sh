#!/usr/bin/env bash

# ==============================================================================
# MedVisionSort - Integrated Services Startup Orchestrator
# ==============================================================================
# This script starts both the Python Flask Backend and Angular Frontend Web App.
# It ensures they are perfectly interconnected and outputs clean, color-coded logs.
# ==============================================================================

# Text formatting helper functions
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print a beautiful ASCII header
echo -e "${CYAN}${BOLD}"
echo "  __  __          ___      ___  _             ___              _"
echo " |  \/  | ___  __| \ \    / (_)(_) ___ _ __  / __| ___  _ _  _| |_"
echo " | |\/| |/ _ \/ _\` |\ \/\/ /| || |(_-<| '  \ \__ \/ _ \| '_| _  _|"
echo " |_|  |_|\___/\__,_| \_/\_/ |_||_|/__/|_|_|_||___/\___/|_|   |_|"
echo "                                                               "
echo -e "         ${BOLD}Premium AI Medical Image Classification & Sorter${NC}"
echo "=============================================================================="

# Define directories
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="${BASE_DIR}/medical_image_sorter"
FRONTEND_DIR="${BASE_DIR}/frontend_web"

# Trap exit signals to gracefully terminate background processes
cleanup() {
    echo -e "\n${YELLOW}[!] Stopping all services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${RED}[-] Stopping Flask Backend (PID: ${BACKEND_PID})...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${RED}[-] Stopping Angular Frontend (PID: ${FRONTEND_PID})...${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}[✓] All services stopped successfully.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# ------------------------------------------------------------------------------
# 1. Starting Backend Service
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[1/2] Starting Flask Backend Server (Port 5001)...${NC}"
cd "$BACKEND_DIR"

# Check if port 5001 is already in use
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}[!] Port 5001 is already in use! Attempting to release it...${NC}"
    PID_ON_5001=$(lsof -t -i:5001)
    kill -9 $PID_ON_5001 2>/dev/null
    sleep 1
fi

# Run backend
python3 server.py > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to warm up and verify it's responsive
echo -n "Waiting for backend to initialize..."
for i in {1..15}; do
    if curl -s http://localhost:5001/api/stats > /dev/null; then
        echo -e "\n${GREEN}[✓] Backend is UP and running on http://localhost:5001${NC}"
        break
    fi
    echo -n "."
    sleep 1
    if [ $i -eq 15 ]; then
        echo -e "\n${RED}[✗] Backend failed to start. Showing backend.log tail:${NC}"
        tail -n 20 backend.log
        exit 1
    fi
done

# ------------------------------------------------------------------------------
# 2. Starting Frontend Service
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[2/2] Starting Angular Frontend Server (Port 4200)...${NC}"
cd "$FRONTEND_DIR"

# Run frontend
npm run start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to compile and run
echo -n "Compiling and serving Angular UI..."
for i in {1..30}; do
    if curl -s http://localhost:4200 > /dev/null; then
        echo -e "\n${GREEN}[✓] Frontend is UP and running on http://localhost:4200${NC}"
        break
    fi
    echo -n "."
    sleep 2
    if [ $i -eq 30 ]; then
        echo -e "\n${RED}[✗] Frontend failed to start. Showing frontend.log tail:${NC}"
        tail -n 20 frontend.log
        exit 1
    fi
done

echo -e "\n=============================================================================="
echo -e "${GREEN}${BOLD}[✓] SUCCESS! BOTH SERVICES RUNNING PERFECTLY${NC}"
echo -e "${CYAN}🌍 Frontend Web App URL: ${BOLD}http://localhost:4200${NC}"
echo -e "${CYAN}⚙️ Backend API Base:      ${BOLD}http://localhost:5001${NC}"
echo -e "${YELLOW}👉 Press [Ctrl+C] to stop all services gracefully.${NC}"
echo -e "==============================================================================\n"

# Stream both log files to console for easy monitoring
tail -f "${BACKEND_DIR}/backend.log" "${FRONTEND_DIR}/frontend.log"
