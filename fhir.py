import jwt
import time
from uuid import uuid4
import requests
import json
import os
import xmltodict

client_id = "05a6fa96-b9d3-47df-a7d2-0ccb33c33cc7"

BASE_AUTH_URL = "https://fhir.epic.com/interconnect-fhir-oauth/"
BASE_FHIR_URL = "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"

# Your private key (in PEM format)
private_key = None
bearer_token = None
with open("privatekey.pem","r") as f:
    private_key = f.read()

with open("bearer.txt","r") as f:
    bearer_token = f.read().replace("\n", "")

# JWT payload
payload = {
    "iss": client_id,
    "sub": client_id,
    "aud": "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
    "jti": str(uuid4()),
    "exp": int(time.time()) + 300  # Expires in 5 minutes
}

# Generate the JWT
jwt_token = jwt.encode(payload, private_key, algorithm="RS384")

auth_headers ={
    "Content-Type": "application/x-www-form-urlencoded",
}

data = {
    "grant_type": "client_credentials",
    "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    "client_assertion": jwt_token,
}

auth_response = requests.post(BASE_AUTH_URL + "/oauth2/token", headers=auth_headers, data=data)
auth_response_data = json.loads(auth_response.text)
bearer_token = auth_response_data["access_token"]

headers = {
    "Authorization": f"Bearer {bearer_token}",
    "Accept": "application/fhir+json",
    "Prefer": "respond-async",
}

response = requests.get(BASE_FHIR_URL + "/Patient/erXuFYUfucBZaryVksYEcMg3/$export", headers=headers)
response_data = json.loads(response.text)
xml_parsed = xmltodict.parse(response.text)
data = json.dumps(xml_parsed)

print(response.text)