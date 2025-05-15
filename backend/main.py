from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
from backend.scraper import PolicyScraper
from backend.search import PolicySearcher
import json
import os
from pathlib import Path

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

# Appeal Letter Generation Models
class Patient(BaseModel):
    firstName: str
    lastName: str
    dob: str
    medicaidId: Optional[str] = None
    medicareId: Optional[str] = None

class Facility(BaseModel):
    npi: str
    name: str
    address: str
    contact: Optional[str] = None

class TherapySession(BaseModel):
    discipline: str
    minutes: int

class Episode(BaseModel):
    dosFrom: str
    dosTo: str
    therapy: List[TherapySession]
    levelOfCare: Optional[str] = None
    physician: Optional[str] = None

class Payer(BaseModel):
    planType: str
    policySection: Optional[str] = None
    contactInfo: Optional[str] = None

class Denial(BaseModel):
    remitDate: str
    carc: str
    rarc: str
    amountDenied: float
    reasonText: str
    claimControlNumber: Optional[str] = None

class AppealRepresentative(BaseModel):
    hasAOR: bool
    name: Optional[str] = None
    relationship: Optional[str] = None

class Appeal(BaseModel):
    level: str
    deadline: str
    representative: AppealRepresentative

class Attachment(BaseModel):
    type: str
    filename: str
    description: Optional[str] = None

class AppealPacket(BaseModel):
    patient: Patient
    facility: Facility
    payer: Payer
    episode: Episode
    denial: Denial
    appeal: Appeal
    attachments: List[Attachment] = []
    additionalNotes: Optional[str] = None

class AppealLetterResponse(BaseModel):
    letter_text: str
    letter_id: str
    created_date: datetime
    attachments_info: List[dict] = []

# In-memory storage for policies (replace with database in production)
policies_db = {}

# Create a mapping of policy IDs to URLs for easier access
policy_id_to_url = {}
next_policy_id = 1

# In-memory storage for appeal letters
appeal_letters_db = {}
next_appeal_id = 1

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
        
        # Sanitize results to ensure all values are JSON serializable
        sanitized_results = []
        for result in results:
            sanitized_result = {}
            for key, value in result.items():
                # Convert any problematic types to strings
                if callable(value):
                    sanitized_result[key] = str(value())
                elif isinstance(value, (int, float, bool, str, type(None))):
                    sanitized_result[key] = value
                else:
                    # For any other types, convert to string
                    sanitized_result[key] = str(value)
            
            # Check if relevance_score is zero and assign a default score based on content match
            if sanitized_result.get('relevance_score', 0) == 0:
                search_term_lower = search_request.search_term.lower()
                title_lower = sanitized_result.get('title', '').lower()
                summary_lower = sanitized_result.get('summary', '').lower()
                
                # Calculate a simple relevance score based on term frequency
                score = 0.0
                if search_term_lower in title_lower:
                    score += 0.5
                
                # Check for individual words in the search term
                for word in search_term_lower.split():
                    if len(word) > 3:  # Only consider meaningful words
                        if word in title_lower:
                            score += 0.3
                        if word in summary_lower:
                            score += 0.2
                
                # Ensure score is between 0.1 and 0.9
                score = min(0.9, max(0.1, score))
                print(f"Calculated fallback relevance score: {score} for {sanitized_result.get('url')}")
                sanitized_result['relevance_score'] = score
            
            sanitized_results.append(sanitized_result)
        
        # Return sanitized results
        return {"results": sanitized_results}
    except Exception as e:
        import traceback
        error_stack = traceback.format_exc()
        print(f"Error in search_policies: {str(e)}")
        print(error_stack)
        
        # Return a proper JSON response with error details
        return {
            "error": True,
            "message": str(e),
            "details": "An error occurred during the search. Please check the server logs for more information.",
            "search_request": {
                "search_term": search_request.search_term,
                "payer_name": search_request.payer_name,
                "max_results": search_request.max_results
            }
        }

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

