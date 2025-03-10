import React from 'react';
import { FaTimes, FaClock, FaHistory } from 'react-icons/fa';


const NotesSideBar = ({ appeal, isOpen, onClose }) => {
    if (!appeal) return null;

    return (
        <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <FaTimes className="h-5 w-5" />
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
    );
};

export default NotesSideBar; 