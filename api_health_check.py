#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime
import sys

class APIHealthCheck:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "base_url": base_url,
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0
            }
        }
    
    def run_test(self, name, method, endpoint, payload=None, expected_status=200, check_response=None):
        """Run a test against the API"""
        url = f"{self.base_url}{endpoint}"
        self.results["summary"]["total"] += 1
        
        print(f"\n{'='*80}\nRunning test: {name}\n{'-'*80}")
        print(f"URL: {method} {url}")
        if payload:
            print(f"Payload: {json.dumps(payload, indent=2)}")
        
        test_result = {
            "name": name,
            "method": method,
            "url": url,
            "payload": payload,
            "expected_status": expected_status,
            "start_time": datetime.now().isoformat()
        }
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            test_result["status_code"] = response.status_code
            test_result["response_time_ms"] = int(response.elapsed.total_seconds() * 1000)
            
            # Try to parse JSON response
            try:
                test_result["response"] = response.json()
                print(f"Response: {json.dumps(response.json(), indent=2)}")
            except:
                test_result["response"] = response.text
                print(f"Response: {response.text}")
            
            # Check status code
            status_passed = response.status_code == expected_status
            test_result["status_check"] = "PASSED" if status_passed else "FAILED"
            
            # Run custom response check if provided
            response_check_passed = True
            if check_response and status_passed:
                response_check_passed = check_response(response.json())
                test_result["response_check"] = "PASSED" if response_check_passed else "FAILED"
            
            # Overall test result
            test_result["result"] = "PASSED" if (status_passed and response_check_passed) else "FAILED"
            if test_result["result"] == "PASSED":
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
            
            print(f"Status Code: {response.status_code} - {'✅' if status_passed else '❌'}")
            print(f"Overall Result: {test_result['result']} - {'✅' if test_result['result'] == 'PASSED' else '❌'}")
        
        except Exception as e:
            test_result["error"] = str(e)
            test_result["result"] = "FAILED"
            self.results["summary"]["failed"] += 1
            print(f"Error: {str(e)}")
            print(f"Overall Result: FAILED - ❌")
        
        self.results["tests"].append(test_result)
        return test_result["result"] == "PASSED"
    
    def report(self):
        """Print a summary report of the test results"""
        print("\n\n" + "="*80)
        print(f"API Health Check Summary for {self.base_url}")
        print("="*80)
        print(f"Tests Run: {self.results['summary']['total']}")
        print(f"Passed: {self.results['summary']['passed']}")
        print(f"Failed: {self.results['summary']['failed']}")
        print(f"Pass Rate: {(self.results['summary']['passed'] / self.results['summary']['total'] * 100):.1f}%")
        print("="*80)
        
        print("\nResults by test:")
        print("-"*80)
        for test in self.results["tests"]:
            status = "✅" if test["result"] == "PASSED" else "❌"
            print(f"{status} {test['name']} - {test['result']}")
        
        # Save results to file
        filename = f"api_health_check_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w") as f:
            json.dump(self.results, f, indent=2)
        print(f"\nDetailed results saved to {filename}")
        
        return self.results["summary"]["failed"] == 0

def run_api_health_check():
    """Run the API health check"""
    # Create the health check instance
    checker = APIHealthCheck()
    
    # Test 1: Root endpoint
    checker.run_test(
        name="Root Endpoint",
        method="GET",
        endpoint="/",
        check_response=lambda r: "message" in r
    )
    
    # Test 2: Debug policy mappings
    checker.run_test(
        name="Debug Policy Mappings",
        method="GET",
        endpoint="/debug/policy-mappings",
        check_response=lambda r: "policy_id_to_url" in r and "next_policy_id" in r
    )
    
    # Test 3: Test search endpoint
    checker.run_test(
        name="Test Search",
        method="POST",
        endpoint="/test-search",
        payload={"search_term": "example", "payer_name": "TestPayer", "max_results": 3},
        check_response=lambda r: "message" in r and "payer" in r
    )
    
    # Test 4: Get policies for TestPayer
    checker.run_test(
        name="Get Policies for TestPayer",
        method="GET",
        endpoint="/policies/TestPayer",
        check_response=lambda r: isinstance(r, list)
    )
    
    # Test 5: Get policy by ID
    checker.run_test(
        name="Get Policy by ID",
        method="GET",
        endpoint="/policy-by-id/1",
        check_response=lambda r: "policy_content" in r and "source_url" in r
    )
    
    # Test 6: Test search policies endpoint
    checker.run_test(
        name="Test Search Policies",
        method="POST",
        endpoint="/test-search-policies",
        payload={"search_term": "example", "payer_name": "TestPayer", "max_results": 3},
        check_response=lambda r: "results" in r and isinstance(r["results"], list)
    )
    
    # Test 7: Test search and scrape endpoint
    checker.run_test(
        name="Test Search and Scrape",
        method="POST",
        endpoint="/test-search-and-scrape",
        payload={"search_term": "example", "payer_name": "TestPayer", "max_results": 2},
        check_response=lambda r: isinstance(r, list) and len(r) > 0 and "policy_content" in r[0]
    )
    
    # Test 8: Simulated successful scrape
    checker.run_test(
        name="Test Successful Scrape",
        method="POST",
        endpoint="/test-successful-scrape",
        payload={"url": "https://api-health-test.com", "payer_name": "HealthTest"},
        check_response=lambda r: "policy_content" in r and r["status"] == "completed"
    )
    
    # Test 9: Scrape policy (might be slow/fail depending on crawler config)
    checker.run_test(
        name="Scrape Policy",
        method="POST",
        endpoint="/scrape-policy",
        payload={"url": "https://example.com", "payer_name": "Example", "query": "test query"},
        check_response=lambda r: "policy_content" in r and "status" in r
    )
    
    # Print the final report
    all_passed = checker.report()
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(run_api_health_check()) 