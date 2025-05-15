import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import AppealGenerator from './AppealGenerator';

const DenialActionSelector = ({ isOpen, onClose, denial }) => {
    const [selectedAction, setSelectedAction] = useState('generate_appeal');
    const [showAppealGenerator, setShowAppealGenerator] = useState(false);

    if (!isOpen) return null;

    const handleActionSelect = (actionType) => {
        setSelectedAction(actionType);
    };

    const handleSubmit = () => {
        console.log(`Selected action: ${selectedAction}`);

        // Handle different actions based on type
        if (selectedAction === 'generate_appeal') {
            // Show the appeal generator but don't close this modal yet
            setShowAppealGenerator(true);
        } else {
            // For other actions, simply close this modal
            onClose();
        }
    };

    const handleBackFromAppealGenerator = () => {
        // Just hide the appeal generator, keeping the action selector open
        setShowAppealGenerator(false);
    };

    const handleCloseFromAppealGenerator = () => {
        // Close both the appeal generator and the action selector
        setShowAppealGenerator(false);
        onClose();
    };

    // Create a component for action options to reduce repetition
    const ActionOption = ({ id, title, description, isSelected, isHighlighted = false, hasBadge = false, badgeText = '' }) => (
        <div
            className={`mb-4 border ${isHighlighted ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100' : 'border-gray-200 hover:bg-gray-50'} rounded-lg p-4 cursor-pointer transition-colors`}
            onClick={() => handleActionSelect(id)}
        >
            <div className="flex items-start space-x-3">
                <input
                    type="radio"
                    id={id}
                    name="action"
                    checked={isSelected}
                    onChange={() => handleActionSelect(id)}
                    className="h-4 w-4 mt-1 text-indigo-600 cursor-pointer"
                    // Prevent clicking the radio button from triggering the parent div's onClick
                    onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                    <div className="flex justify-between">
                        <label
                            htmlFor={id}
                            className={`block text-sm font-medium ${isHighlighted ? 'text-indigo-700' : 'text-gray-700'} cursor-pointer`}
                        >
                            {title}
                        </label>
                        {hasBadge && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {badgeText}
                            </span>
                        )}
                    </div>
                    <p className={`text-xs ${isHighlighted ? 'text-indigo-600' : 'text-gray-500'}`}>{description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Show the AppealGenerator if it's active, otherwise show the DenialActionSelector */}
            {showAppealGenerator ? (
                <AppealGenerator
                    isOpen={showAppealGenerator}
                    onClose={handleCloseFromAppealGenerator}
                    onBack={handleBackFromAppealGenerator}
                    patientData={denial}
                />
            ) : (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"></div>

                    {/* Modal */}
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-xl">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="h-5 w-5" />
                            </button>

                            {/* Modal Header */}
                            <div className="p-6 pb-0">
                                <h2 className="text-xl font-bold text-gray-800">Select Denial Action</h2>
                                <p className="text-sm text-gray-600 mt-1">Choose how to handle this denial</p>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Available Actions */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Available Actions</h3>

                                    <ActionOption
                                        id="notify_caregiver"
                                        title="Notify Caregiver"
                                        description="Send notification to caregiver for correction"
                                        isSelected={selectedAction === 'notify_caregiver'}
                                    />

                                    <ActionOption
                                        id="generate_appeal"
                                        title="Generate Appeal"
                                        description="Generate an appeal for the denial"
                                        isSelected={selectedAction === 'generate_appeal'}
                                        isHighlighted={true}
                                        hasBadge={true}
                                        badgeText="Suggested"
                                    />

                                    <ActionOption
                                        id="ai_call_payer"
                                        title="Allow AI to Call Payer"
                                        description="Let AI handle follow-up"
                                        isSelected={selectedAction === 'ai_call_payer'}
                                    />

                                    <ActionOption
                                        id="mark_called"
                                        title="Mark as Called"
                                        description="Mark as manually called"
                                        isSelected={selectedAction === 'mark_called'}
                                    />

                                    <ActionOption
                                        id="resolve_internally"
                                        title="Resolve Internally"
                                        description="Mark as resolved internally"
                                        isSelected={selectedAction === 'resolve_internally'}
                                    />
                                </div>

                                {/* Right Column - Denial Details */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Denial Details</h3>
                                        <div className="mt-1 text-sm text-red-600 font-medium">Medical Necessity Not Met</div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Nursing Assessment */}
                                        <div className="text-left">
                                            <h4 className="text-md font-medium text-gray-700">Nursing Assessment (Start of Care – RN)</h4>
                                            <p className="text-xs text-gray-500">Date: 03/15/2024 | RN: Sarah Johnson</p>
                                        </div>

                                        {/* Chief Complaint */}
                                        <div className="text-left">
                                            <h4 className="text-sm font-medium text-gray-700">Chief Complaint:</h4>
                                            <p className="text-sm text-gray-800">
                                                Patient reports feeling <span className="bg-indigo-50 px-1">a little off</span> lately. Denies pain or specific symptoms.
                                            </p>
                                        </div>

                                        {/* History of Present Illness */}
                                        <div className="text-left">
                                            <h4 className="text-sm font-medium text-gray-700">History of Present Illness:</h4>
                                            <p className="text-sm text-gray-800">
                                                Patient is a 79-year-old female with a history of hypertension and arthritis. She was recently
                                                discharged from the hospital after a <span className="bg-indigo-50 px-1">2-day observation stay</span> due to "elevated blood
                                                pressure." <span className="bg-indigo-50 px-1">Currently stable</span>.
                                            </p>
                                        </div>

                                        {/* Medications */}
                                        <div className="text-left">
                                            <h4 className="text-sm font-medium text-gray-700">Medications:</h4>
                                            <p className="text-sm text-gray-800">
                                                Patient takes Lisinopril, Tylenol as needed, and a multivitamin. States she is
                                                <span className="bg-indigo-50 px-1">"pretty good about taking them."</span>
                                            </p>
                                        </div>

                                        {/* Physical Assessment */}
                                        <div className="text-left">
                                            <h4 className="text-sm font-medium text-gray-700">Physical Assessment:</h4>
                                            <ul className="text-sm text-gray-800 list-disc pl-5 space-y-1">
                                                <li>Alert and oriented x3.</li>
                                                <li><span className="bg-indigo-50 px-1">Vital signs stable</span>.</li>
                                            </ul>
                                        </div>
                                    </div>
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
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DenialActionSelector; 