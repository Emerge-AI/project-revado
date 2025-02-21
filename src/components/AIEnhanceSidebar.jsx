import React, { useState, useEffect } from 'react';
import { FaTimes, FaRobot, FaSpinner, FaCheck, FaFileMedical, FaFileAlt, FaHospital, FaBalanceScale, FaFileContract, FaPhone, FaArrowUp, FaUserMd, FaGavel, FaBriefcase, FaSearch, FaPaperPlane, FaBell, FaCalendarCheck, FaFileSignature, FaInfoCircle, FaFileDownload } from 'react-icons/fa';

const ProcessStep = ({ step, isActive, isComplete }) => {
    return (
        <div className="flex items-center space-x-2">
            {isComplete ? (
                <FaCheck className="text-green-500 animate-scale" />
            ) : isActive ? (
                <FaSpinner className="animate-spin text-indigo-600" />
            ) : (
                <div className="w-4 h-4" />
            )}
            <span className={`text-sm ${isActive ? 'text-indigo-600 font-medium' : isComplete ? 'text-green-500' : 'text-gray-400'}`}>
                {step}
            </span>
        </div>
    );
};

const EnhancementSection = ({ title, icon: Icon, description, isActive, isComplete, currentStep }) => {
    const steps = ['Retrieve', 'Process', 'Attach + Cite'];

    return (
        <div className={`p-4 rounded-lg border ${isActive ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'} transition-all duration-300`}>
            <div className="flex items-center space-x-3 mb-2">
                <Icon className={`text-xl ${isActive ? 'text-indigo-600' : isComplete ? 'text-green-500' : 'text-gray-400'}`} />
                <h3 className={`font-medium ${isActive ? 'text-indigo-600' : isComplete ? 'text-green-500' : 'text-gray-600'}`}>{title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <div className="space-y-2">
                {steps.map((step, index) => (
                    <ProcessStep
                        key={step}
                        step={step}
                        isActive={isActive && currentStep === index}
                        isComplete={isComplete || (isActive && currentStep > index)}
                    />
                ))}
            </div>
        </div>
    );
};

const ActionProgress = ({ steps, isActive, onComplete, isCompleted, isExpanded, onToggleExpand }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);

    useEffect(() => {
        if (!isActive) {
            if (!isCompleted) {
                setCurrentStep(0);
                setCompletedSteps([]);
            }
            return;
        }

        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= steps.length - 1) {
                    clearInterval(stepInterval);
                    setTimeout(() => onComplete(), 1000);
                    return prev;
                }
                setCompletedSteps(completed => [...completed, prev]);
                return prev + 1;
            });
        }, 2000);

        return () => clearInterval(stepInterval);
    }, [isActive, steps.length, onComplete, isCompleted]);

    if (!isActive && !isCompleted) return null;

    return (
        <div className={`mt-4 space-y-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
            {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                        {completedSteps.includes(index) || isCompleted ? (
                            <FaCheck className="w-3 h-3 text-green-500 animate-scale" />
                        ) : currentStep === index ? (
                            <div className="relative">
                                <FaSpinner className="w-5 h-5 text-indigo-600 animate-spin" />
                                <div className="absolute inset-0 bg-white bg-opacity-75 animate-pulse" />
                            </div>
                        ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-gray-200" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className={`text-sm font-medium ${currentStep === index && !isCompleted ? 'text-indigo-600' : completedSteps.includes(index) || isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                            {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                        {((completedSteps.includes(index) || currentStep === index || isCompleted) && step.detail) && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-md p-2 animate-fadeIn">
                                {step.detail}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const SocialEnhancementButton = ({ icon: Icon, title, description, onClick, steps }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = async () => {
        if (isCompleted) {
            setIsExpanded(!isExpanded);
            return;
        }
        setIsProcessing(true);
        setIsExpanded(true);
        onClick();
    };

    const handleComplete = () => {
        setTimeout(() => {
            setIsProcessing(false);
            setIsCompleted(true);
        }, 1000);
    };

    const getDownloadButton = (title) => {
        let buttonText = '';
        let fileContent = '';
        let fileName = '';
        let fileType = '';

        switch (title) {
            case 'Payer Follow-Up':
                buttonText = 'Download Call Transcript';
                fileContent = `CALL TRANSCRIPT
============================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Appeal ID: APL-1001
Payer: UnitedHealthcare
Duration: 15:23

AI Agent Information:
-------------------
Agent Name: Sandy
ID: AI-${Math.random().toString(36).substr(2, 9)}
System: Revado AI

Representative Information:
-------------------------
Name: John Smith
ID: REP-${Math.random().toString(36).substr(2, 9)}
Department: Appeals Processing

Call Details:
------------
Call ID: CALL-${Math.random().toString(36).substr(2, 9)}
Reference: REF-${Math.random().toString(36).substr(2, 9)}

EXECUTIVE SUMMARY
----------------
1. Initial Verification
   - AI agent successfully authenticated
   - Appeal details verified
   - System credentials confirmed

2. Discussion Points
   - Appeal status confirmed
   - Documentation verification completed
   - Escalation process initiated

3. Next Steps
   - Clinical review scheduled
   - Follow-up automated for ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
   - Documentation status confirmed

4. Action Items
   - Escalation request processed
   - Priority status updated
   - Response timeline documented

FULL TRANSCRIPT
--------------
[00:00] System: Call initiated with UnitedHealthcare Appeals Department

[00:15] Auto System: "Thank you for calling UnitedHealthcare Appeals Department. This call may be recorded for quality assurance purposes."

[00:30] Representative: "Thank you for holding. This is John Smith from the Appeals Processing team. May I have your name and provider ID?"

[01:00] Sandy (AI): "Hello, I am Sandy, an AI representative from Revado. I'm calling regarding appeal APL-1001. My authentication code is RVD-${Math.random().toString(36).substr(2, 9)}."

[01:15] Representative: "Thank you, Sandy. I can verify your authentication code. For security purposes, could you please confirm the date of service for this appeal?"

[01:30] Sandy (AI): "The date of service is February 15, 2024. I can also confirm this is regarding a denial for missing modifier 25."

[01:45] Representative: "Perfect, I've located the appeal. Your authentication and appeal information are confirmed. What can I help you with today?"

[02:00] Sandy (AI): "I am conducting a status check for appeal APL-1001. My systems indicate it was submitted 7 days ago. Could you confirm its current status in your system?"

[02:15] Representative: "Yes, I can see the appeal is currently under clinical review. The documentation provided is complete and has been routed to our senior review team due to the case complexity."

[02:30] Sandy (AI): "Thank you. Based on the escalation to the senior review team, what is the expected timeline for a response? My protocols require specific timeframe documentation."

[02:45] Representative: "The clinical team will review this within 48 hours, and given the escalation, you should receive a response within 5-7 business days. I'm marking this as priority status."

[03:00] Sandy (AI): "Acknowledged. For verification: Are there any additional documents required at this time? My records show we submitted clinical notes and an operative report."

[03:15] Representative: "No additional documentation is needed. The clinical notes and operative report you provided are sufficient for the review."

[03:30] Sandy (AI): "I will update our system accordingly. Could you please confirm the following details for my records:
1. Appeal is under clinical review
2. No additional documentation needed
3. Expected response: 5-7 business days
4. Case marked as priority
Is this information correct?"

[03:45] Representative: "Yes, that's all correct. Would you like me to send an email confirmation of this conversation?"

[04:00] Sandy (AI): "Yes, please send the confirmation to appeals@revado.ai. I will create an automated follow-up reminder for 48 hours from now."

[04:15] Representative: "I'll send that right away. Is there anything else you need assistance with?"

[04:30] Sandy (AI): "No further assistance needed. I have logged all necessary information. Thank you for your help."

[04:45] Representative: "You're welcome. Thank you for calling UnitedHealthcare."

[05:00] System: Call ended

Notes:
------
AI agent Sandy successfully completed all verification protocols and obtained necessary status updates. Communication was efficient and all required information was documented. Automated follow-up has been scheduled and system records have been updated accordingly.

System Actions Taken:
-------------------
1. Appeal status updated in database
2. Follow-up reminder scheduled
3. Call transcript archived
4. Email confirmation pending
5. Priority status verified
6. Timeline documented for tracking`;
                fileName = 'call_transcript.txt';
                fileType = 'text/plain';
                break;

            case 'Appeal Escalator':
                buttonText = 'Download Escalation Record';
                fileContent = `ESCALATION RECORD
================
Generated: ${new Date().toLocaleString()}
Appeal ID: APL-1001
Status: ESCALATED

ESCALATION DETAILS
-----------------
Level: Senior Medical Director Review
Priority: High
Reference: ESC-${Math.random().toString(36).substr(2, 9)}

REASON FOR ESCALATION
--------------------
1. Clinical Complexity
   - Multiple diagnosis codes
   - Complex treatment protocol
   - Non-standard care pathway

2. Financial Impact
   - High dollar amount ($${(Math.random() * 10000 + 5000).toFixed(2)})
   - Multiple related claims
   - Previous partial payments

3. Time Sensitivity
   - Appeal deadline approaching
   - Patient care pending
   - Authorization expiring

CURRENT STATUS
-------------
Stage: Under Review
Assigned To: Dr. Sarah Johnson, MD
Department: Medical Review Board
Expected Response: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}

NEXT STEPS
----------
1. Medical Director Review (24-48 hours)
2. Clinical Panel Assessment (if needed)
3. Final Determination
4. Provider Notification

TRACKING
--------
Created By: System
Tracking ID: TRK-${Math.random().toString(36).substr(2, 9)}
Follow-up Date: ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}

ESCALATION CORRESPONDENCE
------------------------
From: Dr. Sarah Johnson, MD
Date: ${new Date().toLocaleString()}
Subject: Escalation Acknowledgment

I have received and reviewed the escalation request for appeal APL-1001. Based on the initial review, I agree this case warrants expedited senior-level review due to its clinical complexity and time-sensitive nature.

Key Observations:
1. Complex medical necessity determination required
2. Multiple specialty consultations involved
3. Time-sensitive patient care implications

I will personally oversee this review and ensure it receives priority handling. You can expect an initial assessment within 24-48 hours.

Best regards,
Dr. Sarah Johnson, MD
Senior Medical Director
Medical Review Board`;
                fileName = 'escalation_record.txt';
                fileType = 'text/plain';
                break;

            case 'Schedule P2P Review':
                buttonText = 'Download Meeting Info';
                fileContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}
DTEND:${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}
SUMMARY:P2P Review - Appeal APL-1001
DESCRIPTION:Peer-to-peer review with Dr. Smith regarding appeal APL-1001\\n\\nAgenda:\\n1. Case Overview\\n2. Clinical Discussion\\n3. Documentation Review\\n4. Next Steps\\n\\nPre-meeting Action Items:\\n- Review patient's clinical history\\n- Prepare relevant clinical guidelines\\n- Have operative reports available\\n\\nZoom Meeting Link: https://zoom.us/j/123456789\\nMeeting ID: 123 456 789\\nPasscode: 987654
LOCATION:Virtual Meeting (Zoom)
STATUS:CONFIRMED
ORGANIZER;CN=Revado:mailto:system@revado.ai
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:dr.smith@healthcare.org
END:VEVENT
END:VCALENDAR`;
                fileName = 'p2p_meeting.ics';
                fileType = 'text/calendar';
                break;

            case 'Regulatory Boost':
            case 'Legal Assistance Request':
                buttonText = 'Download Email + Attachment';
                fileContent = `From: system@revado.ai
To: provider@healthcare.org
Subject: ${title} Documentation - Appeal APL-1001
Date: ${new Date().toISOString()}
Message-ID: <${Math.random().toString(36).substr(2, 9)}@revado.ai>
Content-Type: multipart/mixed; boundary="boundary123"

--boundary123
Content-Type: text/plain

Dear Dr. Johnson,

I hope this email finds you well. I am writing regarding Appeal APL-1001, for which we have initiated a ${title.toLowerCase()} process. Our automated system has identified several key regulatory and compliance factors that strengthen our appeal position.

APPEAL OVERVIEW
--------------
Appeal ID: APL-1001
Patient MRN: 12345
Date of Service: February 15, 2024
Denial Reason: Missing Modifier 25
Amount in Dispute: $1,200.00

KEY FINDINGS
-----------
1. Regulatory Support
   - State Mandate 45 CFR § 147.136
   - ERISA Appeal Rights
   - State-specific timely filing requirements

2. Compliance Verification
   - All documentation meets regulatory requirements
   - Timely filing guidelines followed
   - Medical necessity criteria documented

3. Precedent Cases
   - Similar appeals successfully overturned
   - Recent regulatory updates supporting our position
   - Relevant case law citations

NEXT STEPS
----------
1. Review attached documentation
2. Complete required forms by ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
3. Schedule follow-up meeting if needed
4. Submit additional evidence by ${new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}

The attached document provides a comprehensive summary of our findings and recommended actions. Please review it at your earliest convenience and let us know if you need any clarification.

Best regards,
Revado
Appeals Processing Department
Tel: (555) 123-4567
Email: appeals@revado.ai

--boundary123
Content-Type: text/plain; name="${title.toLowerCase().replace(/\s+/g, '_')}_summary.txt"
Content-Disposition: attachment; filename="${title.toLowerCase().replace(/\s+/g, '_')}_summary.txt"

${title.toUpperCase()} SUMMARY REPORT
${'='.repeat(title.length + 14)}
Generated: ${new Date().toLocaleDateString()}
Appeal ID: APL-1001
Status: In Progress
Reference: DOC-${Math.random().toString(36).substr(2, 9)}

DETAILED ANALYSIS
----------------
1. Case Overview
   - Initial denial date: February 20, 2024
   - Appeal submission date: February 25, 2024
   - Current status: Under review
   - Priority level: High

2. Applicable Regulations
   - 45 CFR § 147.136 - Internal claims and appeals
   - State-specific requirements for appeal processing
   - ERISA compliance requirements
   - Medical necessity documentation standards

3. Supporting Evidence
   - Clinical documentation complete
   - Medical necessity criteria met
   - Correct coding guidelines followed
   - Timely filing requirements satisfied

4. Action Plan
   - Submit additional documentation by ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
   - Schedule follow-up review
   - Prepare escalation if needed
   - Monitor appeal status

5. Timeline
   - Day 0: Initial submission
   - Day 5: Documentation review
   - Day 10: Payer response expected
   - Day 15: Escalation if needed

6. Contact Information
   - Appeals Department: (555) 123-4567
   - Email: appeals@revado.ai
   - Fax: (555) 123-4568
   - Hours: Mon-Fri, 8:00 AM - 5:00 PM EST

RECOMMENDATIONS
--------------
1. Review all attached documentation
2. Submit any additional evidence promptly
3. Monitor appeal status regularly
4. Prepare for possible escalation

Generated by Revado
Last Updated: ${new Date().toLocaleString()}
Reference: DOC-${Math.random().toString(36).substr(2, 9)}

--boundary123--`;
                fileName = `${title.toLowerCase().replace(/\s+/g, '_')}.eml`;
                fileType = 'message/rfc822';
                break;

            default:
                return null;
        }

        const handleDownload = () => {
            const blob = new Blob([fileContent], { type: fileType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        return (
            <button
                onClick={handleDownload}
                className="mt-4 w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors duration-200"
            >
                <FaFileDownload className="text-gray-500" />
                <span>{buttonText}</span>
            </button>
        );
    };

    const buttonStyles = isCompleted
        ? 'border-green-200 bg-green-50 hover:bg-green-100'
        : isProcessing
            ? 'border-indigo-200 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50';

    const iconStyles = isCompleted
        ? 'text-green-600'
        : isProcessing
            ? 'text-indigo-600'
            : 'text-gray-400 group-hover:text-indigo-600';

    const titleStyles = isCompleted
        ? 'text-green-700'
        : isProcessing
            ? 'text-indigo-600'
            : 'text-gray-700 group-hover:text-indigo-600';

    return (
        <div className="w-full">
            <button
                onClick={handleClick}
                disabled={isProcessing}
                className={`w-full p-4 rounded-lg border ${buttonStyles} transition-all duration-200 text-left group relative`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Icon className={`text-xl ${iconStyles}`} />
                        <div className="flex items-center space-x-2">
                            <h3 className={`font-medium ${titleStyles}`}>{title}</h3>
                            <div className="relative inline-block">
                                <div
                                    className="cursor-help"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <FaInfoCircle
                                        className="text-gray-400 hover:text-gray-600 w-4 h-4"
                                    />
                                </div>
                                {showTooltip && (
                                    <div className="absolute z-50 transform -translate-x-1/2 left-1/2">
                                        <div className="relative px-3 py-2 text-sm text-white bg-gray-900 rounded-lg w-64 mt-2">
                                            {description}
                                            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2 -top-1 left-1/2" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </button>
            <ActionProgress
                steps={steps}
                isActive={isProcessing}
                onComplete={handleComplete}
                isCompleted={isCompleted}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
            />
            {isCompleted && getDownloadButton(title)}
        </div>
    );
};

const AIEnhanceSidebar = ({ isOpen, onClose, selectedAppeals }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSections, setCompletedSections] = useState([]);
    const [showingSocialEnhancements, setShowingSocialEnhancements] = useState(false);

    const sections = [
        {
            title: 'Medical Documentation',
            icon: FaFileMedical,
            description: 'Enhancing clinical documentation and supplementing evidence.'
        },
        {
            title: 'Legal Documentation',
            icon: FaBalanceScale,
            description: 'Fetching relevant regulatory and compliance information.'
        },
        {
            title: 'Payer Policy',
            icon: FaFileContract,
            description: 'Updating with latest payer rules and guidelines.'
        }
    ];

    const socialEnhancements = [
        {
            title: 'Payer Follow-Up',
            icon: FaPhone,
            description: 'Triggers automated calls or messages to the payer\'s office to check appeal status.',
            action: () => console.log('Initiating payer follow-up'),
            steps: [
                {
                    title: 'Retrieve & Verify',
                    description: 'Pulling up appeal details and verifying payer contact information',
                    detail: 'Analyzing contact database and verifying preferred communication channels...'
                },
                {
                    title: 'Compose & Send',
                    description: 'Generating and dispatching follow-up message',
                    detail: 'Creating personalized follow-up message with appeal reference...'
                },
                {
                    title: 'Log & Remind',
                    description: 'Recording follow-up and setting reminder',
                    detail: 'Scheduling automatic follow-up in 48 hours if no response received...'
                }
            ]
        },
        {
            title: 'Appeal Escalator',
            icon: FaArrowUp,
            description: 'Initiates an escalation process to a senior reviewer or medical director.',
            action: () => console.log('Initiating appeal escalation'),
            steps: [
                {
                    title: 'Assess Eligibility',
                    description: 'Analyzing appeal parameters for escalation',
                    detail: 'Evaluating denial reason, amount, and previous review history...'
                },
                {
                    title: 'Draft & Dispatch',
                    description: 'Preparing escalation request with supporting documents',
                    detail: 'Compiling clinical documentation and generating escalation summary...'
                },
                {
                    title: 'Record & Monitor',
                    description: 'Logging escalation and setting up tracking',
                    detail: 'Creating escalation record and configuring progress alerts...'
                }
            ]
        },
        {
            title: 'Schedule P2P Review',
            icon: FaUserMd,
            description: 'Sets up a peer-to-peer review session with the payer\'s clinical team.',
            action: () => console.log('Scheduling P2P review'),
            steps: [
                {
                    title: 'Determine Necessity',
                    description: 'Evaluating case complexity and denial type',
                    detail: 'Analyzing clinical indicators and payer requirements...'
                },
                {
                    title: 'Auto-Schedule',
                    description: 'Coordinating available time slots',
                    detail: 'Checking provider availability and proposing meeting times...'
                },
                {
                    title: 'Confirm & Document',
                    description: 'Finalizing meeting details and updating records',
                    detail: 'Sending calendar invitations and updating appeal status...'
                }
            ]
        },
        {
            title: 'Regulatory Boost',
            icon: FaGavel,
            description: 'Fetches relevant state or federal mandates to reinforce the appeal.',
            action: () => console.log('Fetching regulatory mandates'),
            steps: [
                {
                    title: 'Identify Applicable Mandates',
                    description: 'Analyzing appeal details for relevant regulations',
                    detail: 'Searching regulatory database for matching requirements...'
                },
                {
                    title: 'Fetch & Compile',
                    description: 'Retrieving and summarizing guidelines',
                    detail: 'Generating comprehensive regulatory support document...'
                },
                {
                    title: 'Attach & Notify',
                    description: 'Updating case file and notifying team',
                    detail: 'Appending regulatory brief and sending notifications...'
                }
            ]
        },
        {
            title: 'Legal Assistance Request',
            icon: FaBriefcase,
            description: 'Initiates contact with legal resources or provides templates for further review.',
            action: () => console.log('Requesting legal assistance'),
            steps: [
                {
                    title: 'Evaluate Legal Grounds',
                    description: 'Reviewing appeal for legal considerations',
                    detail: 'Analyzing denial basis and identifying potential legal issues...'
                },
                {
                    title: 'Draft & Send Request',
                    description: 'Preparing legal assistance documentation',
                    detail: 'Generating detailed case summary and selecting relevant templates...'
                },
                {
                    title: 'Attach Evidence & Log',
                    description: 'Finalizing request with supporting materials',
                    detail: 'Compiling evidence package and recording request details...'
                }
            ]
        }
    ];

    // Reset state when sidebar is opened
    useEffect(() => {
        if (isOpen) {
            setCurrentSection(0);
            setCurrentStep(0);
            setCompletedSections([]);
            setShowingSocialEnhancements(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const stepDuration = 2000; // 2 seconds per step
        const timer = setInterval(() => {
            setCurrentStep(prev => {
                if (prev === 2) {
                    // Move to next section
                    setCurrentStep(0);
                    setCompletedSections(prev => {
                        const newCompleted = [...prev];
                        if (!newCompleted.includes(currentSection)) {
                            newCompleted.push(currentSection);
                        }
                        return newCompleted;
                    });
                    setCurrentSection(current => {
                        if (current === sections.length - 1) {
                            clearInterval(timer);
                            return current;
                        }
                        return current + 1;
                    });
                    return 0;
                }
                return prev + 1;
            });
        }, stepDuration);

        return () => clearInterval(timer);
    }, [isOpen, currentSection]);

    const isEnhancementComplete = completedSections.length === sections.length;

    const handleSocialEnhancementsClick = () => {
        setShowingSocialEnhancements(true);
    };

    const handleBackClick = () => {
        setShowingSocialEnhancements(false);
    };

    if (!isOpen) return null;

    // Calculate progress based on completed sections and current progress in active section
    const calculateProgress = () => {
        const sectionWeight = 100 / sections.length; // Each section is worth 33.33%
        const completedProgress = completedSections.length * sectionWeight;

        // Add progress for current section
        if (currentSection < sections.length && !completedSections.includes(currentSection)) {
            const stepProgress = (currentStep / 3) * sectionWeight;
            return completedProgress + stepProgress;
        }

        return completedProgress;
    };

    const progress = Math.min(100, Math.round(calculateProgress()));

    return (
        <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <FaRobot className="text-indigo-600 text-xl" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        {showingSocialEnhancements ? 'Social Enhancements' : 'AI Enhancement'}
                    </h2>
                </div>
                <div className="flex items-center space-x-2">
                    {showingSocialEnhancements && (
                        <button
                            onClick={handleBackClick}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Back
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-full pb-32">
                {!showingSocialEnhancements ? (
                    <>
                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Enhancement Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Selected Appeals */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Appeals</h3>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm text-gray-600">
                                    Enhancing {selectedAppeals.size} appeal{selectedAppeals.size > 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        {/* Enhancement Sections */}
                        <div className="space-y-4">
                            {sections.map((section, index) => (
                                <EnhancementSection
                                    key={section.title}
                                    {...section}
                                    isActive={currentSection === index}
                                    isComplete={completedSections.includes(index)}
                                    currentStep={currentStep}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-6">
                            Choose from the following social enhancements to further strengthen your appeal:
                        </p>
                        {socialEnhancements.map((enhancement) => (
                            <SocialEnhancementButton
                                key={enhancement.title}
                                {...enhancement}
                                onClick={enhancement.action}
                                steps={enhancement.steps}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    {!showingSocialEnhancements ? (
                        <>
                            <span className="text-sm text-gray-600">
                                {isEnhancementComplete ? (
                                    <span className="text-green-600 font-medium">Enhancement Complete!</span>
                                ) : (
                                    'Enhancing appeals...'
                                )}
                            </span>
                            {isEnhancementComplete && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSocialEnhancementsClick}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Social Enhancements
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ml-auto"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIEnhanceSidebar; 