#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping Payer Policy Management API Server${NC}"
echo "==============================================="

# Find the process running the backend.main module
echo -e "${YELLOW}Looking for running server process...${NC}"
SERVER_PID=$(ps aux | grep "python -m backend.main" | grep -v grep | awk '{print $2}')

if [ -z "$SERVER_PID" ]; then
    # Try to find by port 8000 if process name approach doesn't work
    SERVER_PID=$(lsof -i :8000 -t 2>/dev/null)
fi

if [ -z "$SERVER_PID" ]; then
    echo -e "${RED}No running server found on port 8000.${NC}"
    exit 1
fi

# Confirm before stopping
echo -e "${YELLOW}Found server process with PID: ${SERVER_PID}${NC}"
echo -e "Do you want to stop this process? (y/n)"
read -r confirm

if [[ "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping server...${NC}"
    kill -15 "$SERVER_PID"
    
    # Check if process was successfully terminated
    sleep 2
    if ps -p "$SERVER_PID" > /dev/null; then
        echo -e "${YELLOW}Server still shutting down, sending force kill signal...${NC}"
        kill -9 "$SERVER_PID"
        sleep 1
    fi
    
    if ps -p "$SERVER_PID" > /dev/null; then
        echo -e "${RED}Failed to stop the server.${NC}"
        exit 1
    else
        echo -e "${GREEN}Server stopped successfully.${NC}"
    fi
else
    echo -e "${YELLOW}Operation canceled.${NC}"
    exit 0
fi

echo -e "${GREEN}API Server is now stopped.${NC}" 