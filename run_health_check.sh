#!/bin/bash
#
# API Health Check Runner
# A convenience script for running api_health_check.py with common configurations
#

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Constants
DEFAULT_URL="http://localhost:8000"
DEFAULT_MODE="basic"
DEFAULT_MIN_RELEVANCE="0.0"

# Initialize variables
URL="$DEFAULT_URL"
MODE="$DEFAULT_MODE"
VERBOSE=""
WAIT_OPTS=""
RELEVANCE_OPTS=""
TIMEOUT_OPTS=""
CUSTOM_OPTS=""

# Show help
show_help() {
    echo "API Health Check Runner"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help                Show this help message"
    echo "  -u, --url URL             Set the API base URL (default: $DEFAULT_URL)"
    echo "  -m, --mode MODE           Set the test mode (basic, data, scrape, search, search-scrape, all)"
    echo "  -v, --verbose             Enable verbose output"
    echo "  -w, --wait ATTEMPTS:DELAY Set custom wait parameters (e.g., 10:5 for 10 attempts with 5 sec delay)"
    echo "  -n, --no-wait             Don't wait for policy completion"
    echo "  -i, --ignore-timeouts     Don't fail tests if policies timeout during scraping"
    echo "  -r, --min-relevance SCORE Set minimum relevance score for search results (default: $DEFAULT_MIN_RELEVANCE)"
    echo "  -c, --custom TEST         Add a custom test in format 'payer:term:max_results'"
    echo "  --wait-attempts NUM       Set number of attempts to wait for policy completion"
    echo "  --wait-delay SEC          Set delay between wait attempts in seconds"
    echo ""
    echo "Examples:"
    echo "  # Run basic health check"
    echo "  $0"
    echo ""
    echo "  # Run all tests against a remote API with verbose output"
    echo "  $0 -m all -u https://api.example.com -v"
    echo ""
    echo "  # Run search and scrape test with custom wait and minimum relevance"
    echo "  $0 -m search-scrape -w 20:5 -r 0.5"
    echo ""
    echo "  # Run search test with a custom search query"
    echo "  $0 -m search -c 'Aetna:diabetes coverage:5'"
    echo ""
    echo "  # Run search-scrape with specific wait parameters"
    echo "  $0 -m search-scrape --wait-attempts 3 --wait-delay 5"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -u|--url)
            URL="$2"
            shift 2
            ;;
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE="--verbose"
            shift
            ;;
        -w|--wait)
            IFS=':' read -r attempts delay <<< "$2"
            WAIT_OPTS="--wait-attempts $attempts --wait-delay $delay"
            shift 2
            ;;
        -n|--no-wait)
            WAIT_OPTS="--no-wait"
            shift
            ;;
        -i|--ignore-timeouts)
            TIMEOUT_OPTS="--ignore-timeouts"
            shift
            ;;
        -r|--min-relevance)
            RELEVANCE_OPTS="--min-relevance $2"
            shift 2
            ;;
        -c|--custom)
            CUSTOM_OPTS="--custom-search \"$2\""
            shift 2
            ;;
        --wait-attempts)
            # Add to or update WAIT_OPTS with the new attempts value
            if [[ "$WAIT_OPTS" == *"--wait-delay"* ]]; then
                # Extract existing delay value
                DELAY=$(echo "$WAIT_OPTS" | grep -o "\--wait-delay [0-9.]*" | awk '{print $2}')
                WAIT_OPTS="--wait-attempts $2 --wait-delay $DELAY"
            else
                WAIT_OPTS="$WAIT_OPTS --wait-attempts $2"
            fi
            shift 2
            ;;
        --wait-delay)
            # Add to or update WAIT_OPTS with the new delay value
            if [[ "$WAIT_OPTS" == *"--wait-attempts"* ]]; then
                # Extract existing attempts value
                ATTEMPTS=$(echo "$WAIT_OPTS" | grep -o "\--wait-attempts [0-9]*" | awk '{print $2}')
                WAIT_OPTS="--wait-attempts $ATTEMPTS --wait-delay $2"
            else
                WAIT_OPTS="$WAIT_OPTS --wait-delay $2"
            fi
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Map mode to appropriate arguments
case "$MODE" in
    basic)
        TEST_ARGS="--test-basic"
        ;;
    data)
        TEST_ARGS="--test-data"
        ;;
    scrape)
        TEST_ARGS="--test-scrape"
        ;;
    search)
        TEST_ARGS="--test-search"
        ;;
    search-scrape)
        TEST_ARGS="--test-search-scrape"
        ;;
    all)
        TEST_ARGS="--test-all"
        ;;
    *)
        echo "Unknown mode: $MODE"
        show_help
        exit 1
        ;;
esac

# Build and execute the command
CMD="./api_health_check.py $TEST_ARGS --base-url \"$URL\" $VERBOSE $WAIT_OPTS $TIMEOUT_OPTS $RELEVANCE_OPTS $CUSTOM_OPTS"

# Show command being executed
echo "Executing: $CMD"
echo ""

# If using --ignore-timeouts, remind the user
if [[ -n "$TIMEOUT_OPTS" ]]; then
    echo "⚠️  Note: Tests will not fail if policies timeout during scraping."
    echo ""
fi

# If using a relevance threshold, remind the user
if [[ -n "$RELEVANCE_OPTS" && "$RELEVANCE_OPTS" != "--min-relevance 0.0" ]]; then
    echo "⚠️  Note: Search tests will require results with relevance scores above the minimum."
    echo ""
fi

# Execute the command
eval "$CMD"

# Exit with the same status as the Python script
exit $? 