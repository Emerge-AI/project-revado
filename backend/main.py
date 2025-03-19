from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import asyncio
from backend.scraper import PolicyScraper
from backend.search import PolicySearcher

app = FastAPI(title="Payer Policy Management API",
             description="API for scraping and managing payer policies")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PolicySource(BaseModel):
    url: str
    payer_name: str
    policy_type: Optional[str] = None
    query: Optional[str] = None

class PolicyData(BaseModel):
    payer_name: str
    policy_content: str
    source_url: str
    retrieved_date: datetime
    citations: List[str] = []
    attachments: List[str] = []
    status: str = "pending"
    error: Optional[str] = None
    policy_id: Optional[int] = None

class SearchResult(BaseModel):
    url: str
    title: str
    summary: str
    relevance_score: float
    found_date: datetime

class SearchRequest(BaseModel):
    search_term: str
    payer_name: Optional[str] = None
    max_results: Optional[int] = 5

# In-memory storage for policies (replace with database in production)
policies_db = {}

# Create a mapping of policy IDs to URLs for easier access
policy_id_to_url = {}
next_policy_id = 1

@app.on_event("startup")
async def initialize_db():
    """Initialize the database with some test data"""
    global next_policy_id, policies_db, policy_id_to_url
    
    # Reset the database
    policies_db = {}
    policy_id_to_url = {}
    next_policy_id = 1
    
    # Add some test policies
    test_policies = [
        {
            "url": "https://test-example-1.com",
            "payer_name": "TestPayer",
            "content": "This is test policy 1 with example content."
        },
        {
            "url": "https://test-example-2.com",
            "payer_name": "TestPayer",
            "content": "This is test policy 2 with different example content."
        },
        {
            "url": "https://test-example-3.com",
            "payer_name": "AnotherPayer",
            "content": "This is test policy 3 from a different payer."
        }
    ]
    
    for policy in test_policies:
        policy_id = next_policy_id
        next_policy_id += 1
        
        policy_data = PolicyData(
            payer_name=policy["payer_name"],
            policy_content=policy["content"],
            source_url=policy["url"],
            retrieved_date=datetime.now(),
            citations=["Test citation"],
            attachments=[],
            status="completed",
            policy_id=policy_id
        )
        
        policies_db[policy["url"]] = policy_data
        policy_id_to_url[policy_id] = policy["url"]
    
    print(f"Initialized database with {len(policies_db)} test policies")

@app.get("/")
async def root():
    return {"message": "Payer Policy Management API"}

