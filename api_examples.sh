#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:8000"

# ----------------------------------------
# Helper functions
# ----------------------------------------

# Print a header for each example
print_header() {
  echo -e "\n${BLUE}=========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}=========================================${NC}"
}

# Run an API request and display the result
run_request() {
  echo -e "${YELLOW}REQUEST:${NC} $1"
  echo -e "${YELLOW}COMMAND:${NC} $2"
  echo -e "${GREEN}RESPONSE:${NC}"
  eval $2
  echo ""
  echo -e "${BLUE}----------------------------------------${NC}"
}

# ----------------------------------------
# API Examples
# ----------------------------------------

print_header "Payer Policy API Examples"
echo "This script contains examples of using the Payer Policy Management API"
echo "Make sure the API server is running at $API_URL"

# Example 1: Check API status
print_header "1. Check API Status"
run_request "GET /" "curl -s $API_URL/ | json_pp"

# Example 2: Get test policies for a payer
print_header "2. Get Policies for TestPayer"
run_request "GET /policies/TestPayer" "curl -s $API_URL/policies/TestPayer | json_pp"

# Example 3: Get a policy by ID
print_header "3. Get a Policy by ID"
run_request "GET /policy-by-id/1" "curl -s $API_URL/policy-by-id/1 | json_pp"

# Example 4: Search for policies - test version
print_header "4. Search for Policies (Test Version)"
run_request "POST /test-search-policies" "curl -s -X POST $API_URL/test-search-policies \
  -H \"Content-Type: application/json\" \
  -d '{\"search_term\": \"example\", \"payer_name\": \"TestPayer\", \"max_results\": 3}' | json_pp"

# Example 5: Search and scrape in one operation - test version
print_header "5. Search and Scrape (Test Version)"
run_request "POST /test-search-and-scrape" "curl -s -X POST $API_URL/test-search-and-scrape \
  -H \"Content-Type: application/json\" \
  -d '{\"search_term\": \"example content\", \"payer_name\": \"TestPayer\", \"max_results\": 2}' | json_pp"

# Example 6: Scrape a specific policy URL
print_header "6. Scrape a Specific URL"
run_request "POST /scrape-policy" "curl -s -X POST $API_URL/scrape-policy \
  -H \"Content-Type: application/json\" \
  -d '{\"url\": \"https://example.com\", \"payer_name\": \"Example\", \"query\": \"test policy\"}' | json_pp"

# Example 7: Simulate a successful scrape
print_header "7. Simulate a Successful Scrape"
run_request "POST /test-successful-scrape" "curl -s -X POST $API_URL/test-successful-scrape \
  -H \"Content-Type: application/json\" \
  -d '{\"url\": \"https://test-policy-example.com\", \"payer_name\": \"HealthProvider\"}' | json_pp"

# Example 8: Get debug policy mappings
print_header "8. Debug Policy Mappings"
run_request "GET /debug/policy-mappings" "curl -s $API_URL/debug/policy-mappings | json_pp"

# Example 9: Search for Medicare policies (real example)
print_header "9. Search for Medicare Policies"
run_request "POST /search-policies" "curl -s -X POST $API_URL/search-policies \
  -H \"Content-Type: application/json\" \
  -d '{\"search_term\": \"diabetes coverage\", \"payer_name\": \"Medicare\", \"max_results\": 3}' | json_pp"

# Example 10: Search and scrape Medicare policies
print_header "10. Search and Scrape Medicare Policies"
run_request "POST /search-and-scrape" "curl -s -X POST $API_URL/search-and-scrape \
  -H \"Content-Type: application/json\" \
  -d '{\"search_term\": \"diabetes coverage\", \"payer_name\": \"Medicare\", \"max_results\": 2}' | json_pp"

# Example 10a: Search and scrape Medicare policies with a more specific query
print_header "10a. Search and Scrape Medicare Policies (Specific Query)"
run_request "POST /search-and-scrape" "curl -s -X POST $API_URL/search-and-scrape \
  -H \"Content-Type: application/json\" \
  -d '{\"search_term\": \"diabetes continuous glucose monitoring coverage determination\", \"payer_name\": \"Medicare\", \"max_results\": 2}' | json_pp"

echo -e "${YELLOW}Note: Medicare search now uses the correct URL format: https://www.cms.gov/search/cms?keys=search+term${NC}"

# ----------------------------------------
# Advanced Examples
# ----------------------------------------

print_header "Advanced Examples"

# Example 11: Check status of a policy after scraping
print_header "11. Full workflow: Scrape and check a policy"

echo -e "${YELLOW}Step 1: Scrape a policy${NC}"
echo -e "${YELLOW}COMMAND:${NC}"
echo "response=\$(curl -s -X POST $API_URL/scrape-policy \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"url\": \"https://example.com\", \"payer_name\": \"Example\", \"query\": \"test policy\"}')"
echo "echo \$response | json_pp"

echo -e "\n${YELLOW}Step 2: Extract URL and encode it${NC}"
echo -e "${YELLOW}COMMAND:${NC}"
echo "url=\$(echo \$response | grep -o '\"source_url\":\"[^\"]*\"' | cut -d'\"' -f4)"
echo "encoded_url=\$(python3 -c \"import urllib.parse; print(urllib.parse.quote('\$url', safe=''))\")"
echo "echo \"URL: \$url\""
echo "echo \"Encoded URL: \$encoded_url\""

echo -e "\n${YELLOW}Step 3: Wait for scraping to complete${NC}"
echo -e "${YELLOW}COMMAND:${NC}"
echo "echo \"Waiting 5 seconds for scraping to process...\""
echo "sleep 5"

echo -e "\n${YELLOW}Step 4: Check policy status${NC}"
echo -e "${YELLOW}COMMAND:${NC}"
echo "curl -s \"$API_URL/policy/\$encoded_url\" | json_pp"

# Example 12: Track all policies for a payer
print_header "12. Monitor for new policies"
echo -e "${YELLOW}This script polls for policies every 10 seconds:${NC}"
echo -e "${YELLOW}COMMAND:${NC}"
echo 'payer="Medicare"'
echo "while true; do"
echo "  count=\$(curl -s \"$API_URL/policies/\$payer\" | grep -o 'policy_content' | wc -l)"
echo "  echo \"\$(date) - Found \$count policies for \$payer\""
echo "  sleep 10"
echo "done"

# Example 13: Search across multiple payers
print_header "13. Search across multiple payers"
echo -e "${YELLOW}This example searches across multiple payers for the same term:${NC}"
echo -e "${YELLOW}COMMAND:${NC}"
echo 'search_term="diabetes treatment"'
echo 'payers=("Medicare" "Medicaid" "Aetna" "Cigna")'
echo 'for payer in "${payers[@]}"; do'
echo "  echo \"Searching for policies in \$payer...\""
echo "  curl -s -X POST $API_URL/test-search-policies \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"search_term\": \"'\$search_term'\", \"payer_name\": \"'\$payer'\", \"max_results\": 2}' | json_pp"
echo "  echo"
echo "done"

echo -e "\n${GREEN}All examples complete!${NC}"
echo "You can use these examples as a starting point for your own API integration." 