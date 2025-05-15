import React, { useState } from 'react';
import { FaTimes, FaClock, FaHistory, FaEye } from 'react-icons/fa';
import DenialActionSelector from './DenialActionSelector';

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
        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium whitespace-nowrap min-w-[90px] ${colors[priority]}`}>
            {emojis[priority]} {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
};

const DenialDetailsSidebar = ({ denial, isOpen, onClose, handleAppealClick }) => {
    const [isActionSelectorOpen, setIsActionSelectorOpen] = useState(false);

    if (!denial) return null;

    const auditTrail = [
        { date: '2024-03-01 10:00', action: 'Denial Received', user: 'System' },
        { date: '2024-03-01 14:30', action: 'Initial Review', user: 'Jane Smith' },
        { date: '2024-03-02 09:15', action: 'Documentation Requested', user: 'Dr. Johnson' },
        { date: '2024-03-03 11:00', action: 'Priority Updated to High', user: 'Maria Garcia' },
    ];

    const timeline = [
        { date: denial.serviceDate, event: 'Service Provided' },
        { date: denial.denialDate, event: 'Denial Received' },
        {
            date: new Date(new Date(denial.denialDate).getTime() + (denial.daysLeft * 86400000)).toISOString().split('T')[0],
            event: 'Appeal Deadline'
        }
    ];

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
                    <h2 className="text-xl font-semibold text-gray-900">Denial Details</h2>
                    <button onClick={handleReviewClick} className="px-3 py-1 flex items-center gap-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md transition-colors">
                        <FaEye className="h-4 w-4" />
                        <span>Review</span>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-full pb-32">
                    {/* Basic Info Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Denial ID</label>
                                <p className="text-sm text-gray-900">{denial.denialId}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Priority</label>
                                <div className="mt-1">
                                    <PriorityBadge priority={denial.priority} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <p className="mt-1">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                                        {denial.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Linked Appeal</label>
                                <p className="text-sm">
                                    {denial.linkedAppealId ? (
                                        <a href="#" onClick={handleAppealClick} className="text-indigo-700 hover:text-indigo-900">{denial.linkedAppealId}</a>
                                    ) : (
                                        <span className="text-gray-500">No appeal linked</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-sm text-indigo-700 hover:text-indigo-900 cursor-pointer">{denial.patient.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">MRN</label>
                                <p className="text-sm text-gray-900">{denial.patient.mrn}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                        <div className="space-y-4">
                            {timeline.map((item, index) => (
                                <div key={index} className="flex items-center text-sm">
                                    <FaClock className="text-gray-400 mr-2" />
                                    <span className="text-gray-500">{item.event}:</span>
                                    <span className="ml-2 text-gray-900">{item.date}</span>
                                </div>
                            ))}
                            <div className="mt-2">
                                <div className="text-sm text-orange-700 font-medium">{denial.daysLeft} days left to appeal</div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Amount</label>
                                <p className="text-sm text-gray-900">${denial.amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Payer</label>
                                <p className="text-sm text-gray-900">{denial.payer}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Denial Reason</label>
                                <p className="text-sm text-gray-900">{denial.denialReason}</p>
                            </div>
                        </div>
                    </div>

                    {/* Audit Trail */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Trail</h3>
                        <div className="space-y-4">
                            {auditTrail.map((entry, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <FaHistory className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-900">{entry.action}</p>
                                        <p className="text-xs text-gray-500">{entry.date} by {entry.user}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex space-x-3">
                        <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                            Create Appeal
                        </button>
                        <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Render the DenialActionSelector */}
            <DenialActionSelector
                isOpen={isActionSelectorOpen}
                onClose={handleActionSelectorClose}
                denial={denial}
            />
        </>
    );
};

export default DenialDetailsSidebar; 