#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:8000"

# ---------------------------------------------------------
# Payer Policy API Tools
# ---------------------------------------------------------

# Check if the API server is running
check_server() {
  echo -e "${YELLOW}Checking if the API server is running...${NC}"
  if curl --silent --connect-timeout 3 "${API_URL}" > /dev/null; then
    echo -e "${GREEN}API server is running at ${API_URL}${NC}"
    return 0
  else
    echo -e "${RED}Error: API server is not running at ${API_URL}${NC}"
    echo "Please start the server using ./run_server.sh"
    return 1
  fi
}

# Search for policies
search_policies() {
  local search_term="$1"
  local payer_name="$2"
  local max_results="${3:-5}"
  
  if [[ -z "$search_term" ]]; then
    echo -e "${RED}Error: Search term is required${NC}"
    echo "Usage: search_policies \"search term\" \"payer name\" [max_results]"
    return 1
  fi
  
  echo -e "${YELLOW}Searching for policies...${NC}"
  echo -e "- Search Term: ${search_term}"
  echo -e "- Payer: ${payer_name:-Any payer}"
  echo -e "- Max Results: ${max_results}"
  
  # Medicare specific tip
  if [[ "$payer_name" == "Medicare" || "$payer_name" == "medicare" || "$payer_name" == "CMS" ]]; then
    echo -e "${GREEN}Tip: Medicare searches use the format: https://www.cms.gov/search/cms?keys=search+term${NC}"
  fi
  
  # Build the payload
  local payload="{\"search_term\": \"$search_term\", \"max_results\": $max_results"
  if [[ -n "$payer_name" ]]; then
    payload="$payload, \"payer_name\": \"$payer_name\""
  fi
  payload="$payload}"
  
  # Make the API request
  echo -e "${YELLOW}Sending request...${NC}"
  curl -s -X POST "$API_URL/test-search-policies" \
    -H "Content-Type: application/json" \
    -d "$payload" | json_pp
}

# Scrape a policy
scrape_policy() {
  local url="$1"
  local payer_name="$2"
  local query="$3"
  
  if [[ -z "$url" || -z "$payer_name" ]]; then
    echo -e "${RED}Error: URL and payer name are required${NC}"
    echo "Usage: scrape_policy \"url\" \"payer name\" [\"query\"]"
    return 1
  fi
  
  echo -e "${YELLOW}Scraping policy...${NC}"
  echo -e "- URL: ${url}"
  echo -e "- Payer: ${payer_name}"
  if [[ -n "$query" ]]; then
    echo -e "- Query: ${query}"
  fi
  
  # Build the payload
  local payload="{\"url\": \"$url\", \"payer_name\": \"$payer_name\""
  if [[ -n "$query" ]]; then
    payload="$payload, \"query\": \"$query\""
  fi
  payload="$payload}"
  
  # Make the API request
  echo -e "${YELLOW}Sending request...${NC}"
  local response=$(curl -s -X POST "$API_URL/scrape-policy" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  echo "$response" | json_pp
  
  # Extract the URL from the response
  local policy_url=$(echo "$response" | grep -o '"source_url":"[^"]*"' | cut -d'"' -f4)
  
  if [[ -n "$policy_url" ]]; then
    echo -e "\n${YELLOW}Policy scraping initiated. You can check the status using:${NC}"
    echo -e "check_policy_status \"$policy_url\""
  fi
}

# Check policy status
check_policy_status() {
  local url="$1"
  
  if [[ -z "$url" ]]; then
    echo -e "${RED}Error: URL is required${NC}"
    echo "Usage: check_policy_status \"url\""
    return 1
  fi
  
  echo -e "${YELLOW}Checking policy status for URL: ${url}${NC}"
  
  # URL encode the policy URL
  local encoded_url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$url', safe=''))")
  
  # Make the API request
  echo -e "${YELLOW}Sending request...${NC}"
  curl -s "$API_URL/policy/$encoded_url" | json_pp
}

# Get all policies for a payer
get_policies_for_payer() {
  local payer_name="$1"
  
  if [[ -z "$payer_name" ]]; then
    echo -e "${RED}Error: Payer name is required${NC}"
    echo "Usage: get_policies_for_payer \"payer name\""
    return 1
  fi
  
  echo -e "${YELLOW}Getting policies for payer: ${payer_name}${NC}"
  
  # Make the API request
  echo -e "${YELLOW}Sending request...${NC}"
  curl -s "$API_URL/policies/$payer_name" | json_pp
}

# Get a policy by ID
get_policy_by_id() {
  local policy_id="$1"
  
  if [[ -z "$policy_id" ]]; then
    echo -e "${RED}Error: Policy ID is required${NC}"
    echo "Usage: get_policy_by_id <policy_id>"
    return 1
  fi
  
  echo -e "${YELLOW}Getting policy with ID: ${policy_id}${NC}"
  
  # Make the API request
  echo -e "${YELLOW}Sending request...${NC}"
  curl -s "$API_URL/policy-by-id/$policy_id" | json_pp
}

# Search and scrape in one operation
search_and_scrape() {
  local search_term="$1"
  local payer_name="$2"
  local max_results="${3:-2}"
  
  if [[ -z "$search_term" || -z "$payer_name" ]]; then
    echo -e "${RED}Error: Search term and payer name are required${NC}"
    echo "Usage: search_and_scrape \"search term\" \"payer name\" [max_results]"
    return 1
  fi
  
  echo -e "${YELLOW}Searching for and scraping policies...${NC}"
  echo -e "- Search Term: ${search_term}"
  echo -e "- Payer: ${payer_name}"
  echo -e "- Max Results: ${max_results}"
  
  # Make the API request
  echo -e "${YELLOW}Sending request...${NC}"
  curl -s -X POST "$API_URL/test-search-and-scrape" \
    -H "Content-Type: application/json" \
    -d "{\"search_term\": \"$search_term\", \"payer_name\": \"$payer_name\", \"max_results\": $max_results}" | json_pp
}

# Show help
show_help() {
  echo -e "${BLUE}Payer Policy API Tools${NC}"
  echo -e "${BLUE}====================${NC}"
  echo -e "This script provides useful functions for working with the Payer Policy API."
  echo ""
  echo -e "${YELLOW}Available Functions:${NC}"
  echo "  search_policies \"search term\" \"payer name\" [max_results]"
  echo "      Search for policies matching a term"
  echo ""
  echo "  scrape_policy \"url\" \"payer name\" [\"query\"]"
  echo "      Scrape a policy from a specific URL"
  echo ""
  echo "  check_policy_status \"url\""
  echo "      Check the status of a policy scraping operation"
  echo ""
  echo "  get_policies_for_payer \"payer name\""
  echo "      Get all policies for a specific payer"
  echo ""
  echo "  get_policy_by_id <policy_id>"
  echo "      Get a policy by its ID"
  echo ""
  echo "  search_and_scrape \"search term\" \"payer name\" [max_results]"
  echo "      Search for and scrape policies in one operation"
  echo ""
  echo -e "${YELLOW}Example Usage:${NC}"
  echo "  source ./policy_tools.sh"
  echo "  search_policies \"diabetes\" \"Medicare\" 3"
  echo "  scrape_policy \"https://example.com\" \"Example\" \"test policy\""
  echo ""
}

# Check if the server is running
check_server

# Show help if this script is sourced
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
  show_help
else
  echo -e "${YELLOW}Note: This script is designed to be sourced, not executed directly.${NC}"
  echo -e "Please run: source ./policy_tools.sh"
  echo ""
  show_help
fi 