import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaTimes, FaChevronLeft, FaFile, FaEdit, FaSave, FaDownload } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
    Font
} from '@react-pdf/renderer';

// Register fonts for PDF
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf', fontStyle: 'italic' },
    ]
});

// PDF styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Open Sans',
        fontSize: 11,
        lineHeight: 1.5,
    },
    header: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4338ca', // indigo-700
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#4338ca', // indigo-700
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
        color: '#4338ca', // indigo-700
    },
    section: {
        marginBottom: 10,
    },
    paragraph: {
        marginBottom: 8,
    },
    strong: {
        fontWeight: 'bold',
        color: '#4338ca', // indigo-700
    },
    italic: {
        fontStyle: 'italic',
    },
    listItem: {
        marginLeft: 20,
        marginBottom: 5,
    },
    footnote: {
        fontSize: 9,
        marginTop: 2,
    },
    footnoteSection: {
        marginTop: 20,
        paddingTop: 10,
        borderTop: '1 solid #e5e7eb', // gray-200
    },
    hr: {
        borderBottom: '1 solid #e5e7eb',
        marginVertical: 10,
    },
    patientInfo: {
        marginBottom: 20,
    },
    signature: {
        marginTop: 20,
    },
    divider: {
        borderBottom: '1 solid #e5e7eb',
        marginVertical: 15,
    },
});

