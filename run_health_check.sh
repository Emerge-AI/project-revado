#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Server URL
API_URL="http://localhost:8000"

echo -e "${YELLOW}API Health Check Runner${NC}"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi

# Check if the requests module is installed
if ! python3 -c "import requests" &> /dev/null; then
    echo -e "${YELLOW}The 'requests' module is not installed. Installing...${NC}"
    pip install requests
    
    # Check if installation was successful
    if ! python3 -c "import requests" &> /dev/null; then
        echo -e "${RED}Failed to install 'requests' module. Please install it manually:${NC}"
        echo "pip install requests"
        exit 1
    fi
fi

# Check if the server is running
echo -e "${YELLOW}Checking if the API server is running...${NC}"
if curl --silent --connect-timeout 5 "${API_URL}" > /dev/null; then
    echo -e "${GREEN}API server is running.${NC}"
else
    echo -e "${RED}API server is not running at ${API_URL}.${NC}"
    echo "Please start the server before running the health check."
    echo "You can start the server by running: cd .. && python -m backend.main"
    exit 1
fi

# Run the health check
echo -e "${YELLOW}Running API health check...${NC}"
python3 api_health_check.py

# Exit with the same status as the health check
exit $? 