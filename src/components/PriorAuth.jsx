import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaPaperPlane, FaEye, FaExclamationTriangle, FaCheck, FaTimes, FaClock, FaHistory, FaRobot } from 'react-icons/fa';
import { priorAuthMockData } from '../mockData';
import PriorAuthDetailsSidebar from './PriorAuthDetailsSidebar';
import AIEnhanceSidebar from './AIEnhanceSidebar';

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
        <span className={`inline-flex gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium whitespace-nowrap min-w-[90px] ${colors[priority]}`}>
            {emojis[priority]} {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return { color: 'bg-green-100 text-green-800', icon: <FaCheck className="mr-1" /> };
            case 'denied':
                return { color: 'bg-red-100 text-red-800', icon: <FaTimes className="mr-1" /> };
            case 'pending payer review':
                return { color: 'bg-blue-100 text-blue-800', icon: <FaClock className="mr-1" /> };
            case 'expedited review':
                return { color: 'bg-purple-100 text-purple-800', icon: <FaExclamationTriangle className="mr-1" /> };
            case 'additional info needed':
                return { color: 'bg-orange-100 text-orange-800', icon: <FaExclamationTriangle className="mr-1" /> };
            case 'awaiting clinical records':
                return { color: 'bg-yellow-100 text-yellow-800', icon: <FaHistory className="mr-1" /> };
            case 'pending peer-to-peer':
                return { color: 'bg-indigo-100 text-indigo-800', icon: <FaHistory className="mr-1" /> };
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: <FaClock className="mr-1" /> };
        }
    };

    const { color, icon } = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {icon} {status}
        </span>
    );
};

const PriorAuth = () => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [data, setData] = useState(priorAuthMockData);
    const [selectedAuths, setSelectedAuths] = useState(new Set());
    const [selectedAuth, setSelectedAuth] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAIEnhanceSidebarOpen, setIsAIEnhanceSidebarOpen] = useState(false);

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
            if (key === 'serviceDate' || key === 'requestDate') {
                const dateA = new Date(a[key]);
                const dateB = new Date(b[key]);
                return direction === 'asc'
                    ? dateA - dateB
                    : dateB - dateA;
            }

            // Handle numeric values
            if (key === 'daysLeft') {
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
            setSelectedAuths(new Set(data.map(auth => auth.id)));
        } else {
            setSelectedAuths(new Set());
        }
    };

    const handleSelectAuth = (id) => {
        const newSelected = new Set(selectedAuths);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedAuths(newSelected);
    };

    const handleAuthClick = (auth) => {
        setSelectedAuth(auth);
        setIsSidebarOpen(true);
    };

    const isAllSelected = data.length > 0 && selectedAuths.size === data.length;
    const hasSelections = selectedAuths.size > 0;

    return (
        <div className="p-6 relative">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Prior Authorizations</h1>

            <div className="overflow-x-auto bg-gray-100 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                <div className="flex">
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
                                <div className="flex space-x-1">
                                    <span>Priority</span>
                                    {getSortIcon('priority')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('authId')}>
                                <div className="flex space-x-1">
                                    <span>Auth ID</span>
                                    {getSortIcon('authId')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('patient')}>
                                <div className="flex space-x-1">
                                    <span>Patient</span>
                                    {getSortIcon('patient')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('requestDate')}>
                                <div className="flex space-x-1">
                                    <span>Request Date</span>
                                    {getSortIcon('requestDate')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('serviceDate')}>
                                <div className="flex space-x-1">
                                    <span>Service Date</span>
                                    {getSortIcon('serviceDate')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('payer')}>
                                <div className="flex space-x-1">
                                    <span>Payer</span>
                                    {getSortIcon('payer')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('serviceType')}>
                                <div className="flex space-x-1">
                                    <span>Service Type</span>
                                    {getSortIcon('serviceType')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('daysLeft')}>
                                <div className="flex space-x-1">
                                    <span>Days Left</span>
                                    {getSortIcon('daysLeft')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('status')}>
                                <div className="flex space-x-1">
                                    <span>Status</span>
                                    {getSortIcon('status')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-100 divide-y divide-gray-200">
                        {data.map((auth) => (
                            <tr key={auth.id}
                                className={`hover:bg-gray-200 transition-colors duration-150 ${selectedAuths.has(auth.id) ? 'bg-indigo-50' : ''
                                    }`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                            checked={selectedAuths.has(auth.id)}
                                            onChange={() => handleSelectAuth(auth.id)}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <PriorityBadge priority={auth.priority} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <button
                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        onClick={() => handleAuthClick(auth)}
                                    >
                                        {auth.authId}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div className="flex flex-col">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900 font-medium">{auth.patient.name}</a>
                                        <span className="text-xs text-gray-500">MRN: {auth.patient.mrn}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {new Date(auth.requestDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {new Date(auth.serviceDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {auth.payer}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate" title={auth.serviceType}>
                                    <div className="flex items-center">
                                        <span>{auth.serviceType}</span>
                                        <span className="ml-1 text-xs text-gray-500">({auth.serviceCode})</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className={`${auth.daysLeft <= 3 ? 'text-red-600 font-bold' :
                                        auth.daysLeft <= 7 ? 'text-yellow-600' : 'text-gray-700'}`}>
                                        {auth.daysLeft === 0 ? 'Today' : auth.daysLeft + ' days'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={auth.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleAuthClick(auth)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of{' '}
                            <span className="font-medium">8</span> results
                        </div>
                        <div className="flex-1 flex justify-end">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button className="relative inline-flex px-2 py-2 rounded-l-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-200">
                                    Previous
                                </button>
                                <button className="relative inline-flex px-4 py-2 border border-gray-300 bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                    1
                                </button>
                                <button className="relative inline-flex px-2 py-2 rounded-r-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-200">
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Action Bar - similar to ActiveDenials */}
            <div className={`fixed top-4 ml-64 left-4 flex space-x-3 transition-all duration-300 transform ${hasSelections ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
                }`}>
                {/* Selection Count Badge */}
                <div className="bg-gray-700 text-white px-4 py-2 rounded-full shadow-md flex items-center space-x-2">
                    <FaCheck className="text-sm" />
                    <span>{selectedAuths.size} selected</span>
                </div>

                {/* Batch AI Edit Button */}
                <button
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 
                             flex space-x-2 transition-colors duration-150"
                    onClick={() => setIsAIEnhanceSidebarOpen(true)}
                >
                    <FaRobot className="text-lg" />
                    <span className="font-medium">AI Complete {selectedAuths.size} Prior Auth{selectedAuths.size > 1 ? 's' : ''}</span>
                </button>
            </div>

            {/* Sidebar for displaying auth details */}
            {isSidebarOpen && selectedAuth && (
                <PriorAuthDetailsSidebar
                    auth={selectedAuth}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            )}

            {/* AI Enhancement Sidebar */}
            <AIEnhanceSidebar
                isOpen={isAIEnhanceSidebarOpen}
                onClose={() => setIsAIEnhanceSidebarOpen(false)}
                selectedAppeals={selectedAuths}
            />
        </div>
    );
};

export default PriorAuth; 