#!/usr/bin/env python3
"""
API Health Check Tool for Payer Policy Management API

This script tests the functionality of the Payer Policy Management API by making
requests to various endpoints and checking the responses. It can test basic API
functionality, test data endpoints, and real search and scrape operations.

Examples:
    # Run all tests
    python api_health_check.py

    # Run only basic API tests
    python api_health_check.py --test-basic

    # Run real search and scrape tests with custom wait parameters
    python api_health_check.py --test-search-scrape --wait-attempts 10 --wait-delay 15

    # Run a custom search test
    python api_health_check.py --test-search --custom-search "Medicare:telehealth services:5"

    # Run against a different API server
    python api_health_check.py --base-url "https://api.example.com"
"""

import requests
import json
import time
import argparse
from datetime import datetime
import sys
import logging

class APIHealthCheck:
    def __init__(self, base_url="http://localhost:8000", verbose=False):
        self.base_url = base_url
        self.verbose = verbose
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
        
        # Configure logging
        log_level = logging.DEBUG if verbose else logging.INFO
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger("api_health_check")
    
    def run_test(self, name, method, endpoint, payload=None, expected_status=200, check_response=None):
        """Run a test against the API"""
        url = f"{self.base_url}{endpoint}"
        self.results["summary"]["total"] += 1
        
        print(f"\n{'='*80}\nRunning test: {name}\n{'-'*80}")
        self.logger.info(f"URL: {method} {url}")
        if payload:
            self.logger.info(f"Payload: {json.dumps(payload, indent=2)}")
        
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
                response_json = response.json()
                test_result["response"] = response_json
                if self.verbose:
                    print(f"Response: {json.dumps(response_json, indent=2)}")
                else:
                    # Print a truncated response for non-verbose mode
                    truncated_response = self._truncate_response(response_json)
                    print(f"Response: {json.dumps(truncated_response, indent=2)}")
            except:
                test_result["response"] = response.text
                if self.verbose:
                    print(f"Response: {response.text}")
                else:
                    # Truncate the text response
                    max_length = 500
                    truncated_text = response.text[:max_length] + "..." if len(response.text) > max_length else response.text
                    print(f"Response: {truncated_text}")
            
            # Check status code
            status_passed = response.status_code == expected_status
            test_result["status_check"] = "PASSED" if status_passed else "FAILED"
            
            # Run custom response check if provided
            response_check_passed = True
            if check_response and status_passed:
                try:
                    response_check_passed = check_response(response_json if 'response_json' in locals() else response.text)
                    test_result["response_check"] = "PASSED" if response_check_passed else "FAILED"
                except Exception as e:
                    self.logger.error(f"Error in response check: {str(e)}")
                    response_check_passed = False
                    test_result["response_check"] = "FAILED"
                    test_result["response_check_error"] = str(e)
            
            # Overall test result
            test_result["result"] = "PASSED" if (status_passed and response_check_passed) else "FAILED"
            if test_result["result"] == "PASSED":
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
            
            print(f"Status Code: {response.status_code} - {'✅' if status_passed else '❌'}")
            if check_response:
                print(f"Response Check: {'✅' if response_check_passed else '❌'}")
            print(f"Overall Result: {test_result['result']} - {'✅' if test_result['result'] == 'PASSED' else '❌'}")
        
        except Exception as e:
            self.logger.error(f"Error executing test: {str(e)}")
            if self.verbose:
                import traceback
                traceback.print_exc()
            
            test_result["error"] = str(e)
            test_result["result"] = "FAILED"
            self.results["summary"]["failed"] += 1
            print(f"Error: {str(e)}")
            print(f"Overall Result: FAILED - ❌")
        
        self.results["tests"].append(test_result)
        return test_result["result"] == "PASSED"
    
    def _truncate_response(self, response_json):
        """Truncate response JSON for display"""
        if isinstance(response_json, dict):
            result = {}
            for key, value in response_json.items():
                if isinstance(value, dict):
                    result[key] = self._truncate_response(value)
                elif isinstance(value, list):
                    if len(value) > 2:
                        result[key] = value[:2] + ["..."]
                    else:
                        result[key] = [self._truncate_response(item) if isinstance(item, dict) else item for item in value]
                elif isinstance(value, str) and len(value) > 100:
                    result[key] = value[:100] + "..."
                else:
                    result[key] = value
            return result
        elif isinstance(response_json, list):
            if len(response_json) > 2:
                return response_json[:2] + ["..."]
            else:
                return [self._truncate_response(item) if isinstance(item, dict) else item for item in response_json]
        else:
            return response_json
    
    def wait_for_policy_completion(self, payer_name, search_term, max_attempts=10, delay=5):
        """
        Wait for a policy to complete processing and return its status
        Returns: (policy, success_flag) where success_flag is True if completed successfully 
        or False if timed out or failed
        """
        print(f"\n{'='*80}\nWaiting for policy to complete: {payer_name} - {search_term}\n{'-'*80}")
        
        search_term_normalized = search_term.lower().replace(" ", "+")
        
        for attempt in range(max_attempts):
            print(f"Check attempt {attempt+1}/{max_attempts}...")
            try:
                response = requests.get(f"{self.base_url}/policies/{payer_name}", timeout=10)
                
                if response.status_code != 200:
                    print(f"❌ Error getting policies: HTTP {response.status_code}")
                    self.logger.error(f"Error getting policies: HTTP {response.status_code}")
                    time.sleep(delay)
                    continue
                
                try:
                    policies = response.json()
                except json.JSONDecodeError:
                    print(f"❌ Error decoding policy JSON response")
                    self.logger.error(f"Error decoding policy JSON response")
                    time.sleep(delay)
                    continue
                
                if not policies:
                    print(f"No policies found for payer: {payer_name}")
                    self.logger.info(f"No policies found for payer: {payer_name}")
                    time.sleep(delay)
                    continue
                
                # Look for policies that match our search term in the source URL
                for policy in policies:
                    source_url = policy.get("source_url", "").lower()
                    if search_term_normalized in source_url:
                        status = policy.get("status", "unknown")
                        print(f"Found policy with ID {policy.get('policy_id')} and status: {status}")
                        self.logger.info(f"Found policy with ID {policy.get('policy_id')} and status: {status}")
                        
                        if status == "completed":
                            print("✅ Policy processing completed!")
                            return policy, True
                        elif status == "failed":
                            print("❌ Policy processing failed!")
                            return policy, False
                        else:
                            print(f"⏳ Policy is still in '{status}' state")
                
                print(f"Policy still processing or not found, waiting {delay} seconds...")
                time.sleep(delay)
            
            except Exception as e:
                print(f"Error checking policy status: {str(e)}")
                self.logger.error(f"Error checking policy status: {str(e)}")
                if self.verbose:
                    import traceback
                    traceback.print_exc()
                time.sleep(delay)
        
        print("❌ Timed out waiting for policy to complete")
        # Return the last found policy (if any) and False to indicate timeout/failure
        last_policy = None
        try:
            response = requests.get(f"{self.base_url}/policies/{payer_name}", timeout=10)
            if response.status_code == 200:
                policies = response.json()
                for policy in policies:
                    source_url = policy.get("source_url", "").lower()
                    if search_term_normalized in source_url:
                        last_policy = policy
                        break
        except:
            pass
            
        return last_policy, False
    
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