@app.post("/debug-search-policies")
async def debug_search_policies(search_request: SearchRequest):
    """
    Debug version of search_policies that provides detailed output for troubleshooting
    """
    try:
        searcher = PolicySearcher()
        print(f"Starting debug search for '{search_request.search_term}' on payer '{search_request.payer_name}'")
        
        results = await searcher.search_policies(
            search_term=search_request.search_term,
            payer_name=search_request.payer_name,
            max_results=search_request.max_results
        )
        
        # Debug: Print results to server log
        print(f"Debug search results raw: {results}")
        
        # Process each result to ensure it's serializable and print details
        processed_results = []
        for i, result in enumerate(results):
            print(f"Result {i+1}:")
            processed_result = {}
            for key, value in result.items():
                print(f"  {key}: {type(value)} = {value}")
                # Handle different types
                if callable(value):
                    processed_value = str(value())
                    print(f"    - Callable converted to: {processed_value}")
                    processed_result[key] = processed_value
                elif hasattr(value, "__dict__"):
                    processed_value = str(value)
                    print(f"    - Object converted to: {processed_value}")
                    processed_result[key] = processed_value
                else:
                    processed_result[key] = value
            processed_results.append(processed_result)
            
        return {
            "results": processed_results,
            "success": True,
            "message": "Debug search completed successfully"
        }
    except Exception as e:
        import traceback
        error_stack = traceback.format_exc()
        print(f"Error in debug_search_policies: {str(e)}")
        print(error_stack)
        
        # Return detailed error information
        return {
            "error": True,
            "message": str(e),
            "traceback": error_stack,
            "search_request": {
                "search_term": search_request.search_term,
                "payer_name": search_request.payer_name,
                "max_results": search_request.max_results
            }
        }

# Appeal Letter Generation Endpoints

@app.post("/generate-appeal-letter", response_model=AppealLetterResponse)
async def generate_appeal_letter(packet: AppealPacket):
    """
    Generate an appeal letter based on patient, payer, and denial information
    """
    try:
        global next_appeal_id
        letter_id = f"appeal_{next_appeal_id}"
        next_appeal_id += 1
        
        # Log receipt of appeal packet
        print(f"Generating appeal letter: {letter_id}")
        print(f"Patient: {packet.patient.firstName} {packet.patient.lastName}")
        print(f"Payer: {packet.payer.planType}")
        
        # Generate the appeal letter
        letter_text = generate_appeal_letter_text(packet)
        
        # Create response object
        response = AppealLetterResponse(
            letter_text=letter_text,
            letter_id=letter_id,
            created_date=datetime.now(),
            attachments_info=[{"filename": attachment.filename, "type": attachment.type} 
                             for attachment in packet.attachments]
        )
        
        # Save to our in-memory database
        appeal_letters_db[letter_id] = {
            "packet": packet.dict(),
            "response": response.dict(),
            "created_date": datetime.now()
        }
        
        return response
    except Exception as e:
        import traceback
        error_stack = traceback.format_exc()
        print(f"Error in generate_appeal_letter: {str(e)}")
        print(error_stack)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-appeal-attachments/{letter_id}")
async def upload_appeal_attachments(
    letter_id: str, 
    files: List[UploadFile] = File(...),
    file_types: str = Form(...)
):
    """
    Upload attachment files for an appeal letter
    """
    try:
        if letter_id not in appeal_letters_db:
            raise HTTPException(status_code=404, detail="Appeal letter not found")
        
        # Parse the file_types JSON string
        file_types_dict = json.loads(file_types)
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads") / letter_id
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save uploaded files
        saved_files = []
        for file in files:
            file_path = upload_dir / file.filename
            
            # Get file type from the dictionary
            file_type = file_types_dict.get(file.filename, "unknown")
            
            # Write file content
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Add to saved files list
            saved_files.append({
                "filename": file.filename,
                "path": str(file_path),
                "type": file_type,
                "size": len(content)
            })
        
        # Update appeal record with attachment information
        appeal_letters_db[letter_id]["attachments"] = saved_files
        
        return {"message": f"Successfully uploaded {len(saved_files)} files", "files": saved_files}
    except Exception as e:
        import traceback
        error_stack = traceback.format_exc()
        print(f"Error in upload_appeal_attachments: {str(e)}")
        print(error_stack)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/appeal-letter/{letter_id}", response_model=AppealLetterResponse)
