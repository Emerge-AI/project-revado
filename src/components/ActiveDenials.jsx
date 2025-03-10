import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaPaperPlane, FaRobot, FaCheck, FaTimes, FaClock, FaHistory } from 'react-icons/fa';
import DenialDetailsSidebar from './DenialDetailsSidebar';
import { AppealDetailsSidebar } from './AppealsInProgress';
import NotesSideBar from './NotesSideBar';
import { denialMockData, appealMockData } from '../mockData';

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

const ActiveDenials = () => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [data, setData] = useState(denialMockData);
    const [selectedDenials, setSelectedDenials] = useState(new Set());
    const [selectedDenial, setSelectedDenial] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [isAppealSidebarOpen, setIsAppealSidebarOpen] = useState(false);
    

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedData = [...data].sort((a, b) => {
            // Handle nested patient object for patient name
            if (key === 'patient') {
                return direction === 'asc'
                    ? a.patient.name.localeCompare(b.patient.name)
                    : b.patient.name.localeCompare(a.patient.name);
            }

            // Handle dates
            if (key === 'serviceDate' || key === 'denialDate') {
                const dateA = new Date(a[key]);
                const dateB = new Date(b[key]);
                return direction === 'asc'
                    ? dateA - dateB
                    : dateB - dateA;
            }

            // Handle numeric values
            if (key === 'amount' || key === 'daysLeft') {
                return direction === 'asc'
                    ? a[key] - b[key]
                    : b[key] - a[key];
            }

            // Handle priority with custom order
            if (key === 'priority') {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return direction === 'asc'
                    ? priorityOrder[a[key]] - priorityOrder[b[key]]
                    : priorityOrder[b[key]] - priorityOrder[a[key]];
            }

            // Default string comparison for other fields
            return direction === 'asc'
                ? String(a[key]).localeCompare(String(b[key]))
                : String(b[key]).localeCompare(String(a[key]));
        });

        setData(sortedData);
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) return <FaSort className="inline" />;
        return sortConfig.direction === 'asc' ? <FaSortUp className="inline" /> : <FaSortDown className="inline" />;
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedDenials(new Set(data.map(denial => denial.id)));
        } else {
            setSelectedDenials(new Set());
        }
    };

    const handleSelectDenial = (id) => {
        const newSelected = new Set(selectedDenials);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedDenials(newSelected);
    };

    const isAllSelected = data.length > 0 && selectedDenials.size === data.length;
    const hasSelections = selectedDenials.size > 0;

    const handleNotesClick = (denial) => {
        setSelectedDenial(denial);
        setIsNotesSidebarOpen(true);
        setIsAppealSidebarOpen(false);
        setIsSidebarOpen(false);
    };
    
    const handleDenialClick = (denial) => {
        setSelectedDenial(denial);
        setIsSidebarOpen(true);
        setIsAppealSidebarOpen(false);
    };

    const handleAppealClick = (appealId) => {
        console.log(appealId)
        const appeal = appealMockData.find(a => a.id === appealId);
        if (appeal) {
            setSelectedAppeal(appeal);
            setIsAppealSidebarOpen(true);
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="p-6 relative">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Active Denials</h1>
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
                                onClick={() => handleSort('priority')}>
                                <div className="flex items-center space-x-1">
                                    <span>Priority</span>
                                    {getSortIcon('priority')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('denialId')}>
                                <div className="flex items-center space-x-1">
                                    <span>Denial ID</span>
                                    {getSortIcon('denialId')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <span>Linked Appeal</span>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('patient')}>
                                <div className="flex items-center space-x-1">
                                    <span>Patient</span>
                                    {getSortIcon('patient')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('serviceDate')}>
                                <div className="flex items-center space-x-1">
                                    <span>Service Date</span>
                                    {getSortIcon('serviceDate')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('denialDate')}>
                                <div className="flex items-center space-x-1">
                                    <span>Denial Date</span>
                                    {getSortIcon('denialDate')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <span>Payer</span>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <span>Denial Reason</span>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('amount')}>
                                <div className="flex items-center space-x-1">
                                    <span>Amount</span>
                                    {getSortIcon('amount')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('daysLeft')}>
                                <div className="flex items-center space-x-1">
                                    <span>Deadline</span>
                                    {getSortIcon('daysLeft')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <span>Status</span>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-100 divide-y divide-gray-200">
                        {data.map((denial) => (
                            <tr key={denial.id}
                                className={`hover:bg-gray-200 transition-colors duration-150 ${selectedDenials.has(denial.id) ? 'bg-indigo-50' : ''
                                    }`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                            checked={selectedDenials.has(denial.id)}
                                            onChange={() => handleSelectDenial(denial.id)}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <PriorityBadge priority={denial.priority} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">
                                    <button
                                        onClick={() => handleDenialClick(denial)}
                                        className="hover:text-indigo-900"
                                    >
                                        {denial.denialId}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {denial.linkedAppealId ? (
                                        <button
                                            onClick={() => handleAppealClick(denial.linkedAppealId)}
                                            className="text-indigo-700 hover:text-indigo-900"
                                        >
                                            {denial.linkedAppealId}
                                        </button>
                                    ) : (
                                        <span className="text-gray-500">No appeal linked</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-indigo-700 hover:text-indigo-900">{denial.patient.name}</a>
                                    </div>
                                    <div className="text-sm text-gray-600">MRN: {denial.patient.mrn}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {denial.serviceDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {denial.denialDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {denial.payer}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {denial.denialReason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    ${denial.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-orange-700">{denial.daysLeft} days left</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                                        {denial.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-700 hover:text-indigo-900 mr-3">
                                        <FaEdit className="inline" /> Edit
                                    </button>
                                    <button className="text-green-700 hover:text-green-900">
                                        <FaPaperPlane className="inline" /> Resubmit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                            <span className="font-medium">20</span> results
                        </div>
                        <div className="flex-1 flex justify-end">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-200">
                                    Previous
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                    1
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                    2
                                </button>
                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-200">
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Action Bar */}
            <div className={`fixed top-4 ml-64 left-4 flex items-center space-x-3 transition-all duration-300 transform ${hasSelections ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
                }`}>
                {/* Selection Count Badge */}
                <div className="bg-gray-700 text-white px-4 py-2 rounded-full shadow-md flex items-center space-x-2">
                    <FaCheck className="text-sm" />
                    <span>{selectedDenials.size} selected</span>
                </div>

                {/* Batch AI Edit Button */}
                <button
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 
                             flex items-center space-x-2 transition-colors duration-150"
                    onClick={() => console.log('Batch AI Appeal', Array.from(selectedDenials))}
                >
                    <FaRobot className="text-lg" />
                    <span className="font-medium">AI Appeal {selectedDenials.size} Denial{selectedDenials.size > 1 ? 's' : ''}</span>
                </button>
            </div>

            {/* Denial Details Sidebar */}
            <DenialDetailsSidebar
                denial={selectedDenial}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                handleAppealClick={() => handleAppealClick(selectedDenial.linkedAppealId)}
            />

            {/* Appeal Details Sidebar */}
            <AppealDetailsSidebar
                appeal={selectedAppeal}
                isOpen={isAppealSidebarOpen}
                onClose={() => setIsAppealSidebarOpen(false)}
                handleDenialClick={() => handleDenialClick(selectedDenial)}
            />
        </div>
    );
};

export default ActiveDenials;