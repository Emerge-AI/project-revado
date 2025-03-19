# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
# project-revado

# Payer Policy Management API

A system for searching, scraping, and managing healthcare payer policies.

## Overview

This API provides endpoints for:
- Searching payer websites for relevant policies
- Automatically scraping and extracting content from policy pages
- Managing and retrieving policy content

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Activate your virtual environment (if using one)

## Running the Server

Use the provided script to start the API server:

```
./run_server.sh
```

This script handles the proper Python path configuration to avoid import errors.

The server will be available at http://localhost:8000

## API Testing

### Quick Health Check

Run the comprehensive API health check to verify all endpoints:

```
./run_health_check.sh
```

This will test all endpoints and generate a detailed report.

### Targeted API Tests

For a more focused test of the core functionality:

```
./test_api.py
```

This will test the search and scrape functionality with predefined inputs.

## API Endpoints

### Search Endpoints

- `POST /search-policies` - Search for policies based on keywords and payer
- `POST /test-search-policies` - Test version using in-memory data

### Scraping Endpoints

- `POST /scrape-policy` - Scrape a specific policy URL
- `POST /search-and-scrape` - Search and automatically scrape matching policies
- `POST /test-search-and-scrape` - Test version using in-memory data
- `POST /test-successful-scrape` - Simulates a successful scrape without actual scraping

### Retrieval Endpoints

- `GET /policies/{payer_name}` - Get all policies for a specific payer
- `GET /policy/{url}` - Get a specific policy by URL (URL-encoded)
- `GET /policy-by-id/{policy_id}` - Get a specific policy by ID

### Debug Endpoints

- `GET /debug/policy-mappings` - View internal policy ID mappings
- `POST /test-search` - Simple test endpoint for debugging

## Manual Testing with curl

Here are some example curl commands for testing the API:

```bash
# Test API root
curl http://localhost:8000/

# Get policies for a specific payer
curl http://localhost:8000/policies/TestPayer

# Get a policy by ID
curl http://localhost:8000/policy-by-id/1

# Search for policies
curl -X POST http://localhost:8000/test-search-policies \
  -H "Content-Type: application/json" \
  -d '{"search_term": "example", "payer_name": "TestPayer", "max_results": 5}'

# Search and scrape in one operation
curl -X POST http://localhost:8000/test-search-and-scrape \
  -H "Content-Type: application/json" \
  -d '{"search_term": "example", "payer_name": "TestPayer", "max_results": 2}'

# Scrape a specific URL
curl -X POST http://localhost:8000/scrape-policy \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "payer_name": "Example", "query": "test query"}'
```

## Troubleshooting

If you encounter a "No module named 'backend'" error when running `python -m main` from the backend directory, use the provided `run_server.sh` script instead, which sets up the correct Python path.

For more detailed logs and debugging, check the server console output where errors and debug messages are printed.