// PDF Document component
const AppealPDF = ({ content, patientDetails }) => {
    // Clean up markdown content to fix formatting issues
    const cleanMarkdownContent = (content) => {
        // Fix unclosed bold tags and other formatting issues
        return content
            .replace(/\*\*(.*?)\*/g, '**$1**') // Fix **text* to **text**
            .replace(/\n(\d+)\.\s+\*\*(.*?)\*\*/g, '\n$1. **$2**'); // Fix numbered list formatting
    };

    const cleanedContent = cleanMarkdownContent(content);

    // Remove footnote references from the main text for cleaner PDF rendering
    const removeFootnoteReferences = (text) => {
        return text.replace(/\[\^(\d+)\]/g, '');
    };

    // Check if content already contains a signature section to avoid duplication
    const hasSignatureSection = content.includes("Sincerely,") && content.includes(patientDetails.providerName);

    // Parse the markdown content to extract sections with cleaned text
    const parseMarkdownContent = (content) => {
        // Split content by sections based on headers
        const sections = content.split('###').map(section => section.trim());

        // Process each section
        return sections.map((section, index) => {
            if (index === 0) {
                // This is the header section
                return (
                    <View key={`section-${index}`} style={styles.section}>
                        <Text style={styles.header}>{patientDetails.currentDate}</Text>
                        <Text style={styles.title}>Re: Appeal of Medical-Necessity Denial</Text>
                        <View style={styles.patientInfo}>
                            <Text>Patient: <Text style={styles.italic}>Mrs. {patientDetails.patientName}</Text> DOB {patientDetails.patientDOB}</Text>
                            <Text>Insurance ID: {patientDetails.insuranceID}</Text>
                            <Text>Service Episode: Start-of-Care {patientDetails.serviceDate}</Text>
                            <Text>Denial Reference #: {patientDetails.denialRef}</Text>
                            <Text>Requested Level of Care: Skilled Home-Health Nursing</Text>
                            <Text>Ordering Provider: {patientDetails.providerName} (NPI {patientDetails.providerNPI})</Text>
                        </View>

                        <View style={styles.divider} />

                        <Text>Dear Utilization-Review Committee,</Text>
                        <Text style={styles.paragraph}>
                            I write to <Text style={styles.strong}>formally appeal</Text> the determination that home-health nursing services for the above-named patient are "not medically necessary." A careful examination of her clinical status shows that the denial is unfounded. I respectfully request <Text style={styles.strong}>full reversal</Text> and reinstatement of coverage for all skilled-nursing visits beginning {patientDetails.serviceDate}.
                        </Text>

                        <View style={styles.divider} />
                    </View>
                );
            } else {
                // Process other sections
                const sectionLines = section.split('\n');
                const sectionTitle = sectionLines[0];
                const sectionContent = sectionLines.slice(1).join('\n');

                return (
                    <View key={`section-${index}`} style={styles.section}>
                        <Text style={styles.subtitle}>{sectionTitle}</Text>
                        {sectionContent.split('\n\n').map((paragraph, pIndex) => {
                            // Handle lists
                            if (paragraph.trim().startsWith('* ')) {
                                const listItems = paragraph.split('* ').filter(item => item.trim());
                                return (
                                    <View key={`list-${pIndex}`} style={{ marginBottom: 10 }}>
                                        {listItems.map((item, itemIndex) => {
                                            // Remove footnote references and fix formatting
                                            const cleanedItem = removeFootnoteReferences(item.trim());
                                            return (
                                                <Text key={`item-${itemIndex}`} style={styles.listItem}>
                                                    • {cleanedItem.replace(/\*\*(.*?)\*\*/g, (_, content) => content)}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                );
                            }
                            // Handle numbered lists
                            else if (paragraph.trim().match(/^\d+\./)) {
                                const listItems = paragraph.split(/\d+\./).filter(item => item.trim());
                                return (
                                    <View key={`numlist-${pIndex}`} style={{ marginBottom: 10 }}>
                                        {listItems.map((item, itemIndex) => {
                                            // Remove footnote references and fix formatting
                                            const cleanedItem = removeFootnoteReferences(item.trim());
                                            return (
                                                <Text key={`numitem-${itemIndex}`} style={styles.listItem}>
                                                    {itemIndex + 1}. {cleanedItem.replace(/\*\*(.*?)\*\*/g, (_, content) => content)}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                );
                            }
                            // Regular paragraph
                            else {
                                // Remove footnote references and fix formatting
                                const cleanedParagraph = removeFootnoteReferences(paragraph.trim());
                                return (
                                    <Text key={`p-${pIndex}`} style={styles.paragraph}>
                                        {cleanedParagraph.replace(/\*\*(.*?)\*\*/g, (_, content) => content)}
                                    </Text>
                                );
                            }
                        })}
                    </View>
                );
            }
        });
    };

    // Extract footnotes
    const extractFootnotes = (content) => {
        const footnoteRegex = /\[\^(\d+)\]: (.*?)(?=\[\^|$)/gs;
        const footnotes = [];
        let match;

        while ((match = footnoteRegex.exec(content)) !== null) {
            footnotes.push({
                number: match[1],
                text: match[2].trim()
            });
        }

        return footnotes;
    };

    const footnotes = extractFootnotes(content);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {parseMarkdownContent(cleanedContent)}

                {/* Only include signature if not already in content */}
                {!hasSignatureSection && (
                    <View style={styles.signature}>
                        <Text>Sincerely,</Text>
                        <Text style={styles.strong}>{patientDetails.providerName}</Text>
                        <Text>Attending Physician – Internal Medicine</Text>
                        <Text>{patientDetails.practiceName}</Text>
                        <Text>{patientDetails.practiceAddress} {patientDetails.practiceCity} Fax {patientDetails.practiceFax}</Text>
                    </View>
                )}

                {/* Only include footnotes once */}
                {footnotes.length > 0 && (
                    <View style={styles.footnoteSection}>
                        <Text style={styles.subtitle}>Citations</Text>
                        {footnotes.map((footnote, index) => (
                            <Text key={`footnote-${index}`} style={styles.footnote}>
                                {footnote.number}. {footnote.text}
                            </Text>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

const AppealGenerator = ({ isOpen, onClose, onBack, patientData }) => {
    const [isGenerating, setIsGenerating] = useState(true);
    const [generatingText, setGeneratingText] = useState('Generating appeal...');
    const [processingText, setProcessingText] = useState('Processing documentation...');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [displayContent, setDisplayContent] = useState('Preparing to generate appeal letter...');
    const textAreaRef = useRef(null);
    const appealContentRef = useRef(null);

    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: 'OASIS_Assessment_03152024.pdf',
            type: 'OASIS',
            size: '1.2 MB'
        },
        {
            id: 2,
            name: 'Visit_Documentation_03152024.pdf',
            type: 'Visit Documentation',
            size: '840 KB'
        },
        {
            id: 3,
            name: 'MD_Progress_Notes_03142024.pdf',
            type: 'MD Notes',
            size: '520 KB'
        },
        {
            id: 4,
            name: 'Fall_Risk_Assessment.pdf',
            type: 'Assessment',
            size: '380 KB'
        }
    ]);

    // Patient details - moved to useMemo to prevent recalculation
    const patientDetails = useMemo(() => {
        return {
            patientName: patientData?.name || 'Jane Doe',
            patientDOB: patientData?.dob || '04/15/1945',
            insuranceID: patientData?.insuranceID || 'INS123456789',
            claimNumber: patientData?.claimNumber || 'HC-238947',
            denialRef: patientData?.denialRef || '1234-56',
            serviceDate: patientData?.serviceDate || '03/15/2024',
            denialDate: patientData?.denialDate || '04/30/2024',
            providerName: 'Anthony Rodriguez, MD',
            providerNPI: '1234567890',
            practiceName: 'Revado Medical Group',
            practiceAddress: '123 Main Street',
            practiceCity: 'San Francisco, CA 94105',
            practiceFax: '415-555-1234',
            providerPhone: '415-555-5678',
            currentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
    }, [patientData]);

    // Generate appeal content based on current step - using useMemo to prevent unnecessary recalculations
    const getAppealContent = useMemo(() => {
        const {
            currentDate, patientName, patientDOB, insuranceID, serviceDate,
            denialRef, providerName, providerNPI
        } = patientDetails;

        switch (currentStep) {
            case 0:
                return `Preparing to generate appeal letter...`;
            case 1:
                return `**${currentDate}**

**Re: Appeal of Medical-Necessity Denial**
Patient: *Mrs. ${patientName}* DOB ${patientDOB}
Insurance ID: ${insuranceID}
Service Episode: Start-of-Care ${serviceDate}
Denial Reference #: ${denialRef}
Requested Level of Care: Skilled Home-Health Nursing
Ordering Provider: ${providerName} (NPI ${providerNPI})`;
            case 2:
                return `**${currentDate}**

**Re: Appeal of Medical-Necessity Denial**
Patient: *Mrs. ${patientName}* DOB ${patientDOB}
Insurance ID: ${insuranceID}
Service Episode: Start-of-Care ${serviceDate}
Denial Reference #: ${denialRef}
Requested Level of Care: Skilled Home-Health Nursing
Ordering Provider: ${providerName} (NPI ${providerNPI})

---

Dear Utilization-Review Committee,

I write to **formally appeal** the determination that home-health nursing services for the above-named patient are "not medically necessary." A careful examination of her clinical status shows that the denial is unfounded. I respectfully request **full reversal** and reinstatement of coverage for all skilled-nursing visits beginning ${serviceDate}.`;
            case 3:
            case 4:
            default:
                return `**${currentDate}**

**Re: Appeal of Medical-Necessity Denial**
Patient: *Mrs. ${patientName}* DOB ${patientDOB}
Insurance ID: ${insuranceID}
Service Episode: Start-of-Care ${serviceDate}
Denial Reference #: ${denialRef}
Requested Level of Care: Skilled Home-Health Nursing
Ordering Provider: ${providerName} (NPI ${providerNPI})

---

Dear Utilization-Review Committee,

I write to **formally appeal** the determination that home-health nursing services for the above-named patient are "not medically necessary." A careful examination of her clinical status shows that the denial is unfounded. I respectfully request **full reversal** and reinstatement of coverage for all skilled-nursing visits beginning ${serviceDate}.

---

### Patient Status at Start-of-Care (${serviceDate})

Mrs. ${patientName} is a 79-year-old woman with long-standing essential hypertension, degenerative joint disease, and age-related balance impairment. She was discharged on March 14 after a two-day hospital observation stay for **hypertensive urgency** (systolic blood pressure above 190 mm Hg accompanied by orthostatic changes).[^1]

* **Functional limitations:** Severe bilateral knee pain restricts stair climbing and community ambulation; she uses a cane and requires assistance with meal preparation and heavy housekeeping.[^2]
* **Medication profile:** Lisinopril (recently titrated), acetaminophen as needed, and a daily multivitamin.
* **Fall history:** Documented fall in December 2023 and persistent dizziness on position change.[^3]
* **Homebound status:** Leaving home demands taxing effort because of arthritis pain, fall risk, and fluctuating blood pressure; departures are infrequent and for medical appointments only, satisfying CMS Benefit Policy Manual, Chapter 7, §30.1.1.[^4]

---

### Skilled-Nursing Services Ordered (and Why Only an RN Can Provide Them)

1. **Blood-pressure trend analysis with medication titration**
   *Twice weekly for four weeks, then reassess.*
   An RN must correlate home-logged readings with symptoms, educate the patient, and notify the prescriber for real-time dose adjustments—tasks outside the scope of unlicensed personnel.[^5]

2. **Orthostatic-hypotension assessment at every visit**
   Hands-on testing and interpretation are critical to preventing another hypertensive crisis or fall.[^6]

3. **Comprehensive pain and mobility evaluation (weekly)**
   The RN identifies changes in gait, assesses the need for adaptive equipment, and arranges safety modifications.[^7]

4. **Patient and caregiver education**—recognizing early signs of hypertensive crisis, safe pacing of activity, and strict medication adherence.
   Initial instruction, return-demonstration, and ongoing reinforcement are required to ensure understanding, as outlined in Chapter 7, §40.1.[^8]

All four interventions meet the definition of **reasonable and necessary skilled services** under Chapter 7, §30.2, and are further supported by the Jimmo v. Sebelius maintenance-therapy clarification.[^9]

---

### Why Alternative, Lower-Level Care Is Inadequate

* **Unlicensed aides** cannot perform or interpret orthostatic vital signs, identify symptom-driven medication changes, or implement titration orders.[^10]
* **Outpatient clinics** would compromise her homebound status and expose her to transportation-related fall hazards.[^11]
* **Remote monitoring alone** lacks the hands-on assessment required to identify subtle neurologic or mobility changes that precede a hypertensive emergency or fall.[^12]

---

### Risks If Skilled-Nursing Care Is Withheld

1. **Hypertensive emergency**—stroke or myocardial-infarction risk rises sharply when systolic pressures exceed 180 mm Hg.[^13]
2. **Falls with fracture**—women aged ≥ 75 who have arthritis face a one-year fracture probability of roughly 30 percent after a single fall (CDC data).[^14]
3. **Hospital readmission**—should she deteriorate, the 30-day readmit cost would exceed the projected home-health episode cost by more than 400 percent.[^15]

During the four weeks of skilled-nursing oversight, Mrs. ${patientName} stabilized her pressure to 128/72 mm Hg and experienced **no falls, emergency-department visits, or rehospitalizations**—evidence that the ordered care was both effective and cost-efficient.[^16]

---

### Requested Action

I respectfully request immediate reconsideration and approval of skilled-nursing services as ordered. The following documentation is attached to support this appeal:

1. Start-of-Care OASIS-E and nursing narrative (${serviceDate})
2. Physician progress notes and home-health orders (03/14 and 03/20/2024)
3. Skilled-nursing visit notes with graphed blood-pressure trends (03/15 – 04/12/2024)
4. Fall-risk and home-safety assessments
5. Pertinent excerpts from Medicare Benefit Policy Manual, Chapter 7

---

Thank you for your prompt reconsideration. Should additional information or a peer-to-peer discussion be required, please contact me at ${patientDetails.providerPhone} or via secure fax ${patientDetails.practiceFax}.

Sincerely,

**${providerName}**
Attending Physician – Internal Medicine
${patientDetails.practiceName}
${patientDetails.practiceAddress} ${patientDetails.practiceCity} Fax ${patientDetails.practiceFax}

---

[^1]: Hospital Discharge Summary, 03/14/2024, Dr. Sarah Chen, Memorial Hospital
[^2]: OASIS-E Assessment, 03/15/2024, Section GG0170 (Mobility)
[^3]: Fall Risk Assessment, 03/15/2024, Score 14/24 (High Risk)
[^4]: Medicare Benefit Policy Manual, Chapter 7, §30.1.1: "Patient Confined to the Home"
[^5]: American Heart Association. "Measurement and Clinical Utility of BP Variability." Hypertension. 2019;74:e5-e6
[^6]: STEADI Algorithm for Fall Risk Assessment & Intervention, CDC, 2019
[^7]: CMS-485 Form, 03/15/2024, Section 21 (Orders for Discipline and Treatments)
[^8]: Medicare Benefit Policy Manual, Chapter 7, §40.1: "Skilled Nursing Care"
[^9]: Jimmo v. Sebelius Settlement Agreement, January 2013; CMS Transmittal 179, January 14, 2014
[^10]: State Nurse Practice Act, Section 4.3: "Scope of Practice for Home Health Aides"
[^11]: Patient Transportation Assessment, 03/15/2024
[^12]: Journal of Telemedicine and Telecare. "Limitations of Remote Monitoring in Hypertensive Elderly." 2022;28(2):115-123
[^13]: Whelton PK, et al. 2017 ACC/AHA Guideline for High Blood Pressure in Adults. J Am Coll Cardiol. 2018;71:e127-e248
[^14]: Centers for Disease Control and Prevention. "Important Facts about Falls." Last reviewed 02/10/2023
[^15]: Medicare Payment Advisory Commission. Report to Congress, March 2023. Chapter 8: Home Health Care Services
[^16]: Skilled Nursing Visit Notes, 04/12/2024, Discharge Summary`;
        }
    }, [currentStep, patientDetails]);

    // Use a debounced update for the display content to prevent flickering
    useEffect(() => {
        // Only update display content after a small delay to prevent flickering
        const contentUpdateTimer = setTimeout(() => {
            setDisplayContent(getAppealContent);
        }, 100);

        return () => clearTimeout(contentUpdateTimer);
    }, [getAppealContent]);

    // Simulate appeal generation progress
    useEffect(() => {
        if (!isOpen) return;

        // First update text immediately
        setGeneratingText('Generating appeal...');

        const timer = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress >= 100) {
                    clearInterval(timer);
                    setIsGenerating(false);
                    return 100;
                }

                // Update the generating text and step based on progress
                if (prevProgress > 20 && prevProgress <= 40 && currentStep < 1) {
                    setGeneratingText('Analyzing patient records...');
                    setCurrentStep(1);
                } else if (prevProgress > 40 && prevProgress <= 60 && currentStep < 2) {
                    setGeneratingText('Identifying medical necessity criteria...');
                    setCurrentStep(2);
                } else if (prevProgress > 60 && prevProgress <= 80 && currentStep < 3) {
                    setGeneratingText('Drafting appeal letter...');
                    setCurrentStep(3);
                } else if (prevProgress > 80 && currentStep < 4) {
                    setGeneratingText('Finalizing appeal...');
                    setProcessingText('Documentation processed');
                    setCurrentStep(4);
                }

                return prevProgress + 2;
            });
        }, 300);

        return () => clearInterval(timer);
    }, [isOpen]);

    // Set edited content when generation is complete
    useEffect(() => {
        if (!isGenerating && currentStep === 4) {
            setEditedContent(getAppealContent);
        }
    }, [isGenerating, currentStep, getAppealContent]);

    // Focus on textarea when editing starts
    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [isEditing]);

    if (!isOpen) return null;

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
    };

    const handleTextChange = (e) => {
        setEditedContent(e.target.value);
    };

    // Custom components for ReactMarkdown - memoized to prevent re-renders
    const components = useMemo(() => ({
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-md font-semibold text-gray-700 mt-3 mb-1" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3 text-gray-800" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4 border-t border-gray-200" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-indigo-700" {...props} />,
        em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />
    }), []);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"></div>

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>

                    {/* Modal Header */}
                    <div className="p-6 pb-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onBack}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaChevronLeft className="h-4 w-4" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {isGenerating ? "Generating Appeal" : "Appeal Letter"}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {isGenerating ? "Creating appeal letter based on patient documentation" : "Review and edit your appeal letter"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar - Only show when generating */}
                    {isGenerating && (
                        <div className="px-6 pt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Processing</span>
                                <span>{progress}%</span>
                            </div>
                        </div>
                    )}

                    {/* Modal Content */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Appeal Letter */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-900">Appeal Letter</h3>
                                {!isGenerating && (
                                    <button
                                        onClick={isEditing ? handleSaveClick : handleEditClick}
                                        className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
                                    >
                                        {isEditing ? (
                                            <>
                                                <FaSave className="mr-1" />
                                                Save
                                            </>
                                        ) : (
                                            <>
                                                <FaEdit className="mr-1" />
                                                Edit
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">For: {patientDetails.patientName} | Claim #: {patientDetails.claimNumber} | Date of Service: {patientDetails.serviceDate}</p>

                            <div className="min-h-[400px] max-h-[500px] overflow-y-auto text-left">
                                {isEditing ? (
                                    <textarea
                                        ref={textAreaRef}
                                        value={editedContent}
                                        onChange={handleTextChange}
                                        className="w-full h-[400px] p-2 text-sm text-gray-800 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                    />
                                ) : (
                                    <div
                                        ref={appealContentRef}
                                        className="prose prose-sm max-w-none text-gray-800 mb-4 pdf-content"
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={components}
                                        >
                                            {isGenerating ? displayContent : editedContent}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="mt-6">
                                        <div className="flex items-center text-indigo-600 text-sm">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {generatingText}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Attached Documentation */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Attached Documentation</h3>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                {documents.map(doc => (
                                    <div
                                        key={doc.id}
                                        className={`flex items-start space-x-3 p-3 border border-gray-200 rounded-lg ${currentStep >= doc.id ? 'bg-indigo-50 border-indigo-200' : ''}`}
                                    >
                                        <FaFile className={`h-5 w-5 ${currentStep >= doc.id ? 'text-indigo-500' : 'text-gray-400'} mt-0.5`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                                            <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                                            {currentStep >= doc.id && (
                                                <p className="text-xs text-indigo-600 mt-1">Processed</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isGenerating && (
                                <div className="mt-8">
                                    <div className="flex items-center justify-center text-gray-500 text-sm">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {processingText}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        {!isGenerating && (
                            <PDFDownloadLink
                                document={<AppealPDF content={editedContent} patientDetails={patientDetails} />}
                                fileName={`Appeal_Letter_${patientDetails.patientName.replace(/\s+/g, '_')}.pdf`}
                                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white flex items-center bg-indigo-600 hover:bg-indigo-700`}
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ?
                                        'Preparing document...' :
                                        <>
                                            <FaDownload className="mr-2" />
                                            Download PDF
                                        </>
                                }
                            </PDFDownloadLink>
                        )}

                        {isGenerating && (
                            <button
                                disabled
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white flex items-center bg-indigo-400 cursor-not-allowed"
                            >
                                <FaDownload className="mr-2" />
                                Generating...
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppealGenerator; 