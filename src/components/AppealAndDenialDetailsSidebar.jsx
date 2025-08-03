import React, { useState, useEffect } from 'react';
import { FaTimes, FaClock, FaFileExport, FaEnvelope, FaBell, FaEdit, FaDownload, FaRobot, FaSyncAlt, FaSave, FaSpinner, FaFilePdf, FaHighlighter } from 'react-icons/fa';
import { PDFDocument, rgb } from 'pdf-lib';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    const [status, setStatus] = useState(appeal?.status?.main || '');
    
    // New state for API calls
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
    const [generatedLetter, setGeneratedLetter] = useState(null);
    const [apiError, setApiError] = useState(null);
    
    // New state for PDF highlighting
    const [isHighlightingPDF, setIsHighlightingPDF] = useState(false);
    const [highlightedPdfUrl, setHighlightedPdfUrl] = useState(null);

    // Define success probability reasons
    const successProbReasons = [
        { reason: 'Previously Appealed this Code Successfully' },
        { reason: 'Medical Documentation Added' },
        { reason: 'Following Payer Modifier Rules' }
    ];

    // Update notes and clear AI-related state whenever the appeal changes
    useEffect(() => {
        if (appeal) {
            setNotes(appeal.notes || '');
            setStatus(appeal.status?.main || '');
        }
        
        // Clear AI-related state when appeal changes
        setAnalysisResult(null);
        setGeneratedLetter(null);
        setApiError(null);
        setIsAnalyzing(false);
        setIsGeneratingLetter(false);
        setHighlightedPdfUrl(null);
    }, [appeal]);

    // Clear AI-related state when sidebar closes
    useEffect(() => {
        if (!isOpen) {
            setAnalysisResult(null);
            setGeneratedLetter(null);
            setApiError(null);
            setIsAnalyzing(false);
            setIsGeneratingLetter(false);
            setIsEditing(false);
            setHighlightedPdfUrl(null);
        }
    }, [isOpen]);

    if (!denial) return null;

    const sendEmail = (email) => {
        window.location = "mailto:" + email;
    }

    const handleSaveNotes = () => {
        if (updateNotes && appeal) {
            updateNotes(appeal.id, notes);
        }
        console.log('Saving notes:', notes);
        setIsEditing(false);
        setLastSaved(new Date().toLocaleString());
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        if (updateStatus && appeal) {
            updateStatus(appeal.id, newStatus);
        }
    };

    // Convert denial data to ERA format for API
    const convertDenialToERA = (denial) => {
        return {
            claim_number: denial.denialId,
            patient_name: denial.patient.name,
            service_date: denial.serviceDate,
            submission_date: denial.denialDate,
            amount_billed: denial.amount,
            amount_paid: 0,
            carc_code: denial.denialReason.split(' ')[0] || '1',
            carc_description: denial.denialReason,
            rarc_code: '',
            remark: denial.rootCause || '',
            rag_index_path: null
        };
    };

    // Convert denial/appeal data to SOAP format for API
    const convertToSOAP = (denial, appeal) => {
        return {
            S: `Patient ${denial.patient.name} presented with complaints related to claim ${denial.denialId}. Service provided on ${denial.serviceDate}.`,
            O: `Clinical findings and examination results for claim ${denial.denialId}. Payer: ${denial.payer}. Denial reason: ${denial.denialReason}.`,
            A: `Assessment: ${denial.rootCause || 'Medical necessity established based on clinical presentation and examination findings.'}`,
            P: `Treatment plan executed as documented. Appeal submitted for proper reimbursement of medically necessary services.`,
            billing_note: appeal?.notes || denial.rootCause || ''
        };
    };

    // Function to create highlighted PDF
    const createHighlightedPDF = async (evidenceData) => {
        try {
            setIsHighlightingPDF(true);
            
            // Load the original PDF (you'll need to have this file accessible)
            const pdfPath = '/OHIO_MEDICAID.pdf'; // Adjust path as needed
            const existingPdfBytes = await fetch(pdfPath).then(res => res.arrayBuffer());
            
            // Load the PDF document
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();
            
            // Extract evidence details from analysis result
            const evidenceDetails = evidenceData?.evidence_validation?.evidence_details || {};
            
            // Process each piece of evidence
            for (const [evidenceId, details] of Object.entries(evidenceDetails)) {
                const pageNum = details.page;
                const startPos = details.start_position;
                const endPos = details.end_position;
                const fullText = details.full_text;
                
                if (pageNum && pageNum <= pages.length) {
                    const page = pages[pageNum - 1]; // Convert to 0-based index
                    const { width, height } = page.getSize();
                    
                    // For demonstration, we'll add a highlight annotation
                    // Note: This is a simplified approach. In a real implementation,
                    // you'd need to map text positions to PDF coordinates more precisely
                    
                    // Add a semi-transparent yellow rectangle as highlight
                    // You would need to calculate the actual coordinates based on text position
                    const highlightHeight = 20; // Approximate line height
                    const highlightY = height * 0.7; // Approximate position (you'd calculate this from text position)
                    
                    page.drawRectangle({
                        x: 50,
                        y: highlightY,
                        width: width - 100,
                        height: highlightHeight,
                        color: rgb(1, 1, 0), // Yellow
                        opacity: 0.3
                    });
                    
                    // Add evidence ID annotation
                    page.drawText(`Evidence: ${evidenceId}`, {
                        x: 50,
                        y: highlightY + highlightHeight + 5,
                        size: 8,
                        color: rgb(1, 0, 0) // Red text
                    });
                }
            }
            
            // Add a summary page with all evidence
            const summaryPage = pdfDoc.addPage();
            const { width, height } = summaryPage.getSize();
            
            summaryPage.drawText('EVIDENCE SUMMARY', {
                x: 50,
                y: height - 50,
                size: 16,
                color: rgb(0, 0, 0)
            });
            
            let yPosition = height - 80;
            
            for (const [evidenceId, details] of Object.entries(evidenceDetails)) {
                const text = `Evidence ID: ${evidenceId}\nPage: ${details.page || 'Unknown'}\nRelevance: ${details.relevance || 'Unknown'}\nText: ${(details.full_text || '').substring(0, 200)}...`;
                
                summaryPage.drawText(text, {
                    x: 50,
                    y: yPosition,
                    size: 10,
                    color: rgb(0, 0, 0),
                    maxWidth: width - 100
                });
                
                yPosition -= 120;
                
                if (yPosition < 50) break; // Prevent overflow
            }
            
            // Save the PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            setHighlightedPdfUrl(url);
            return url;
            
        } catch (error) {
            console.error('Error creating highlighted PDF:', error);
            throw error;
        } finally {
            setIsHighlightingPDF(false);
        }
    };

    // API call to analyze claim
    const runAIAnalysis = async () => {
        setIsAnalyzing(true);
        setApiError(null);
        
        try {
            const eraData = convertDenialToERA(denial);
            const soapData = convertToSOAP(denial, appeal);

            const response = await fetch(`${API_BASE_URL}/analyze-claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    era_input: eraData,
                    soap_input: soapData
                })
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setAnalysisResult(result);
            
            console.log('Analysis complete:', result);
            
            // Create highlighted PDF if evidence was found
            if (result.evidence_ids && result.evidence_ids.length > 0) {
                try {
                    await createHighlightedPDF(result);
                } catch (pdfError) {
                    console.warn('Could not create highlighted PDF:', pdfError);
                }
            }
            
            // Show success message
            alert(`Analysis Complete!\n\nResult: ${result.final_determination}\nConfidence: ${(result.confidence * 100).toFixed(1)}%\n\nTools Used: ${result.tools_used.join(', ')}\n\n${result.evidence_ids?.length ? `Evidence found: ${result.evidence_ids.length} items` : 'No evidence found'}`);
            
        } catch (error) {
            console.error('Analysis failed:', error);
            setApiError(`Analysis failed: ${error.message}`);
            alert(`Analysis failed: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // API call to generate letter
    const generateAppealLetter = async () => {
        if (!analysisResult) {
            alert('Please run AI Analysis first to generate a letter.');
            return;
        }

        setIsGeneratingLetter(true);
        setApiError(null);

        try {
            const eraData = convertDenialToERA(denial);
            const soapData = convertToSOAP(denial, appeal);

            const letterRequest = {
                era: eraData,
                soap: soapData,
                analysis_result: analysisResult,
                provider_name: "Healthcare Provider",
                provider_address: "Provider Address",
                insurance_company: denial.payer,
                insurance_address: "Insurance Company Address",
                contact_person: "Appeals Department"
            };

            const response = await fetch(`${API_BASE_URL}/generate-letter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(letterRequest)
            });

            if (!response.ok) {
                throw new Error(`Letter generation failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setGeneratedLetter(result);
            
            console.log('Letter generated:', result);
            
            // Show success message
            alert(`Letter Generated!\n\nType: ${result.letter_type.replace('_', ' ').toUpperCase()}\nConfidence: ${(result.confidence * 100).toFixed(1)}%\n\nRecommendations: ${result.recommendations.length}`);
            
        } catch (error) {
            console.error('Letter generation failed:', error);
            setApiError(`Letter generation failed: ${error.message}`);
            alert(`Letter generation failed: ${error.message}`);
        } finally {
            setIsGeneratingLetter(false);
        }
    };

    // Enhanced download function with PDF highlighting
    const downloadDocs = async () => {
        if (!appeal?.supportingDocs && !generatedLetter && !analysisResult) {
            alert('No documents available to download.');
            return;
        }

        const downloads = [];

        // Download generated letter if available
        if (generatedLetter) {
            const letterBlob = new Blob([generatedLetter.content], { type: 'text/plain' });
            downloads.push({
                blob: letterBlob,
                filename: `${generatedLetter.letter_type}_${denial.denialId}.txt`,
                description: 'Generated Appeal Letter'
            });
        }

        // Download analysis result if available
        if (analysisResult) {
            const analysisBlob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
            downloads.push({
                blob: analysisBlob,
                filename: `analysis_result_${denial.denialId}.json`,
                description: 'AI Analysis Results'
            });
        }

        // Download highlighted PDF if available
        if (highlightedPdfUrl) {
            try {
                const response = await fetch(highlightedPdfUrl);
                const pdfBlob = await response.blob();
                downloads.push({
                    blob: pdfBlob,
                    filename: `OHIO_MEDICAID_highlighted_${denial.denialId}.pdf`,
                    description: 'Highlighted PDF with Evidence'
                });
            } catch (error) {
                console.error('Error downloading highlighted PDF:', error);
            }
        } else if (analysisResult?.evidence_ids?.length > 0) {
            // Try to create and download highlighted PDF
            try {
                setIsHighlightingPDF(true);
                const pdfUrl = await createHighlightedPDF(analysisResult);
                const response = await fetch(pdfUrl);
                const pdfBlob = await response.blob();
                downloads.push({
                    blob: pdfBlob,
                    filename: `OHIO_MEDICAID_highlighted_${denial.denialId}.pdf`,
                    description: 'Highlighted PDF with Evidence'
                });
            } catch (error) {
                console.error('Error creating highlighted PDF:', error);
                // Fallback: download original PDF
                try {
                    const originalResponse = await fetch('/OHIO_MEDICAID.pdf');
                    const originalBlob = await originalResponse.blob();
                    downloads.push({
                        blob: originalBlob,
                        filename: `OHIO_MEDICAID_original_${denial.denialId}.pdf`,
                        description: 'Original PDF (highlighting failed)'
                    });
                } catch (originalError) {
                    console.error('Error downloading original PDF:', originalError);
                }
            } finally {
                setIsHighlightingPDF(false);
            }
        }

        // Download evidence summary if available
        if (analysisResult?.evidence_validation?.evidence_details) {
            const evidenceDetails = analysisResult.evidence_validation.evidence_details;
            let evidenceSummary = `EVIDENCE SUMMARY FOR CLAIM ${denial.denialId}\n`;
            evidenceSummary += `Generated: ${new Date().toISOString()}\n\n`;
            
            for (const [evidenceId, details] of Object.entries(evidenceDetails)) {
                evidenceSummary += `EVIDENCE ID: ${evidenceId}\n`;
                evidenceSummary += `Source: ${details.source || 'Unknown'}\n`;
                evidenceSummary += `Relevance: ${details.relevance || 'Unknown'}\n`;
                evidenceSummary += `Page: ${details.page || 'Unknown'}\n`;
                evidenceSummary += `Position: ${details.start_position || 'Unknown'}-${details.end_position || 'Unknown'}\n`;
                evidenceSummary += `Content Type: ${details.content_type || 'Unknown'}\n`;
                evidenceSummary += `Full Text:\n${details.full_text || 'No text available'}\n`;
                evidenceSummary += `\n${'='.repeat(80)}\n\n`;
            }
            
            const evidenceBlob = new Blob([evidenceSummary], { type: 'text/plain' });
            downloads.push({
                blob: evidenceBlob,
                filename: `evidence_summary_${denial.denialId}.txt`,
                description: 'Evidence Summary with Full Text'
            });
        }

        // Download supporting docs if they exist
        if (appeal?.supportingDocs) {
            appeal.supportingDocs.forEach(doc => {
                if (doc !== "Appeal Letter") {
                    const blob = new Blob([`This is a document for ${doc} - Claim ${denial.denialId}`], { type: 'text/plain' });
                    downloads.push({
                        blob: blob,
                        filename: `${doc}_${denial.denialId}.txt`,
                        description: doc
                    });
                }
            });
        }

        // Execute all downloads
        for (const download of downloads) {
            const url = URL.createObjectURL(download.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = download.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        if (downloads.length > 0) {
            alert(`Downloaded ${downloads.length} files:\n${downloads.map(d => `• ${d.description}`).join('\n')}`);
        }
    };

    const exportToCSV = () => {
        if (appeal && denial) {
            const csvRows = [];
            const headers = ['Field', 'Value'];
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

            // Add AI analysis data if available
            if (analysisResult) {
                const aiData = [
                    { field: 'AI Analysis Result', value: analysisResult.final_determination },
                    { field: 'AI Confidence', value: `${(analysisResult.confidence * 100).toFixed(1)}%` },
                    { field: 'AI Tools Used', value: analysisResult.tools_used.join(', ') },
                    { field: 'AI Model Used', value: analysisResult.model_used },
                    { field: 'AI Processing Time', value: `${analysisResult.processing_time.toFixed(2)}s` },
                    { field: 'AI Tokens Used', value: analysisResult.tokens_used.toString() },
                    { field: 'Evidence Count', value: (analysisResult.evidence_ids || []).length.toString() },
                    { field: 'Evidence IDs', value: (analysisResult.evidence_ids || []).join(', ') }
                ];
                appealData.push(...aiData);
            }

            // Add letter generation data if available
            if (generatedLetter) {
                const letterData = [
                    { field: 'Letter Type', value: generatedLetter.letter_type },
                    { field: 'Letter Confidence', value: `${(generatedLetter.confidence * 100).toFixed(1)}%` },
                    { field: 'Letter Model Used', value: generatedLetter.model_used },
                    { field: 'Letter Processing Time', value: `${generatedLetter.processing_time.toFixed(2)}s` },
                    { field: 'Letter Tokens Used', value: generatedLetter.tokens_used.toString() },
                    { field: 'Letter Recommendations', value: generatedLetter.recommendations.join('; ') }
                ];
                appealData.push(...letterData);
            }

            // Combine both appeal and denial data
            const combinedData = [...appealData, ...denialData];

            combinedData.forEach(row => {
                const escapedValue = row.value.toString().includes(',') ? `"${row.value}"` : row.value;
                csvRows.push(`${row.field},${escapedValue}`);
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Appeal_${appeal?.id || denial.denialId}_with_AI_and_Evidence.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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

                                {/* API Error Display */}
                                {apiError && (
                                    <div className="px-3 py-2 bg-red-50 border-b border-red-200">
                                        <div className="text-sm text-red-700">
                                            <strong>Error:</strong> {apiError}
                                        </div>
                                    </div>
                                )}

                                {/* AI Analysis Results Display */}
                                {analysisResult && (
                                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-200">
                                        <div className="text-sm text-blue-700">
                                            <strong>AI Analysis:</strong> {analysisResult.final_determination} 
                                            <span className="ml-2">
                                                (Confidence: {(analysisResult.confidence * 100).toFixed(1)}%)
                                            </span>
                                            {analysisResult.evidence_ids && analysisResult.evidence_ids.length > 0 && (
                                                <span className="ml-2 text-xs">
                                                    📋 {analysisResult.evidence_ids.length} evidence items found
                                                </span>
                                            )}
                                            {analysisResult.analyzer_result && (
                                                <div className="mt-1 text-xs">
                                                    <strong>Analysis Quality:</strong> {analysisResult.analyzer_result.reasoning_quality}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Generated Letter Results Display */}
                                {generatedLetter && (
                                    <div className="px-3 py-2 bg-green-50 border-b border-green-200">
                                        <div className="text-sm text-green-700">
                                            <strong>Letter Generated:</strong> {generatedLetter.letter_type.replace('_', ' ').toUpperCase()} 
                                            <span className="ml-2">
                                                ({generatedLetter.recommendations.length} recommendations)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* PDF Highlighting Status */}
                                {(isHighlightingPDF || highlightedPdfUrl) && (
                                    <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-200">
                                        <div className="text-sm text-yellow-700 flex items-center gap-2">
                                            {isHighlightingPDF ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    <span>Creating highlighted PDF...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaHighlighter />
                                                    <span>PDF with highlighted evidence ready for download</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
    
                                {/* Content */}
                                <div className="flex-1 p-2 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-2 h-full">
                                        {/* Left Column - Denial Details */}
                                        <div className="space-y-1">    
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
                                        {appeal && <div className="space-y-1">
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
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                appeal.status.main.toLowerCase() === 'won' 
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
                                        </div>
                                        }
                                    </div>
                                </div>
    
                                {/* Enhanced Footer with PDF highlighting */}
                                <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                                    <div className="flex justify-start gap-1 flex-wrap">
                                        {/* Run AI Analysis */}
                                        <button
                                            className={`px-2 py-0.5 rounded-full shadow hover:bg-purple-700 flex items-center gap-1 text-xs transition-colors duration-150 ${
                                                isAnalyzing 
                                                    ? 'bg-purple-400 text-white cursor-not-allowed' 
                                                    : 'bg-purple-600 text-white'
                                            }`}
                                            onClick={runAIAnalysis}
                                            disabled={isAnalyzing}
                                        >
                                            {isAnalyzing ? <FaSpinner className="text-xs animate-spin" /> : <FaRobot className="text-xs" />}
                                            <span>{isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}</span>
                                        </button>

                                        {/* Generate Letter */}
                                        <button
                                            className={`px-2 py-0.5 rounded-full shadow hover:bg-indigo-700 flex items-center gap-1 text-xs transition-colors duration-150 ${
                                                isGeneratingLetter || !analysisResult
                                                    ? 'bg-indigo-400 text-white cursor-not-allowed' 
                                                    : 'bg-indigo-600 text-white'
                                            }`}
                                            onClick={generateAppealLetter}
                                            disabled={isGeneratingLetter || !analysisResult}
                                            title={!analysisResult ? 'Run AI Analysis first' : ''}
                                        >
                                            {isGeneratingLetter ? <FaSpinner className="text-xs animate-spin" /> : <FaRobot className="text-xs" />}
                                            <span>{isGeneratingLetter ? 'Generating...' : 'Generate Letter'}</span>
                                        </button>

                                        {/* Highlight PDF (new button) */}
                                        <button
                                            className={`px-2 py-0.5 rounded-full shadow hover:bg-yellow-700 flex items-center gap-1 text-xs transition-colors duration-150 ${
                                                isHighlightingPDF || !analysisResult?.evidence_ids?.length
                                                    ? 'bg-yellow-400 text-white cursor-not-allowed' 
                                                    : 'bg-yellow-600 text-white'
                                            }`}
                                            onClick={() => createHighlightedPDF(analysisResult)}
                                            disabled={isHighlightingPDF || !analysisResult?.evidence_ids?.length}
                                            title={!analysisResult?.evidence_ids?.length ? 'Need evidence from AI Analysis first' : 'Create highlighted PDF'}
                                        >
                                            {isHighlightingPDF ? <FaSpinner className="text-xs animate-spin" /> : <FaHighlighter className="text-xs" />}
                                            <span>{isHighlightingPDF ? 'Highlighting...' : 'Highlight PDF'}</span>
                                        </button>

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
                                        
                                        {/* Enhanced Download Documents */}
                                        <button
                                            className={`px-2 py-0.5 rounded-full shadow hover:bg-gray-700 flex items-center gap-1 text-xs transition-colors duration-150 ${
                                                !generatedLetter && !analysisResult
                                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                                    : 'bg-gray-600 text-white'
                                            }`}
                                            onClick={downloadDocs}
                                            disabled={!generatedLetter && !analysisResult}
                                            title={!generatedLetter && !analysisResult ? 'Generate letter or run analysis first' : 'Download all documents including highlighted PDF'}
                                        >
                                            <FaFilePdf className="text-xs" />
                                            <span>Download All</span>
                                        </button>
                                        
                                        {/* Export to CSV */}
                                        <button 
                                            className="bg-green-600 text-white px-2 py-0.5 rounded-full shadow-lg hover:bg-green-700 flex items-center gap-1 text-xs transition-colors duration-150"
                                            onClick={exportToCSV}
                                        >
                                            <FaFileExport className="text-xs" />
                                            <span className="font-medium">Export CSV</span>
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