@app.post("/search-policies")
async def search_policies(search_request: SearchRequest):
    """
    Search for relevant policy pages across payer websites
    """
    try:
        searcher = PolicySearcher()
        results = await searcher.search_policies(
            search_term=search_request.search_term,
            payer_name=search_request.payer_name,
            max_results=search_request.max_results
        )
        
        # Debug: Print results to server log
        print(f"Search results: {results}")
        
        # Return raw results for debugging
        return {"results": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search-and-scrape", response_model=List[PolicyData])
async def search_and_scrape(search_request: SearchRequest, background_tasks: BackgroundTasks):
    """
    Search for policies and automatically scrape the most relevant results
    """
    try:
        global next_policy_id
        
        # First, search for relevant policies
        searcher = PolicySearcher()
        search_results = await searcher.search_policies(
            search_term=search_request.search_term,
            payer_name=search_request.payer_name,
            max_results=search_request.max_results
        )

        # Initialize scraper
        scraper = PolicyScraper()
        
        # Create policy entries and start scraping for each result
        policies = []
        for result in search_results:
            # Assign a policy ID
            policy_id = next_policy_id
            next_policy_id += 1
            
            # Create policy entry
            policy_data = PolicyData(
                payer_name=search_request.payer_name or "Unknown Payer",
                policy_content="",
                source_url=result['url'],
                retrieved_date=datetime.now(),
                status="processing",
                policy_id=policy_id
            )
            
            # Store in our "database"
            policies_db[result['url']] = policy_data
            policy_id_to_url[policy_id] = result['url']
            
            policies.append(policy_data)
            
            # Start scraping in background
            background_tasks.add_task(
                process_policy_scraping,
                result['url'],
                search_request.payer_name or "Unknown Payer",
                search_request.search_term,  # Use search term as query for better filtering
                scraper
            )
        
        return policies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scrape-policy", response_model=PolicyData)
async def scrape_policy(source: PolicySource, background_tasks: BackgroundTasks):
    try:
        global next_policy_id
        
        # Assign a policy ID
        policy_id = next_policy_id
        next_policy_id += 1
        
        # Create initial policy entry
        policy_data = PolicyData(
            payer_name=source.payer_name,
            policy_content="",
            source_url=source.url,
            retrieved_date=datetime.now(),
            status="processing",
            policy_id=policy_id
        )
        
        # Store in our "database"
        policies_db[source.url] = policy_data
        policy_id_to_url[policy_id] = source.url
        
        # Initialize scraper
        scraper = PolicyScraper()
        
        # Start scraping in background
        background_tasks.add_task(
            process_policy_scraping,
            source.url,
            source.payer_name,
            source.query,
            scraper
        )
        
        return policy_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/policies/{payer_name}", response_model=List[PolicyData])
async def get_policies(payer_name: str):
    try:
        # Filter policies by payer name
        return [
            policy for policy in policies_db.values()
            if policy.payer_name.lower() == payer_name.lower()
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/policy-by-id/{policy_id}", response_model=PolicyData)
async def get_policy_by_id(policy_id: int):
    if policy_id not in policy_id_to_url:
        raise HTTPException(status_code=404, detail="Policy ID not found")
    url = policy_id_to_url[policy_id]
    if url not in policies_db:
        raise HTTPException(status_code=404, detail="Policy URL not found")
    return policies_db[url]

@app.get("/policy/{url}", response_model=PolicyData)
async def get_policy_status(url: str):
    if url not in policies_db:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policies_db[url]

@app.post("/test-search")
async def test_search(search_request: SearchRequest):
    """
    Simple test endpoint for debugging
    """
    try:
        # Return dummy results for now
        return {
            "message": f"Received search request for term: {search_request.search_term}",
            "payer": search_request.payer_name,
            "max_results": search_request.max_results
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test-successful-scrape")
async def test_successful_scrape(source: PolicySource):
    """
    Simulates a successful scrape without actually scraping
    """
    try:
        global next_policy_id
        
        # Assign a policy ID
        policy_id = next_policy_id
        next_policy_id += 1
        
        # Create initial policy
        policy_data = PolicyData(
            payer_name=source.payer_name,
            policy_content="This is a test successful scrape with simulated content.",
            source_url=source.url,
            retrieved_date=datetime.now(),
            citations=["Test citation 1", "Test citation 2"],
            attachments=[],
            status="completed",
            error=None,
            policy_id=policy_id
        )
        
        # Store in our "database"
        policies_db[source.url] = policy_data
        policy_id_to_url[policy_id] = source.url
        
        return policy_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test-search-policies")
async def test_search_policies(search_request: SearchRequest):
    """
    Test endpoint for search policies that returns test data
    """
    try:
        # Filter policies by payer name if provided
        matching_policies = []
        for url, policy in policies_db.items():
            if (search_request.payer_name is None or 
                policy.payer_name.lower() == search_request.payer_name.lower()):
                # Simple text search in policy content
                if (search_request.search_term.lower() in policy.policy_content.lower() or
                    search_request.search_term.lower() in policy.source_url.lower()):
                    matching_policies.append(policy)
        
        # Format results as SearchResult objects
        results = []
        for policy in matching_policies[:search_request.max_results]:
            results.append({
                "url": policy.source_url,
                "title": f"Policy from {policy.payer_name}",
                "summary": policy.policy_content[:100] + "...",
                "relevance_score": 0.9,
                "found_date": policy.retrieved_date
            })
        
        return {"results": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test-search-and-scrape", response_model=List[PolicyData])
async def test_search_and_scrape(search_request: SearchRequest, background_tasks: BackgroundTasks):
    """
    Test endpoint for search-and-scrape that uses our test search-policies function
    """
    try:
        # First, use our test search function to get results
        search_results = await test_search_policies(search_request)
        search_results = search_results["results"]
        
        # Initialize scraper
        scraper = PolicyScraper()
        
        # Create policy entries and start scraping for each result
        policies = []
        for result in search_results:
            # Check if we already have this policy
            if result["url"] in policies_db:
                # Just return the existing policy
                policies.append(policies_db[result["url"]])
                continue
                
            # Assign a policy ID
            global next_policy_id
            policy_id = next_policy_id
            next_policy_id += 1
            
            # Create policy entry
            policy_data = PolicyData(
                payer_name=search_request.payer_name or "Unknown Payer",
                policy_content=f"Simulated content from {result['url']}",
                source_url=result["url"],
                retrieved_date=datetime.now(),
                status="completed",  # Mark as completed immediately
                policy_id=policy_id,
                citations=["Test citation"]
            )
            
            # Store in our "database"
            policies_db[result["url"]] = policy_data
            policy_id_to_url[policy_id] = result["url"]
            
            policies.append(policy_data)
        
        return policies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_policy_scraping(url: str, payer_name: str, query: Optional[str], scraper: PolicyScraper):
    try:
        # Get the policy data from our storage
        policy_data = policies_db[url]
        
        # Perform the scraping
        result = await scraper.scrape_policy(url, payer_name, query)
        
        # Update the policy data
        policy_data.policy_content = result["policy_content"]
        policy_data.citations = result["citations"]
        policy_data.attachments = result["attachments"]
        policy_data.status = "completed"
        
    except Exception as e:
        # Update policy data with error
        policy_data = policies_db[url]
        policy_data.status = "failed"
        policy_data.error = str(e)

@app.get("/debug/policy-mappings")
async def debug_policy_mappings():
    """
    Debug endpoint to check policy ID mappings
    """
    return {
        "policy_id_to_url": policy_id_to_url,
        "next_policy_id": next_policy_id,
        "policies_in_db": len(policies_db)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
