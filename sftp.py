import pysftp
import os
import re
from datetime import datetime
from operator import itemgetter
# Connection details
host = "sftp.glaceemr.com"
port = 2200
username = "Eclinic_ADT"  # Replace with your credentials
password = "G!3n@$6@J@Eclinic!Pr3m!3R"  # Replace with your password

# Disable host key checking (for testing only!)
cnopts = pysftp.CnOpts()
cnopts.hostkeys = None  # Not secure for production!

def decode_hl7_message(hl7_text):
    """Decode HL7 message into human readable format"""
    # Split message into segments
    segments = hl7_text.strip().split('\n')
    decoded = []
    
    # Function to format diagnosis codes for better readability
    def format_diagnosis_codes(code_string):
        if not code_string or '~' not in code_string:
            return code_string
            
        codes = code_string.split('~')
        formatted_codes = []
        
        for code in codes:
            parts = code.split('^')
            if len(parts) >= 1:
                formatted_code = parts[0]  # Extract just the code part
                formatted_codes.append(formatted_code)
                
        return ", ".join(formatted_codes)
    
    # Function to format long descriptions
    def format_long_description(desc, max_length=80):
        if not desc or len(desc) <= max_length:
            return desc
            
        # Split the description into chunks of max_length
        return desc[:max_length] + "..."
    
    for segment in segments:
        fields = segment.split('|')
        if not fields:  # Skip empty segments
            continue
            
        segment_type = fields[0]
        
        try:
            if segment_type == 'MSH':
                decoded.append("\nMessage Header (MSH):")
                if len(fields) > 3: decoded.append(f"- Sending Application: {fields[3]}")
                if len(fields) > 4: decoded.append(f"- Sending Facility: {fields[4]}")
                if len(fields) > 5: decoded.append(f"- Receiving Application: {fields[5]}")
                if len(fields) > 6: decoded.append(f"- Receiving Facility: {fields[6]}")
                if len(fields) > 7: decoded.append(f"- Message Date/Time: {fields[7]}")
                if len(fields) > 8: decoded.append(f"- Security: {fields[8]}")
                if len(fields) > 9: decoded.append(f"- Message Type: {fields[9]}")
                if len(fields) > 10: decoded.append(f"- Message Control ID: {fields[10]}")
                if len(fields) > 11: decoded.append(f"- Processing ID: {fields[11]}")
                if len(fields) > 12: decoded.append(f"- Version ID: {fields[12]}")
                
            elif segment_type == 'EVN':
                decoded.append("\nEvent Type (EVN):")
                if len(fields) > 1: decoded.append(f"- Event Type Code: {fields[1]}")
                if len(fields) > 2: decoded.append(f"- Event Date/Time: {fields[2]}")
                if len(fields) > 3: decoded.append(f"- Event Reason Code: {fields[3]}")
                
            elif segment_type == 'PID':
                decoded.append("\nPatient Information (PID):")
                # Patient ID and MRN
                if len(fields) > 1: decoded.append(f"- Set ID: {fields[1]}")
                if len(fields) > 2: decoded.append(f"- Patient ID: {fields[2]}")
                if len(fields) > 3: decoded.append(f"- Patient ID (Alt): {fields[3]}")
                
                # Patient Name
                if len(fields) > 5:
                    name_parts = fields[5].split('^')
                    if len(name_parts) >= 2:
                        decoded.append(f"- Patient Name: {name_parts[0]}, {name_parts[1]}")
                
                # Date of Birth
                if len(fields) > 7:
                    dob = fields[7]
                    if dob:
                        # Format date from YYYYMMDD to MM/DD/YYYY
                        if len(dob) == 8:
                            formatted_dob = f"{dob[4:6]}/{dob[6:8]}/{dob[0:4]}"
                            decoded.append(f"- Date of Birth: {formatted_dob}")
                        else:
                            decoded.append(f"- Date of Birth: {dob}")
                
                # Gender
                if len(fields) > 8: decoded.append(f"- Gender: {'Male' if fields[8] == 'M' else 'Female' if fields[8] == 'F' else fields[8]}")
                
                # Address
                if len(fields) > 11:
                    address_parts = fields[11].split('^')
                    address = []
                    if len(address_parts) >= 1 and address_parts[0]: address.append(address_parts[0])
                    if len(address_parts) >= 2 and address_parts[1]: address.append(address_parts[1])
                    if len(address_parts) >= 3 and address_parts[2]: address.append(address_parts[2])
                    if len(address_parts) >= 4 and address_parts[3]: address.append(address_parts[3])
                    if len(address_parts) >= 5 and address_parts[4]: address.append(address_parts[4])
                    if address:
                        decoded.append(f"- Address: {', '.join(address)}")
                
                # Phone
                if len(fields) > 13 and fields[13]:
                    decoded.append(f"- Phone: {fields[13]}")
                
                # Primary Language
                if len(fields) > 15 and fields[15]: 
                    decoded.append(f"- Primary Language: {fields[15]}")
                
                # Marital Status
                if len(fields) > 16 and fields[16]:
                    marital_status = fields[16]
                    status_map = {"M": "Married", "S": "Single", "D": "Divorced", "W": "Widowed"}
                    decoded.append(f"- Marital Status: {status_map.get(marital_status, marital_status)}")
                
                # Additional phone numbers
                if len(fields) > 40 and fields[40]: decoded.append(f"- Home Phone: {fields[40]}")
                if len(fields) > 41 and fields[41]: decoded.append(f"- Business Phone: {fields[41]}")
                
                # Attending Doctor
                if len(fields) > 42 and fields[42]: decoded.append(f"- Attending Physician: {fields[42]}")
                if len(fields) > 43 and fields[43]: decoded.append(f"- Hospital Location: {fields[43]}")
                
            elif segment_type == 'PV1':
                decoded.append("\nPatient Visit Information (PV1):")
                if len(fields) > 1: decoded.append(f"- Set ID: {fields[1]}")
                if len(fields) > 2: decoded.append(f"- Patient Class: {fields[2]}")
                if len(fields) > 3: decoded.append(f"- Assigned Location: {fields[3]}")
                if len(fields) > 4: decoded.append(f"- Admission Type: {fields[4]}")
                if len(fields) > 7: decoded.append(f"- Attending Doctor: {fields[7]}")
                if len(fields) > 8: decoded.append(f"- Referring Doctor: {fields[8]}")
                if len(fields) > 19: decoded.append(f"- Visit Number: {fields[19]}")
                if len(fields) > 44: decoded.append(f"- Admit Date/Time: {fields[44]}")
                
            elif segment_type == 'FT1':
                decoded.append(f"\nFinancial Transaction (FT1) - Entry {fields[1] if len(fields) > 1 else 'Unknown'}:")
                if len(fields) > 2: decoded.append(f"- Transaction ID: {fields[2]}")
                if len(fields) > 3: decoded.append(f"- Transaction Date: {fields[3]}")
                if len(fields) > 4: decoded.append(f"- Transaction Posting Date: {fields[4]}")
                if len(fields) > 6: decoded.append(f"- Transaction Type: {fields[6]}")
                if len(fields) > 7: decoded.append(f"- Transaction Code: {fields[7]}")
                
                # Format long descriptions
                if len(fields) > 8: 
                    desc = fields[8]
                    decoded.append(f"- Transaction Description: {format_long_description(desc)}")
                
                if len(fields) > 9: 
                    alt_desc = fields[9]
                    if alt_desc and alt_desc != fields[8]:  # Only show if different from main description
                        decoded.append(f"- Transaction Description (Alt): {format_long_description(alt_desc)}")
                
                if len(fields) > 11: decoded.append(f"- Transaction Amount: ${fields[11]}")
                if len(fields) > 12: decoded.append(f"- Transaction Quantity: {fields[12]}")
                if len(fields) > 13: decoded.append(f"- Facility: {fields[13]}")
                
                # Format diagnosis codes
                if len(fields) > 19 and fields[19]:
                    decoded.append(f"- Diagnosis Codes: {format_diagnosis_codes(fields[19])}")
                
                if len(fields) > 20: decoded.append(f"- Performed By: {fields[20]}")
                if len(fields) > 24: decoded.append(f"- Procedure Code: {fields[24]}")
                
            elif segment_type == 'PR1':
                decoded.append(f"\nProcedure (PR1):")
                if len(fields) > 1: decoded.append(f"- Procedure ID: {fields[1]}")
                if len(fields) > 2: decoded.append(f"- Procedure Code: {fields[2]}")
                
                # Format long procedure descriptions
                if len(fields) > 3:
                    proc_desc = fields[3]
                    decoded.append(f"- Procedure Description: {format_long_description(proc_desc)}")
                
                if len(fields) > 4: decoded.append(f"- Procedure Date: {fields[4]}")
                if len(fields) > 6: decoded.append(f"- Procedure Priority: {fields[6]}")
                if len(fields) > 10: decoded.append(f"- Anesthesia Code: {fields[10]}")
                if len(fields) > 16: decoded.append(f"- Diagnosis Code: {fields[16]}")
                
            elif segment_type == 'DG1':
                decoded.append(f"\nDiagnosis Information (DG1) - Entry {fields[1] if len(fields) > 1 else 'Unknown'}:")
                if len(fields) > 2: decoded.append(f"- Diagnosis Code Method: {fields[2]}")
                
                # Format diagnosis codes
                if len(fields) > 3 and fields[3]:
                    decoded.append(f"- Diagnosis Codes: {format_diagnosis_codes(fields[3])}")
                
                if len(fields) > 4: decoded.append(f"- Diagnosis Description: {fields[4]}")
                if len(fields) > 5: decoded.append(f"- Diagnosis Date/Time: {fields[5]}")
                if len(fields) > 6: decoded.append(f"- Diagnosis Type: {fields[6]}")
                
            elif segment_type == 'GT1':
                decoded.append("\nGuarantor Information (GT1):")
                if len(fields) > 2: decoded.append(f"- Guarantor Number: {fields[2]}")
                if len(fields) > 3:
                    guarantor_parts = fields[3].split('^')
                    if len(guarantor_parts) >= 2:
                        decoded.append(f"- Guarantor Name: {guarantor_parts[0]}, {guarantor_parts[1]}")
                if len(fields) > 5:
                    address_parts = fields[5].split('^')
                    if len(address_parts) >= 4:
                        decoded.append(f"- Address: {address_parts[0]}, {address_parts[3]}, {address_parts[4] if len(address_parts) > 4 else ''}")
                if len(fields) > 6: decoded.append(f"- Phone: {fields[6]}")
                if len(fields) > 11: decoded.append(f"- SSN: {fields[11]}")
                
            elif segment_type == 'IN1':
                decoded.append("\nInsurance Information (IN1):")
                if len(fields) > 2: decoded.append(f"- Insurance Plan ID: {fields[2]}")
                if len(fields) > 3: decoded.append(f"- Policy Number: {fields[3]}")
                if len(fields) > 4: decoded.append(f"- Insurance Company: {fields[4]}")
                if len(fields) > 5:
                    address_parts = fields[5].split('^')
                    if len(address_parts) >= 4:
                        decoded.append(f"- Address: {address_parts[0]}, {address_parts[3] if len(address_parts) > 3 else ''}, {address_parts[4] if len(address_parts) > 4 else ''}")
                if len(fields) > 16:
                    insured_parts = fields[16].split('^')
                    if len(insured_parts) >= 2:
                        decoded.append(f"- Insured's Name: {insured_parts[0]}, {insured_parts[1] if len(insured_parts) > 1 else ''}")
                if len(fields) > 18: decoded.append(f"- Insured's Date of Birth: {fields[18]}")
                
            else:
                # For any other segment types we didn't explicitly handle
                decoded.append(f"\n{segment_type} Segment:")
                decoded.append(f"- Raw Data: {' | '.join(fields[1:])}")
                
        except Exception as e:
            decoded.append(f"Error processing {segment_type} segment: {str(e)}")
            
    return "\n".join(decoded)

