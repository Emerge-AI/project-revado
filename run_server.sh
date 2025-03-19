#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Payer Policy Management API Server${NC}"
echo "==============================================="

# Check if we're in the right directory structure
if [ ! -d "backend" ]; then
  echo -e "${RED}Error: 'backend' directory not found!${NC}"
  echo "Please run this script from the project root directory."
  exit 1
fi

# Set PYTHONPATH to include the current directory
export PYTHONPATH=$(pwd):$PYTHONPATH

echo -e "${YELLOW}PYTHONPATH set to: ${PYTHONPATH}${NC}"

# Run the server
echo -e "${YELLOW}Starting server...${NC}"
echo -e "${GREEN}Server will be available at http://localhost:8000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Run the server using python module (from project root)
python -m backend.main

# This will run after server is stopped
echo -e "${YELLOW}Server stopped.${NC}" 