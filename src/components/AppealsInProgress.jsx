import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaPaperPlane, FaFile, FaImage, FaExclamationTriangle, FaCheck, FaTimes, FaHistory, FaComments, FaClock, FaRobot } from 'react-icons/fa';
import DenialDetailsSidebar from './DenialDetailsSidebar';
import { denialMockData, appealMockData } from '../mockData';
import AIEnhanceSidebar from './AIEnhanceSidebar';
import NotesSideBar from './NotesSideBar';

const StatusBadge = ({ status }) => {
    const colors = {
        'Under Review': 'bg-orange-100 text-orange-800',
        'Draft': 'bg-gray-100 text-gray-800',
        'Won': 'bg-green-100 text-green-800',
        'Lost': 'bg-red-100 text-red-800'
    };

    return (
        <div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status.main]}`}>
                {status.main}
            </span>
            <div className="text-xs text-gray-500 mt-1">{status.sub}</div>
        </div>
    );
};

const EscalationBadge = ({ level }) => {
    const colors = {
        1: 'bg-yellow-100 text-yellow-800',
        2: 'bg-red-100 text-red-800'
    };

    return (
        <div className="flex items-center">
            <FaExclamationTriangle className="mr-1" />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}>
                Level {level}
            </span>
        </div>
    );
};

const ProgressBar = ({ current, total }) => {
    const percentage = (current / total) * 100;
    return (
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export const AppealDetailsSidebar = ({ appeal, isOpen, onClose, handleDenialClick }) => {
    if (!appeal) return null;

    const auditTrail = [
        { date: '2024-02-15 09:30', action: 'Appeal Created', user: 'Dr. Smith' },
        { date: '2024-02-15 14:45', action: 'Clinical Notes Added', user: 'Dr. Smith' },
        { date: '2024-02-16 10:15', action: 'Appeal Submitted', user: 'John Doe' },
        { date: '2024-02-20 11:30', action: 'Payer Response Received', user: 'System' },
    ];

    const communications = [
        { date: '2024-02-16', type: 'Outbound', message: 'Initial appeal submission' },
        { date: '2024-02-20', type: 'Inbound', message: 'Additional documentation requested' },
        { date: '2024-02-21', type: 'Outbound', message: 'Provided requested clinical notes' },
    ];

    return (
        <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Appeal Details</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <FaTimes className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-full pb-32">
                {/* Basic Info Section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Appeal ID</label>
                            <p className="text-sm text-gray-900">{appeal.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Linked Denial</label>
                            <p className="text-sm text-indigo-700 hover:text-indigo-900 cursor-pointer">
                                <a href="#" onClick={handleDenialClick}>{appeal.linkedDenialId}</a>
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <StatusBadge status={appeal.status} />
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                    <div className="space-y-4">
                        <div className="flex items-center text-sm">
                            <FaClock className="text-gray-400 mr-2" />
                            <span className="text-gray-500">Submitted:</span>
                            <span className="ml-2 text-gray-900">{appeal.submittedDate}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <FaClock className="text-gray-400 mr-2" />
                            <span className="text-gray-500">Expected Response:</span>
                            <span className="ml-2 text-gray-900">{appeal.expectedResponseDate}</span>
                        </div>
                        <div className="mt-2">
                            <ProgressBar current={appeal.daysSinceSubmission} total={45} />
                            <p className="text-sm text-gray-500 mt-1">{appeal.daysSinceSubmission} days since submission</p>
                        </div>
                    </div>
                </div>

                {/* Financial Section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Amount Appealed</label>
                            <p className="text-sm text-gray-900">${appeal.amountAppealed.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Success Probability</label>
                            <div className="flex items-center">
                                <span className={`text-sm font-medium ${appeal.successProbability >= 70 ? 'text-green-700' :
                                    appeal.successProbability >= 40 ? 'text-yellow-700' :
                                        'text-red-700'
                                    }`}>
                                    {appeal.successProbability}%
                                </span>
                                {appeal.successProbability >= 70 && <FaCheck className="ml-1 text-green-700" />}
                            </div>
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

                {/* Communications */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Communications</h3>
                    <div className="space-y-4">
                        {communications.map((comm, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <FaComments className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-900">{comm.message}</p>
                                    <p className="text-xs text-gray-500">{comm.date} - {comm.type}</p>
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
                        Edit Appeal
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const AppealsInProgress = () => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [data, setData] = useState(appealMockData);
    const [selectedAppeals, setSelectedAppeals] = useState(new Set());
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedDenial, setSelectedDenial] = useState(null);
    const [isDenialSidebarOpen, setIsDenialSidebarOpen] = useState(false);
    const [isAIEnhanceSidebarOpen, setIsAIEnhanceSidebarOpen] = useState(false);
    const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedData = [...data].sort((a, b) => {
            if (direction === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            }
            return a[key] < b[key] ? 1 : -1;
        });

        setData(sortedData);
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) return <FaSort className="inline" />;
        return sortConfig.direction === 'asc' ? <FaSortUp className="inline" /> : <FaSortDown className="inline" />;
    };

    const handleNotesClick = (appeal) => {
        setSelectedAppeal(appeal);
        setIsNotesSidebarOpen(true);
        setIsDenialSidebarOpen(false);
        setIsSidebarOpen(false);
    };

    const handleAppealClick = (appeal) => {
        setSelectedAppeal(appeal);
        setIsSidebarOpen(true);
        setIsDenialSidebarOpen(false);
        setIsNotesSidebarOpen(false);
    };

    const handleDenialClick = (denialId) => {
        const denial = denialMockData.find(d => d.denialId === denialId);
        if (denial) {
            setSelectedDenial(denial);
            setIsDenialSidebarOpen(true);
            setIsSidebarOpen(false);
            setIsNotesSidebarOpen(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedAppeals(new Set(data.map(appeal => appeal.id)));
        } else {
            setSelectedAppeals(new Set());
        }
    };

    const handleSelectAppeal = (id) => {
        const newSelected = new Set(selectedAppeals);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedAppeals(newSelected);
    };

    const isAllSelected = data.length > 0 && selectedAppeals.size === data.length;
    const hasSelections = selectedAppeals.size > 0;

    return (
        <div className="p-6 relative">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Appeals in Progress</h1>
            <div className="overflow-x-auto bg-gray-100 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('id')}>
                                <div className="flex items-center space-x-1">
                                    <span>Appeal ID</span>
                                    {getSortIcon('id')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Linked Denial ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('status')}>
                                <div className="flex items-center space-x-1">
                                    <span>Status</span>
                                    {getSortIcon('status')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Assigned To
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('submittedDate')}>
                                <div className="flex items-center space-x-1">
                                    <span>Submitted Date</span>
                                    {getSortIcon('submittedDate')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('expectedResponseDate')}>
                                <div className="flex items-center space-x-1">
                                    <span>Expected Response</span>
                                    {getSortIcon('expectedResponseDate')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Denial Reason
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Payer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('amountAppealed')}>
                                <div className="flex items-center space-x-1">
                                    <span>Amount</span>
                                    {getSortIcon('amountAppealed')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Days Since Submission
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Actions Needed
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Supporting Docs
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('successProbability')}>
                                <div className="flex items-center space-x-1">
                                    <span>Success Probability</span>
                                    {getSortIcon('successProbability')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Escalation
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-100 divide-y divide-gray-200">
                        {data.map((appeal) => (
                            <tr key={appeal.id} className={`hover:bg-gray-200 transition-colors duration-150 ${selectedAppeals.has(appeal.id) ? 'bg-indigo-50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                            checked={selectedAppeals.has(appeal.id)}
                                            onChange={() => handleSelectAppeal(appeal.id)}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">
                                    <button
                                        onClick={() => handleAppealClick(appeal)}
                                        className="hover:text-indigo-900"
                                    >
                                        {appeal.id}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <button
                                        onClick={() => handleDenialClick(appeal.linkedDenialId)}
                                        className="text-indigo-700 hover:text-indigo-900"
                                    >
                                        {appeal.linkedDenialId}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={appeal.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{appeal.assignedTo.name}</div>
                                    <div className="text-sm text-gray-500">{appeal.assignedTo.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {appeal.submittedDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{appeal.expectedResponseDate}</div>
                                    <div className={`text-sm ${appeal.daysLeft <= 7 ? 'text-red-600' : 'text-gray-500'}`}>
                                        {appeal.daysLeft} days left
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {appeal.appealReason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {appeal.payer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${appeal.amountAppealed.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <ProgressBar current={appeal.daysSinceSubmission} total={45} />
                                        <span className="text-sm text-gray-500">{appeal.daysSinceSubmission} days</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center text-indigo-700">
                                        <button onClick={() => handleNotesClick(appeal)}>
                                            <FaEdit className="mr-1"/>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        {appeal.supportingDocs.map((doc, index) => (
                                            <button key={index} className="text-indigo-700 hover:text-indigo-900">
                                                <FaFile className="inline mr-1" />
                                                {doc}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className={`text-sm font-medium ${appeal.successProbability >= 70 ? 'text-green-700' :
                                            appeal.successProbability >= 40 ? 'text-yellow-700' :
                                                'text-red-700'
                                            }`}>
                                            {appeal.successProbability}%
                                        </span>
                                        {appeal.successProbability >= 70 && <FaCheck className="ml-1 text-green-700" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <EscalationBadge level={appeal.escalationLevel} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Top Action Bar */}
            <div className={`fixed top-4 ml-64 left-4 flex items-center space-x-3 transition-all duration-300 transform ${hasSelections ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'}`}>
                {/* Selection Count Badge */}
                <div className="bg-gray-700 text-white px-4 py-2 rounded-full shadow-md flex items-center space-x-2">
                    <FaCheck className="text-sm" />
                    <span>{selectedAppeals.size} selected</span>
                </div>

                {/* AI Enhance Button */}
                <button
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 
                             flex items-center space-x-2 transition-colors duration-150"
                    onClick={() => setIsAIEnhanceSidebarOpen(true)}
                >
                    <FaRobot className="text-lg" />
                    <span className="font-medium">AI Enhance {selectedAppeals.size} Appeal{selectedAppeals.size > 1 ? 's' : ''}</span>
                </button>
            </div>

            {/* Appeal Details Sidebar */}
            <AppealDetailsSidebar
                appeal={selectedAppeal}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Denial Details Sidebar */}
            <DenialDetailsSidebar
                denial={selectedDenial}
                isOpen={isDenialSidebarOpen}
                onClose={() => setIsDenialSidebarOpen(false)}
            />

            {/* AI Enhancement Sidebar */}
            <AIEnhanceSidebar
                isOpen={isAIEnhanceSidebarOpen}
                onClose={() => setIsAIEnhanceSidebarOpen(false)}
                selectedAppeals={selectedAppeals}
            />

            {/* Notes Sidebar */}
            <NotesSideBar
                appeal={selectedAppeal}
                isOpen={isNotesSidebarOpen}
                onClose={() => setIsNotesSidebarOpen(false)}
            />
        </div>
    );
};

export default AppealsInProgress; 