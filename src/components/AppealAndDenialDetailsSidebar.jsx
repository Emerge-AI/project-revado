import React, { useState, useEffect } from 'react';
import { FaTimes, FaClock, FaFileExport, FaEnvelope, FaBell, FaEdit, FaDownload, FaRobot, FaSyncAlt, FaSave } from 'react-icons/fa';
// import { appealMockData } from '../mockData';
import { medicalRecordSummary, correctedClaimFile, letterOfMedicalNecessity } from '../mockData';

const PriorityBadge = ({ priority }) => {
    const colors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
    };

    const emojis = {
        high: '🟥',
        medium: '🟨',
        low: '🟩'
    };

    return (
        <span className={`inline-flex items-center justify-start gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors[priority]}`}>
            {emojis[priority]} {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
};

const AppealsAndDenialDetailsSidebar = ({ denial, appealData, isOpen, onClose, updateNotes, updateStatus, successProbability }) => {
    const appeal = denial ? appealData.find(appeal => appeal.id === denial.linkedAppealId) : null;
    const [notes, setNotes] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [status, setStatus] = useState(appeal?.status?.main || ''); // Initialize status

    // Define success probability reasons
    const successProbReasons = [
        { reason: 'Previously Appealed this Code Successfully' },
        { reason: 'Medical Documentation Added' },
        { reason: 'Following Payer Modifier Rules' }
    ];

    // Update notes whenever the appeal changes
    useEffect(() => {
        if (appeal) {
            setNotes(appeal.notes || ''); // Set notes from the appeal
            setStatus(appeal.status?.main || ''); // Set status from the appeal
        }
    }, [appeal]); // Dependency array includes appeal

    if (!denial) return null;

    const sendEmail = (email) => {
        window.location = "mailto:" + email;
    }

    const handleSaveNotes = () => {
        // Call the updateNotes function passed from the parent
        if (updateNotes && appeal) {
            updateNotes(appeal.id, notes); // Pass the appeal ID and updated notes
        }
        console.log('Saving notes:', notes);
        setIsEditing(false);
        setLastSaved(new Date().toLocaleString());
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        if (updateStatus && appeal) {
            updateStatus(appeal.id, newStatus); // Pass the appeal ID and updated status
        }
    };

    const downloadDocs = () => {
        console.log(appeal)
        if (appeal && appeal.supportingDocs) {
            appeal.supportingDocs.forEach(doc => {
                let blob;
                if (doc === "Appeal Letter") {
                    // Create the appeal letter document using the provided template
                    const letterTemplate = `
[Your Name]
Medical Billing Specialist
Wyandot Memorial Hospital
885 N Sandusky Ave
Upper Sandusky, OH 43351
(419) 294-4991
email@wyandotmemorial.org
${new Date().toLocaleString()}

${denial.payer} Claims Department & Appeals Department
PO Box 1459
Minneapolis, MN 55440-1459

Re: Appeal for Denied Medical Claim
Patient Name: ${denial.patient.name}
Date of Service: ${denial.serviceDate}
Claim Number: ${denial.denialId}
Policy Number: ${denial.patient.mrn}

Dear ${denial.payer} Claims/Appeals Department,

I am writing to formally appeal the denial of the medical claim for ${denial.patient.name} for services rendered on ${denial.serviceDate}. As a medical billing specialist representing [Your Facility/Organization Name], I have reviewed the denial reason provided and believe this decision was made in error. I respectfully request a reconsideration of this claim.

Reason for Denial: [State the reason for denial as provided by the insurance company, e.g., "lack of medical necessity," "coding error," "missing information," etc.]

Grounds for Appeal:

Medical Necessity: The services provided were medically necessary for the diagnosis and treatment of [Patient's Condition]. Attached is supporting documentation, including the patient's medical records, physician notes, and test results, which demonstrate the necessity of the treatment.

Coding Accuracy: The claim was submitted with the appropriate CPT and ICD-10 codes ([list codes if applicable]) that accurately reflect the services rendered. If there was a coding error, we have reviewed and corrected the claim accordingly.

Authorization/Pre-Certification: If prior authorization was required, we have confirmed that it was obtained on [Date] (see attached authorization confirmation).

Policy Coverage: The services rendered are covered under the patient's policy as outlined in their benefits summary.

Supporting Documentation:
To assist in your review, I have included the following documents:

- Patient's medical records and physician notes
- Itemized billing statement
- Explanation of Benefits (EOB)
- Prior authorization confirmation (if applicable)
- Any additional supporting documentation

I kindly request a thorough review of this appeal and a prompt response. If additional information is required, please do not hesitate to contact me at [Your Phone Number] or [Your Email Address].

Thank you for your attention to this matter. I look forward to resolving this issue and ensuring that ${denial.patient.name} receives the coverage they are entitled to under their policy.

Sincerely,
[Your Full Name]
Medical Billing Specialist
[Your Facility/Organization Name]

Enclosures:
- ${appeal.supportingDocs.filter(d => d !== "Appeal Letter").join(', ')}
                    `;
                    blob = new Blob([letterTemplate], { type: 'text/plain' });
                } else if (doc.toLowerCase() === "medical record summary") {
                    blob = new Blob([medicalRecordSummary], { type: 'text/plain' });
                } else if (doc.toLowerCase() === "corrected claim file") {
                    blob = new Blob([correctedClaimFile], { type: 'text/plain' });
                } else if (doc.toLowerCase() === "letter of medical necessity") {
                    blob = new Blob([letterOfMedicalNecessity], { type: 'text/plain' });
                } else {
                    // Create a generic document for other types
                    blob = new Blob([`This is a fake document for ${doc}`], { type: 'text/plain' });
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${doc}.txt`; // Set the file name
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Clean up the URL object
            });
        }
    };

    const exportToCSV = () => {
        if (appeal && denial) {
            const csvRows = [];
            const headers = [
                'Field', 'Value'
            ];
            csvRows.push(headers.join(','));

            // Add relevant appeal data to CSV
            const appealData = [
                { field: 'Appeal ID', value: appeal.id },
                { field: 'Status', value: appeal.status.main },
                { field: 'Assigned To', value: `${appeal.assignedTo.name} (${appeal.assignedTo.role})` },
                { field: 'Submitted Date', value: appeal.submittedDate },
                { field: 'Expected Response Date', value: appeal.expectedResponseDate },
                { field: 'Amount Appealed', value: `$${appeal.amountAppealed.toLocaleString()}` },
                { field: 'Potential Recovery', value: `$${appeal.potentialRecovery.toLocaleString()}` },
                { field: 'Notes', value: appeal.notes || 'No notes available.' },
                { field: 'Success Probability', value: `${appeal.successProbability}%` },
                { field: 'Days Left', value: appeal.daysLeft },
                { field: 'Appeal Type', value: appeal.appealType },
                { field: 'Appeal Category', value: appeal.appealCategory },
                { field: 'Cost of Appeal', value: `$${appeal.costOfAppeal.toLocaleString()}` },
                { field: 'Appeal Priority', value: appeal.appealPriority },
                { field: 'Appeal Source', value: appeal.appealSource },
            ];

            // Add relevant denial data to CSV
            const denialData = [
                { field: 'Denial ID', value: denial.denialId },
                { field: 'Denial Reason', value: denial.denialReason },
                { field: 'Denial Date', value: denial.denialDate },
                { field: 'Service Date', value: denial.serviceDate },
                { field: 'Payer', value: denial.payer },
                { field: 'Amount', value: `$${denial.amount.toLocaleString()}` },
                { field: 'Days Left to Appeal', value: denial.daysLeft },
                { field: 'Priority', value: denial.priority },
                { field: 'Appeal Manager', value: denial.appealManager },
            ];

            // Combine both appeal and denial data
            const combinedData = [...appealData, ...denialData];

            combinedData.forEach(row => {
                csvRows.push(`${row.field},${row.value}`);
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Appeal_${appeal.id}.csv`; // Set the file name
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up the URL object
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`fixed inset-0 overflow-hidden z-50 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-y-0 right-0 pl-8 max-w-[75vw] flex">
                        <div className="w-screen max-w-4xl">
                            <div className="h-full flex flex-col bg-white shadow-xl">
                                {/* Header */}
                                <div className="px-3 py-1.5 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-md font-semibold text-gray-900 text-left">Denial & Appeal Details</h2>
                                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                        <FaTimes className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-2 overflow-y-auto pb-24">
                                    <div className="grid grid-cols-2 gap-2 h-full">
                                        {/* Left Column - Denial Details */}
                                        <div className="space-y-1 overflow-y-auto">
                                            {/* Basic Info Section */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Basic Information</h3>
                                                <div className="grid grid-cols-2 gap-0.5">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Denial ID</label>
                                                        <p className="text-xs text-gray-900">{denial.denialId}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Priority</label>
                                                        <div className="flex justify-start">
                                                            <PriorityBadge priority={denial.priority} />
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Status</label>
                                                        <div className="flex justify-start">
                                                            <span className="px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-50 text-blue-700">
                                                                {denial.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Appeal Manager</label>
                                                        <p className="text-xs text-gray-900">{denial.appealManager}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Patient Information */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Patient Information</h3>
                                                <div className="grid grid-cols-2 gap-0.5">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Name</label>
                                                        <p className="text-xs text-indigo-700 hover:text-indigo-900 cursor-pointer">{denial.patient.name}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">MRN</label>
                                                        <p className="text-xs text-gray-900">{denial.patient.mrn}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timeline Section */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Timeline</h3>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-start text-left">
                                                        <FaClock className="text-gray-400 mr-1 h-3 w-3 mt-0.5" />
                                                        <div>
                                                            <span className="text-xs text-gray-500">Service Provided:</span>
                                                            <span className="text-xs ml-1 text-gray-900">{denial.serviceDate}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start text-left">
                                                        <FaClock className="text-gray-400 mr-1 h-3 w-3 mt-0.5" />
                                                        <div>
                                                            <span className="text-xs text-gray-500">Denial Received:</span>
                                                            <span className="text-xs ml-1 text-gray-900">{denial.denialDate}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-orange-700 font-medium text-left">
                                                        {denial.daysLeft} days left to appeal
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Financial Section */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Financial Details</h3>
                                                <div className="grid grid-cols-2 gap-0.5">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Amount</label>
                                                        <p className="text-xs text-gray-900">${denial.amount.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Payer</label>
                                                        <p className="text-xs text-gray-900">{denial.payer}</p>
                                                    </div>
                                                    <div className="text-left col-span-2">
                                                        <label className="text-xs font-medium text-gray-500 block">Denial Reason</label>
                                                        <p className="text-xs text-gray-900">{denial.denialReason}</p>
                                                    </div>
                                                    <div className="text-left col-span-2">
                                                        <label className="text-xs font-medium text-gray-500 block">Root Cause</label>
                                                        <p className="text-xs text-gray-900">{denial.rootCause}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payer Contact Information */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Payer Contact Information</h3>
                                                <div className="grid grid-cols-2 gap-0.5">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Phone</label>
                                                        <p className="text-xs text-gray-900">{denial.payerContact.phone}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Email</label>
                                                        <p className="text-xs text-gray-900">{denial.payerContact.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payer Policy Reference */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Payer Policy Reference</h3>
                                                <div className="space-y-0.5 text-left">
                                                    <a href={denial.payerPolicyReference} className="text-xs text-indigo-700 hover:text-indigo-900 ">
                                                        View Policy
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Notes Section */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="text-sm font-medium text-gray-900">Notes</h3>
                                                    <div className="flex items-center gap-2">
                                                        {isEditing ? (
                                                            <button
                                                                onClick={handleSaveNotes}
                                                                className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full hover:bg-green-700 flex items-center gap-1"
                                                            >
                                                                <FaSave className="text-xs" />
                                                                Save
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setIsEditing(true)}
                                                                className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full hover:bg-blue-700 flex items-center gap-1"
                                                            >
                                                                <FaEdit className="text-xs" />
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {isEditing ? (
                                                    <textarea
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        className="w-full h-32 p-2 text-sm text-black border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="Enter your notes here..."
                                                    />
                                                ) : (
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {notes || 'No notes available.'}
                                                    </div>
                                                )}
                                                {lastSaved && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Last saved: {lastSaved}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Success Probability Section */}
                                            {appeal && (
                                                <div className="bg-white rounded-lg border border-gray-200 p-1.5 group">
                                                    <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Success Probability</h3>
                                                    <div className="flex items-center">
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                                style={{ width: `${successProbability}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="ml-2 text-xs text-gray-900">{successProbability}%</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 group-hover:block">
                                                        {successProbReasons.map((item, index) => (
                                                            <div key={index} className="text-left">
                                                                {item.reason}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column - Appeal Details */}
                                        {appeal && <div className="space-y-1 overflow-y-auto">
                                            {/* Appeal ID and Status */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <h3 className="text-sm font-medium text-gray-900 mb-0.5 text-left">Appeal Information</h3>
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Appeal ID</label>
                                                        <p className="text-xs text-gray-900">{appeal.id}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Status</label>
                                                        <div className="flex justify-start">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appeal.status.main.toLowerCase() === 'won'
                                                                ? 'bg-green-50 text-green-700'
                                                                : appeal.status.main.toLowerCase() === 'lost'
                                                                    ? 'bg-red-50 text-red-700'
                                                                    : 'bg-blue-50 text-blue-700'
                                                                }`}>
                                                                {appeal.status.main}
                                                            </span>
                                                            <span className="px-2 text-xs text-gray-500">{appeal.status.sub}</span>
                                                        </div>
                                                        <select
                                                            value={status}
                                                            onChange={handleStatusChange}
                                                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        >
                                                            <option value="Draft">Draft</option>
                                                            <option value="Under Review">Under Review</option>
                                                            <option value="Lost">Lost</option>
                                                            <option value="Won">Won</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assigned To */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="text-left">
                                                    <label className="text-xs font-medium text-gray-500 block">Assigned To</label>
                                                    <p className="text-xs text-gray-900">{appeal.assignedTo.name} ({appeal.assignedTo.role})</p>
                                                </div>
                                            </div>

                                            {/* Appeal Type and Category */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Appeal Type</label>
                                                        <p className="text-xs text-gray-900">{appeal.appealType}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Appeal Category</label>
                                                        <p className="text-xs text-gray-900">{appeal.appealCategory}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dates */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Submitted Date</label>
                                                        <p className="text-xs text-gray-900">{appeal.submittedDate}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Expected Response Date</label>
                                                        <p className="text-xs text-gray-900">{appeal.expectedResponseDate}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Days Left and Appeal Deadline */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Days Left</label>
                                                        <p className="text-xs text-gray-900">{appeal.daysLeft} days</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Appeal Deadline</label>
                                                        <p className="text-xs text-gray-900">{appeal.appealDeadline}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Amount Appealed and Potential Recovery */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Amount Appealed</label>
                                                        <p className="text-xs text-gray-900">${appeal.amountAppealed.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Potential Recovery</label>
                                                        <p className="text-xs text-gray-900">${appeal.potentialRecovery.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cost of Appeal */}
                                            {/* <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="text-left">
                                                    <label className="text-xs font-medium text-gray-500 block">Cost of Appeal</label>
                                                    <p className="text-xs text-gray-900">${appeal.costOfAppeal.toLocaleString()}</p>
                                                </div>
                                            </div> */}

                                            {/* Supporting Docs */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="text-left">
                                                    <label className="text-xs font-medium text-gray-500 block">Supporting Documents</label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {appeal.supportingDocs.map((doc, index) => (
                                                            <div key={index} className="text-left">
                                                                <a href="#" className="text-xs text-indigo-700 hover:text-indigo-900">
                                                                    {doc}
                                                                </a>
                                                                {index < appeal.supportingDocs.length - 1 && <span className="text-xs text-gray-500">,</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Appeal History */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="text-left">
                                                    <label className="text-xs font-medium text-gray-500 block">Appeal History</label>
                                                    <div className="space-y-1">
                                                        {appeal.appealHistory.map((history, index) => (
                                                            <div key={index} className="text-xs text-gray-900">
                                                                <span className="font-medium">{history.date}:</span> {history.action}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Communication Log */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="text-left">
                                                    <label className="text-xs font-medium text-gray-500 block">Communication Log</label>
                                                    <div className="space-y-1">
                                                        {appeal.communicationLog.map((log, index) => (
                                                            <div key={index} className="text-xs text-gray-900">
                                                                <span className="font-medium">{log.date} ({log.type}):</span> {log.summary}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Next Steps */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="text-left">
                                                    <label className="text-xs font-medium text-gray-500 block">Next Steps</label>
                                                    <p className="text-xs text-gray-900">{appeal.nextSteps}</p>
                                                </div>
                                            </div>

                                            {/* Assigned Team */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="text-left">
                                                    <label className="text-xs font-medium text-gray-500 block">Assigned Team</label>
                                                    <p className="text-xs text-gray-900">{appeal.assignedTeam.join(', ')}</p>
                                                </div>
                                            </div>

                                            {/* Appeal Priority and Source */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Appeal Priority</label>
                                                        <p className="text-xs text-gray-900">{appeal.appealPriority}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <label className="text-xs font-medium text-gray-500 block">Appeal Source</label>
                                                        <p className="text-xs text-gray-900">{appeal.appealSource}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                                    <div className="flex justify-start gap-1 flex-wrap">
                                        {!appeal && (
                                            <button
                                                className="bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-lg hover:bg-indigo-700 flex gap-1 items-center text-xs transition-colors duration-150"
                                                onClick={() => console.log('Create Appeal')}
                                            >
                                                <FaRobot className="text-lg" />
                                                <span className="font-medium">Create Appeal</span>
                                            </button>
                                        )}
                                        {/* Run AI Analysis */}
                                        <button
                                            className="bg-purple-600 text-white px-2 py-0.5 rounded-full shadow hover:bg-purple-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                            onClick={() => console.log('Run AI Analysis')}
                                        >
                                            <FaRobot className="text-xs" />
                                            <span>Run AI Analysis</span>
                                        </button>
                                        {!appeal && (
                                            <button
                                                className="bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow hover:bg-indigo-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                                onClick={() => console.log('Batch AI Appeal')}
                                            >
                                                <FaRobot className="text-xs" />
                                                <span>Create Appeal</span>
                                            </button>
                                        )}
                                        {/* Contact Payer */}
                                        <button
                                            className="bg-teal-600 text-white px-2 py-0.5 rounded-full shadow hover:bg-teal-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                            onClick={() => sendEmail(denial.payerContact.email)}
                                        >
                                            <FaEnvelope className="text-xs" />
                                            <span>Contact Payer</span>
                                        </button>
                                        {/* Send Reminder */}
                                        <button
                                            className="bg-orange-600 text-white px-2 py-0.5 rounded-full shadow hover:bg-orange-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                            onClick={() => console.log('Send Reminder')}
                                        >
                                            <FaBell className="text-xs" />
                                            <span>Send Reminder</span>
                                        </button>
                                        {/* Download Appeal Package */}
                                        <button
                                            className="bg-gray-600 text-white px-2 py-0.5 rounded-full shadow hover:bg-gray-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                            onClick={downloadDocs}
                                        >
                                            <FaDownload className="text-xs" />
                                            <span>Download Docs</span>
                                        </button>
                                        {/* Export to CSV */}
                                        <button
                                            className="bg-green-600 text-white px-2 py-0.5 rounded-full shadow-lg hover:bg-green-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                            onClick={exportToCSV}
                                        >
                                            <FaFileExport className="text-xs" />
                                            <span className="font-medium">Export to CSV</span>
                                        </button>
                                        <button
                                            className="bg-teal-600 text-white px-2 py-0.5 rounded-full shadow hover:bg-teal-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                        >
                                            <FaSyncAlt className="text-xs" />
                                            <span>Sync EHR</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AppealsAndDenialDetailsSidebar;