async def get_appeal_letter(letter_id: str):
    """
    Retrieve a previously generated appeal letter
    """
    if letter_id not in appeal_letters_db:
        raise HTTPException(status_code=404, detail="Appeal letter not found")
    
    # Convert the stored dictionary back to a response object
    response_dict = appeal_letters_db[letter_id]["response"]
    response_dict["created_date"] = datetime.fromisoformat(response_dict["created_date"]) \
        if isinstance(response_dict["created_date"], str) else response_dict["created_date"]
    
    return AppealLetterResponse(**response_dict)

@app.get("/appeal-letters", response_model=List[Dict[str, Any]])
async def list_appeal_letters():
    """
    List all generated appeal letters
    """
    # Return a list of basic information about each appeal letter
    appeal_letters = []
    for letter_id, data in appeal_letters_db.items():
        packet = data["packet"]
        appeal_letters.append({
            "letter_id": letter_id,
            "patient_name": f"{packet['patient']['firstName']} {packet['patient']['lastName']}",
            "payer_name": packet["payer"]["planType"],
            "created_date": data["created_date"],
            "appeal_level": packet["appeal"]["level"]
        })
    
    return appeal_letters

def generate_appeal_letter_text(packet: AppealPacket) -> str:
    """
    Generate the text content of an appeal letter based on the provided packet
    """
    # Format the date
    today = datetime.now().strftime("%B %d, %Y")
    
    # Start building the letter
    letter = f"""
{today}

{packet.payer.planType}
{packet.payer.contactInfo or ""}

RE: APPEAL FOR DENIED SKILLED NURSING THERAPY SERVICES
Patient: {packet.patient.firstName} {packet.patient.lastName}
DOB: {packet.patient.dob}
Medicare ID: {packet.patient.medicareId or "N/A"}
Medicaid ID: {packet.patient.medicaidId or "N/A"}
Claim Control #: {packet.denial.claimControlNumber or "N/A"}
CARC: {packet.denial.carc}
RARC: {packet.denial.rarc}
Dates of Service: {packet.episode.dosFrom} to {packet.episode.dosTo}
Amount in Dispute: ${packet.denial.amountDenied:.2f}

To Whom It May Concern:

I am writing to appeal the denial of skilled therapy services for the above-referenced patient at {packet.facility.name}. This appeal is being submitted for the {packet.appeal.level} level of review within the required timeframe. The denial was received on {packet.denial.remitDate} with the following explanation: "{packet.denial.reasonText}".

BACKGROUND:
The patient received necessary skilled therapy services at {packet.facility.name} from {packet.episode.dosFrom} to {packet.episode.dosTo}. These services included:
"""

    # Add therapy details
    for therapy in packet.episode.therapy:
        letter += f"- {therapy.discipline} for {therapy.minutes} minutes\n"
    
    # Add policy information and Jimmo reference
    letter += f"""
GROUNDS FOR APPEAL:
The denial of these medically necessary skilled therapy services contradicts Medicare/Medicaid guidelines that recognize the medical necessity of skilled therapy services for maintaining or preventing decline in a patient's condition. According to {packet.payer.policySection or "the relevant policy guidelines"} and the Jimmo Settlement Agreement (January 2013), skilled therapy services are covered when:

1. The services require the skills of a qualified therapist
2. The services are reasonable and necessary for the treatment of the patient's illness or injury
3. The patient requires skilled therapy to maintain function or prevent or slow further deterioration

MEDICAL NECESSITY DOCUMENTATION:
The attached clinical documentation demonstrates that the services provided were medically necessary as defined by Medicare guidelines and the {packet.payer.planType} policies. The skilled therapy was required to:
- Maintain the patient's current functional status
- Prevent deterioration of function
- Provide specialized skilled interventions that could not be safely or effectively provided by non-skilled personnel

CONCLUSION:
Based on the above, I request reconsideration of this denial and approval of payment for the services rendered. The patient required and received medically necessary skilled therapy services that meet all coverage criteria.

"""

    # Add signature block based on whether there's a representative
    if packet.appeal.representative.hasAOR:
        letter += f"""
Sincerely,

{packet.appeal.representative.name or "[Representative Name]"}
Authorized Representative for {packet.patient.firstName} {packet.patient.lastName}
{packet.appeal.representative.relationship or "Relationship: [relationship]"}
"""
    else:
        letter += f"""
Sincerely,

[Provider Representative]
{packet.facility.name}
{packet.facility.address}
NPI: {packet.facility.npi}
"""

    # Add attachments
    letter += "\nATTACHMENTS:\n"
    if packet.attachments:
        for i, attachment in enumerate(packet.attachments, 1):
            letter += f"{i}. {attachment.filename} - {attachment.description or attachment.type}\n"
    else:
        letter += "1. [Denial Letter/Remittance Advice]\n"
        letter += "2. [Therapy Documentation]\n"
        letter += "3. [Physician Certification]\n"
        letter += "4. [Other Supporting Documentation]\n"

    return letter