def show_help_examples():
    """Display help and usage examples"""
    print("""
API Health Check Tool for Payer Policy Management API
=====================================================

This script tests the functionality of the Payer Policy Management API by making
requests to various endpoints and checking the responses.

Available Test Categories:
-------------------------
--test-basic           Run basic API tests
--test-data            Run test data API tests
--test-scrape          Run real web scraping test
--test-search          Run real search policy tests 
--test-search-scrape   Run real search and scrape tests
--test-all             Run all tests (default if no test is specified)

Examples:
--------
# Run all tests
python api_health_check.py

# Run only basic API tests
python api_health_check.py --test-basic

# Run real search and scrape tests with custom wait parameters
python api_health_check.py --test-search-scrape --wait-attempts 10 --wait-delay 15

# Run a custom search test
python api_health_check.py --test-search --custom-search "Medicare:telehealth services:5"

# Run against a different API server
python api_health_check.py --base-url "https://api.example.com"

# Run in verbose mode
python api_health_check.py --verbose
""")

def run_api_health_check(args):
    """Run the API health check"""
    # Display help if requested
    if args.help:
        show_help_examples()
        return 0
    
    # Create the health check instance
    checker = APIHealthCheck(base_url=args.base_url, verbose=args.verbose)
    
    # Log the start of the test
    print(f"\n{'='*80}")
    print(f"API Health Check - Started at {datetime.now().isoformat()}")
    print(f"Target API: {args.base_url}")
    print(f"Configuration: min_relevance={args.min_relevance}, wait_attempts={args.wait_attempts}, wait_delay={args.wait_delay}")
    print(f"{'='*80}")
    
    # Run basic API tests
    if args.test_basic or args.test_all:
        print(f"\n{'='*80}\nRunning Basic API Tests\n{'='*80}")
        
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
    
    # Run test data API tests
    if args.test_data or args.test_all:
        print(f"\n{'='*80}\nRunning Test Data API Tests\n{'='*80}")
        
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
    
    # Run real scraping API tests
    if args.test_scrape or args.test_all:
        print(f"\n{'='*80}\nRunning Real Web Scraping Test\n{'='*80}")
        
        # Test 9: Scrape policy
        checker.run_test(
            name="Scrape Policy",
            method="POST",
            endpoint="/scrape-policy",
            payload={"url": "https://example.com", "payer_name": "Example", "query": "test query"},
            check_response=lambda r: "policy_content" in r and "status" in r
        )
    
    # Run real search policy tests
    if args.test_search or args.test_all:
        print(f"\n{'='*80}\nRunning Real Search Policy Tests\n{'='*80}")
        
        real_search_tests = [
            {
                "name": "Medicare - Diabetes Coverage",
                "payer": "Medicare",
                "term": "diabetes coverage",
                "max_results": 3
            },
            {
                "name": "Medicare - Preventive Services",
                "payer": "Medicare",
                "term": "preventive services",
                "max_results": 3
            },
            {
                "name": "UnitedHealthcare - Prior Authorization",
                "payer": "UnitedHealthcare",
                "term": "prior authorization requirements",
                "max_results": 3
            },
            {
                "name": "Cigna - Medical Coverage",
                "payer": "Cigna",
                "term": "medical coverage policies",
                "max_results": 3
            }
        ]
        
        # Add custom search if provided
        if args.custom_search:
            parts = args.custom_search.split(":")
            if len(parts) >= 2:
                payer, term = parts[0], parts[1]
                max_results = int(parts[2]) if len(parts) > 2 else 3
                real_search_tests.append({
                    "name": f"{payer} - Custom Search",
                    "payer": payer,
                    "term": term,
                    "max_results": max_results
                })
        
        # Define a relevance check function that captures the min_relevance value
        def check_relevance_scores(r, min_relevance=args.min_relevance):
            if not "results" in r:
                return False
            if not isinstance(r["results"], list):
                return False
            if len(r["results"]) == 0:
                # No results is okay, don't fail the test
                return True
                
            # Check if any results have a relevance score above the minimum
            has_relevant_results = False
            for result in r["results"]:
                score = result.get("relevance_score", 0)
                if score >= min_relevance:
                    has_relevant_results = True
                    break
                    
            if not has_relevant_results and min_relevance > 0:
                print(f"❌ No results with relevance score >= {min_relevance}")
                return False
                
            return True
        
        # Run real search tests
        for test in real_search_tests:
            checker.run_test(
                name=f"Real Search - {test['name']}",
                method="POST",
                endpoint="/search-policies",
                payload={
                    "search_term": test["term"], 
                    "payer_name": test["payer"], 
                    "max_results": test["max_results"]
                },
                check_response=check_relevance_scores
            )
    
    # Run real search and scrape tests
    if args.test_search_scrape or args.test_all:
        print(f"\n{'='*80}\nRunning Real Search and Scrape Tests\n{'='*80}")
        
        real_scrape_tests = [
            {
                "name": "Medicare - Home Health",
                "payer": "Medicare",
                "term": "home health services",
                "max_results": 2,
                "wait_attempts": args.wait_attempts,
                "wait_delay": args.wait_delay
            },
            {
                "name": "Medicare - Durable Medical Equipment",
                "payer": "Medicare",
                "term": "durable medical equipment",
                "max_results": 2,
                "wait_attempts": args.wait_attempts,
                "wait_delay": args.wait_delay
            }
        ]
        
        # Add custom search-and-scrape if provided
        if args.custom_scrape:
            parts = args.custom_scrape.split(":")
            if len(parts) >= 2:
                payer, term = parts[0], parts[1]
                max_results = int(parts[2]) if len(parts) > 2 else 2
                real_scrape_tests.append({
                    "name": f"{payer} - Custom Scrape",
                    "payer": payer,
                    "term": term,
                    "max_results": max_results,
                    "wait_attempts": args.wait_attempts,
                    "wait_delay": args.wait_delay
                })
        
        # Run real search and scrape tests
        for test in real_scrape_tests:
            result = checker.run_test(
                name=f"Real Search and Scrape - {test['name']}",
                method="POST",
                endpoint="/search-and-scrape",
                payload={
                    "search_term": test["term"], 
                    "payer_name": test["payer"], 
                    "max_results": test["max_results"]
                },
                check_response=lambda r: isinstance(r, list) and len(r) > 0 and "source_url" in r[0]
            )
            
            # If the search and scrape test passed, wait for the policy to complete
            if result and not args.no_wait:
                policy, completion_success = checker.wait_for_policy_completion(
                    test["payer"], 
                    test["term"], 
                    max_attempts=test["wait_attempts"], 
                    delay=test["wait_delay"]
                )
                
                if policy:
                    print(f"Final policy status: {policy.get('status')}")
                    
                    # Add a separate test for the search and scrape result
                    # This test will pass if the policy completed successfully or fail if it's still processing after timeout
                    checker.run_test(
                        name=f"Policy Result - {test['name']}",
                        method="GET",
                        endpoint=f"/policy-by-id/{policy.get('policy_id')}",
                        check_response=lambda r: (
                            # Only pass if the policy completed successfully or the user doesn't care about completion
                            (completion_success or args.ignore_timeouts) and 
                            r.get("status") in ["completed", "processing"] and 
                            "source_url" in r
                        )
                    )
                else:
                    # If no policy was found at all, mark it as a failure
                    print(f"❌ No policy found for {test['payer']} - {test['term']}")
                    checker.results["summary"]["total"] += 1
                    checker.results["summary"]["failed"] += 1
                    checker.results["tests"].append({
                        "name": f"Policy Result - {test['name']}",
                        "method": "GET",
                        "url": f"{checker.base_url}/policy-by-id/unknown",
                        "result": "FAILED",
                        "error": "No policy found after waiting"
                    })
    
    # Print the final report
    all_passed = checker.report()
    return 0 if all_passed else 1