def extract_dft_info(hl7_text):
    """Extract key information from DFT message"""
    # Parse the message to extract required fields
    patient_info = {"lastname": "", "firstname": "", "time": "", "total_amount": 0.0}
    
    # Split message into segments
    segments = hl7_text.strip().split('\n')
    
    for segment in segments:
        fields = segment.split('|')
        if not fields:  # Skip empty segments
            continue
            
        segment_type = fields[0]
        
        try:
            # Get patient name from PID segment
            if segment_type == 'PID' and len(fields) > 5:
                name_parts = fields[5].split('^')
                if len(name_parts) >= 2:
                    patient_info["lastname"] = name_parts[0]
                    patient_info["firstname"] = name_parts[1]
            
            # Get transaction date from FT1 segment
            elif segment_type == 'FT1':
                if len(fields) > 3 and not patient_info["time"]:
                    # Extract transaction date
                    date_str = fields[3]
                    if date_str:
                        # Convert from common HL7 format (YYYYMMDD) to datetime
                        try:
                            if len(date_str) >= 8:
                                patient_info["time"] = datetime.strptime(date_str[:8], "%Y%m%d")
                        except ValueError:
                            pass
                
                # Add transaction amount
                if len(fields) > 11:
                    try:
                        amount = float(fields[11]) if fields[11] else 0.0
                        patient_info["total_amount"] += amount
                    except ValueError:
                        pass
        
        except Exception as e:
            print(f"Error processing {segment_type} segment: {str(e)}")
    
    return patient_info