@app.get("/test-appeal-letter")
async def test_appeal_letter():
    """
    Generate a test appeal letter with sample data
    """
    # Create a sample appeal packet
    test_packet = AppealPacket(
        patient=Patient(
            firstName="John",
            lastName="Smith",
            dob="1945-05-15",
            medicareId="123456789A",
            medicaidId="NY9876543"
        ),
        facility=Facility(
            npi="1234567890",
            name="Sunshine Skilled Nursing Facility",
            address="123 Care Lane, New York, NY 10001",
            contact="Tel: (555) 123-4567"
        ),
        payer=Payer(
            planType="Medicare Advantage",
            policySection="Chapter 8, Section 30 of the Medicare Benefit Policy Manual",
            contactInfo="123 Insurance Way, Suite 500, New York, NY 10001"
        ),
        episode=Episode(
            dosFrom="2023-06-01",
            dosTo="2023-06-30",
            therapy=[
                TherapySession(discipline="PT", minutes=750),
                TherapySession(discipline="OT", minutes=600)
            ],
            levelOfCare="PDPM",
            physician="Dr. Jane Johnson"
        ),
        denial=Denial(
            remitDate="2023-07-15",
            carc="50",
            rarc="N290",
            amountDenied=4250.75,
            reasonText="These services were not deemed to be medically necessary",
            claimControlNumber="CL123456789"
        ),
        appeal=Appeal(
            level="redetermination",
            deadline="2023-11-12",
            representative=AppealRepresentative(
                hasAOR=True,
                name="Sarah Smith",
                relationship="Daughter"
            )
        ),
        attachments=[
            Attachment(type="remit_pdf", filename="Denial_071523.pdf", description="Original Denial Letter"),
            Attachment(type="therapy_notes", filename="PT_Notes.pdf", description="Physical Therapy Documentation"),
            Attachment(type="physician_cert", filename="Certification.pdf", description="Physician Certification")
        ],
        additionalNotes="Patient has comorbidities including diabetes and hypertension that affect therapy needs."
    )
    
    # Generate and return the test letter
    letter_text = generate_appeal_letter_text(test_packet)
    
    return {
        "letter_text": letter_text,
        "test_packet": test_packet
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