def parse_arguments():
    """Parse command-line arguments"""
    parser = argparse.ArgumentParser(
        description="API Health Check Tool for Payer Policy Management API",
        add_help=False  # We'll add our own help
    )
    
    # Help
    parser.add_argument("--help", "-h", action="store_true", help="Show help and examples")
    
    # Test selection options
    test_group = parser.add_argument_group("Test Selection")
    test_group.add_argument("--test-all", action="store_true", help="Run all tests")
    test_group.add_argument("--test-basic", action="store_true", help="Run basic API tests")
    test_group.add_argument("--test-data", action="store_true", help="Run test data API tests")
    test_group.add_argument("--test-scrape", action="store_true", help="Run real web scraping test")
    test_group.add_argument("--test-search", action="store_true", help="Run real search policy tests")
    test_group.add_argument("--test-search-scrape", action="store_true", help="Run real search and scrape tests")
    
    # API configuration
    config_group = parser.add_argument_group("API Configuration")
    config_group.add_argument("--base-url", default="http://localhost:8000", help="Base URL for the API")
    config_group.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    
    # Wait configuration
    wait_group = parser.add_argument_group("Wait Configuration")
    wait_group.add_argument("--wait-attempts", type=int, default=6, help="Number of attempts to check policy status")
    wait_group.add_argument("--wait-delay", type=int, default=10, help="Delay between status checks in seconds")
    wait_group.add_argument("--no-wait", action="store_true", help="Don't wait for policy completion")
    wait_group.add_argument("--ignore-timeouts", action="store_true", help="Don't fail tests if policies timeout")
    
    # Custom tests
    custom_group = parser.add_argument_group("Custom Tests")
    custom_group.add_argument("--custom-search", help="Custom search test: 'Payer:SearchTerm:MaxResults'")
    custom_group.add_argument("--custom-scrape", help="Custom search and scrape test: 'Payer:SearchTerm:MaxResults'")
    custom_group.add_argument("--min-relevance", type=float, default=0.0, help="Minimum relevance score to consider a search result valid")
    
    args = parser.parse_args()
    
    # If no test is specified and not asking for help, run all tests
    if not any([
        args.help, args.test_all, args.test_basic, args.test_data, args.test_scrape,
        args.test_search, args.test_search_scrape
    ]):
        args.test_all = True
    
    return args

if __name__ == "__main__":
    args = parse_arguments()
    
    if args.help:
        show_help_examples()
        sys.exit(0)
    
    sys.exit(run_api_health_check(args)) 