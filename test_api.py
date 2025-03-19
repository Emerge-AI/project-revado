#!/usr/bin/env python3
import requests
import json
import time
import sys
from datetime import datetime

# API Base URL
BASE_URL = "http://localhost:8000"

def print_divider(char="=", length=80):
    print(f"\n{char * length}")

def print_response(response):
    """Pretty print the API response"""
    try:
        json_response = response.json()
        print(f"Status: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds() * 1000:.2f}ms")
        print("Response Body:")
        print(json.dumps(json_response, indent=2))
        return json_response
    except:
        print(f"Status: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds() * 1000:.2f}ms")
        print("Response Body (not JSON):")
        print(response.text)
        return None

def test_api_connection():
    """Test if the API server is running"""
    print_divider()
    print("Testing API Connection")
    print_divider("-")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print_response(response)
        return response.status_code == 200
    except Exception as e:
        print(f"Error connecting to API: {str(e)}")
        return False

def test_search_policies(search_term="example", payer_name="TestPayer", max_results=3):
    """Test the search policies API endpoint"""
    print_divider()
    print(f"Testing Search Policies: '{search_term}', Payer: '{payer_name}'")
    print_divider("-")
    
    payload = {
        "search_term": search_term,
        "payer_name": payer_name,
        "max_results": max_results
    }
    
    try:
        # First try the test endpoint
        print("Using test-search-policies endpoint:")
        response = requests.post(
            f"{BASE_URL}/test-search-policies",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        json_response = print_response(response)
        
        if response.status_code != 200 or not json_response or "results" not in json_response:
            print("Warning: Test search policies endpoint failed or returned unexpected format")
        
        # Now try the real endpoint
        print("\nUsing search-policies endpoint:")
        response = requests.post(
            f"{BASE_URL}/search-policies",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        json_response = print_response(response)
        
        return json_response.get("results", []) if json_response and "results" in json_response else []
    
    except Exception as e:
        print(f"Error testing search policies: {str(e)}")
        return []

def test_search_and_scrape(search_term="example", payer_name="TestPayer", max_results=2):
    """Test the search and scrape API endpoint"""
    print_divider()
    print(f"Testing Search and Scrape: '{search_term}', Payer: '{payer_name}'")
    print_divider("-")
    
    payload = {
        "search_term": search_term,
        "payer_name": payer_name,
        "max_results": max_results
    }
    
    try:
        # Use the test endpoint first
        print("Using test-search-and-scrape endpoint:")
        response = requests.post(
            f"{BASE_URL}/test-search-and-scrape",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        policies = print_response(response)
        
        if not isinstance(policies, list):
            print("Warning: Test search and scrape endpoint failed or returned unexpected format")
            policies = []
        
        # Now try the real endpoint
        print("\nUsing search-and-scrape endpoint:")
        response = requests.post(
            f"{BASE_URL}/search-and-scrape",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        real_policies = print_response(response)
        
        if not isinstance(real_policies, list):
            print("Warning: Real search and scrape endpoint failed or returned unexpected format")
            real_policies = []
        else:
            policies = real_policies
        
        return policies
    except Exception as e:
        print(f"Error testing search and scrape: {str(e)}")
        return []

def test_scrape_policy(url="https://example.com", payer_name="Example", query="test"):
    """Test the scrape policy API endpoint"""
    print_divider()
    print(f"Testing Scrape Policy: URL: '{url}', Payer: '{payer_name}'")
    print_divider("-")
    
    payload = {
        "url": url,
        "payer_name": payer_name,
        "query": query
    }
    
    try:
        # Try the test endpoint first
        print("Using test-successful-scrape endpoint:")
        response = requests.post(
            f"{BASE_URL}/test-successful-scrape",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        policy = print_response(response)
        
        # Now try the real endpoint
        print("\nUsing scrape-policy endpoint:")
        response = requests.post(
            f"{BASE_URL}/scrape-policy",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        real_policy = print_response(response)
        
        if not real_policy or "source_url" not in real_policy:
            print("Warning: Real scrape policy endpoint failed or returned unexpected format")
            return policy
        
        return real_policy
    except Exception as e:
        print(f"Error testing scrape policy: {str(e)}")
        return None

def check_policy_status(url):
    """Check the status of a policy"""
    print_divider()
    print(f"Checking Policy Status for URL: '{url}'")
    print_divider("-")
    
    try:
        # URL encode the policy URL
        import urllib.parse
        encoded_url = urllib.parse.quote(url, safe='')
        
        response = requests.get(
            f"{BASE_URL}/policy/{encoded_url}",
            timeout=10
        )
        return print_response(response)
    except Exception as e:
        print(f"Error checking policy status: {str(e)}")
        return None

def main():
    print("\nPayer Policy API Test Script")
    print("===========================")
    print(f"Testing against: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    
    # Test API connection
    if not test_api_connection():
        print("\nERROR: Could not connect to the API. Make sure the server is running.")
        return 1
    
    # Run core functionality tests
    print("\nRunning Core Functionality Tests...")
    
    # Test search policies
    search_results = test_search_policies(
        search_term="example policy", 
        payer_name="TestPayer"
    )
    
    # Test search and scrape
    policies = test_search_and_scrape(
        search_term="example content", 
        payer_name="TestPayer"
    )
    
    # Test scrape policy with a simple URL
    policy = test_scrape_policy(
        url="https://example.com", 
        payer_name="Example"
    )
    
    # If we have a policy, check its status after a delay
    if policy and "source_url" in policy:
        print("\nWaiting 5 seconds for scraping to process...")
        time.sleep(5)
        check_policy_status(policy["source_url"])
    
    print_divider()
    print("Test Complete")
    print_divider()
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 