try:
    with pysftp.Connection(
        host=host,
        port=port,
        username=username,
        password=password,
        cnopts=cnopts
    ) as sftp:
       
        # Example: List files
        # with sftp.open("ADT/ADT-981_eclinic_24122402_9726.txt", "r") as f:
        #     print(f.read())
            
    
        # List all files in root directory
        print("Files on server (root directory):")
        print(sftp.listdir())
        
        # List all DFT files with patient info, sorted by time
        print("\nDFT Files sorted by time:")
        print("-" * 80)
        print(f"{'Last Name':<15} {'First Name':<15} {'Date':<12} {'Total Amount':<15} {'Filename':<30}")
        print("-" * 80)
        
        dft_files = sftp.listdir("DFT")
        dft_info_list = []
        
        # Process each DFT file
        for filename in dft_files:
            if filename.startswith("DFT-"):
                file_path = f"DFT/{filename}"
                try:
                    with sftp.open(file_path, "r") as f:
                        content = f.read()
                        content_str = content.decode() if isinstance(content, bytes) else content
                        info = extract_dft_info(content_str)
                        info["filename"] = filename
                        dft_info_list.append(info)
                except Exception as e:
                    print(f"Error processing {filename}: {e}")
        
        # Sort by time (if available)
        sorted_dft_info = sorted(
            [info for info in dft_info_list if info["time"]], 
            key=lambda x: x["time"]
        )
        
        # Add files without time at the end
        sorted_dft_info.extend([info for info in dft_info_list if not info["time"]])
        
        # Display the sorted information
        for info in sorted_dft_info:
            date_str = info["time"].strftime("%Y-%m-%d") if info["time"] else "N/A"
            print(f"{info['lastname']:<15} {info['firstname']:<15} {date_str:<12} ${info['total_amount']:<14.2f} {info['filename']:<30}")
        
        # List DFT directory files  
        print("\nFiles in DFT directory:")
        print(sftp.listdir("DFT"))
        
        # Read and decode the DFT file
        dft_file_path = "DFT/DFT-962_eclinic_25041507_647.txt"
        print(f"\nReading and decoding {dft_file_path}:")
        with sftp.open(dft_file_path, "r") as f:
            raw_content = f.read()
            print("\nRaw HL7 Message:")
            print("-" * 50)
            print(raw_content)
            print("-" * 50)
            print("\nDecoded Human-Readable Format:")
            print("-" * 50)
            print(decode_hl7_message(raw_content.decode() if isinstance(raw_content, bytes) else raw_content))
            print("-" * 50)
            
        # Example: Read a file from ADT directory
        # with sftp.open("ADT/ADT-981_eclinic_24122402_9726.txt", "r") as f:
        #     print(f.read())
            
        # Example: Download a file
        # sftp.get("ADT/ADT-0000_eclinic_24122402_1147.txt", "local_adt_file.txt")

except Exception as e:
    print(f"Error: {e}")