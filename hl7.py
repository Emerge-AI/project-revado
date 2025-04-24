import pysftp
from fuzzywuzzy import fuzz
import pprint
import pdb
import re

# Connection details
host = "sftp.glaceemr.com"
port = 2200
username = "Eclinic_ADT"  # Replace with your credentials
password = "G!3n@$6@J@Eclinic!Pr3m!3R"  # Replace with your password

# Disable host key checking (for testing only!)
cnopts = pysftp.CnOpts()
cnopts.hostkeys = None  # Not secure for production!

def parse_note_by_segment(content):
    """Split HL7 message into segments"""
    data = {
        "PID": None,
        "PV1": None,
        "FT1": [],
    }
    segments = re.split(r'\n', content)
    if segments and "PID" in segments[2]:
        if fuzz.token_sort_ratio(segments[2].split('|')[5], patient_name) < 80:
            return None
    for segment in segments:
        split_segment = segment.split('|')
        if split_segment and split_segment[0] == 'PID':
            data["PID"] = {
                "id": split_segment[1],
                "name": split_segment[5],
                "dob": split_segment[7],
                "sex": split_segment[8],
                "race": split_segment[10],
                "address": split_segment[11],
                "phone": split_segment[13],
                "primary_language": split_segment[15],
                "ethnicity": split_segment[22],
            }
            pdb.set_trace()
        elif split_segment and split_segment[0] == 'PV1':
            data["PV1"] = {
                "patient_class": split_segment[1],
                "prior_patient_location": split_segment[6],
                "attending_doctor_id": split_segment[7],
            }
        elif split_segment and split_segment[0] == 'FT1':
            icd_code_re = r'([A-Z0-9.]+)\^\^I10'
            data["FT1"].append({
                "transaction_id": split_segment[2],
                "transaction_date": split_segment[4],
                "transaction_type": split_segment[6],
                "transaction_code": split_segment[7],
                "transaction_description": split_segment[8],
                "transaction_description_2": split_segment[9],
                "transaction_amount": split_segment[12],
                "icd_codes": re.findall(icd_code_re, split_segment[19]),
                "cpt_code": split_segment[25],
                "cpt_code_modifier": split_segment[26].strip("^^^"),
            })
    return data


def search_patient_name_in_dft(patient_name, sftp_conn):
    """
    Search for a patient name in all files in the DFT directory using fuzzy matching.

    Args:
        patient_name (str): The name of the patient to search for.
        sftp_conn: Active SFTP connection object.

    Returns:
        dict: Dictionary with filenames as keys and matching lines as values.
    """
    matches = []
    
    try:
        # Get list of files in the DFT directory
        files = sftp_conn.listdir("DFT")

        for filename in files:
            full_path = f"DFT/{filename}"
            print(f"Checking file for name: {patient_name} in {full_path}")
            
            # Read file content
            with sftp_conn.open(full_path, "r") as f:
                content = f.read()
                if isinstance(content, bytes):
                    content = content.decode('utf-8', errors='replace')
                segment_data = parse_note_by_segment(content)         
                if segment_data:
                    matches.append(segment_data)
    except Exception as e:
        print(f"Error searching for patient name in DFT directory: {str(e)}")
    
    return matches


if __name__ == "__main__":
    # Uncomment the following line to run the CARC and denial search independently
    # search_all_directories_for_carc_and_denials()
    # Example: Search for a patient name in DFT directory
    sftp_connection = pysftp.Connection(
        host=host,
        port=port,
        username=username,
        password=password,
        cnopts=cnopts
    )
    patient_name = "MARGARET BURROWS"  # Replace with the actual patient name
    results = search_patient_name_in_dft(patient_name, sftp_connection)
    print(f"Found {len(results)} results for {patient_name}")
    pprint.pprint(results)
