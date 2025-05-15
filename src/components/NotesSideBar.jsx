import React, { useState } from 'react';
import { FaTimes, FaClock, FaHistory, FaEye } from 'react-icons/fa';
import DenialActionSelector from './DenialActionSelector';

const NotesSideBar = ({ appeal, isOpen, onClose }) => {
    const [isActionSelectorOpen, setIsActionSelectorOpen] = useState(false);

    if (!appeal) return null;

    const handleReviewClick = () => {
        setIsActionSelectorOpen(true);
    };

    const handleActionSelectorClose = () => {
        setIsActionSelectorOpen(false);
    };

    return (
        <>
            <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
                    <button onClick={handleReviewClick} className="px-3 py-1 flex items-center gap-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md transition-colors">
                        <FaEye className="h-4 w-4" />
                        <span>Review</span>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-full pb-32">
                    {/* Basic Info Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <p className="text-lg font-medium text-gray-900 mb-4">{appeal.actionsNeeded}</p>
                    </div>
                </div>
            </div>

            {/* Render the DenialActionSelector */}
            <DenialActionSelector
                isOpen={isActionSelectorOpen}
                onClose={handleActionSelectorClose}
                denial={appeal}
            />
        </>
    );
};

export default NotesSideBar; 