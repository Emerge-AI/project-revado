import React, { useState } from 'react';
import { FaTimes, FaClock, FaExclamationTriangle, FaCheck, FaUser, FaPhone, FaEnvelope, FaExclamationCircle, FaCalendarAlt, FaFile, FaFileAlt, FaMoneyBillWave, FaHistory, FaNotesMedical, FaFileCode, FaEdit, FaEye } from 'react-icons/fa';
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
        <span className={`inline-flex gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium whitespace-nowrap ${colors[priority]}`}>
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

const PriorAuthDetailsSidebar = ({ auth, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [isActionSelectorOpen, setIsActionSelectorOpen] = useState(false);

    if (!isOpen) return null;

    const handleReviewClick = () => {
        setIsActionSelectorOpen(true);
    };

    const handleActionSelectorClose = () => {
        setIsActionSelectorOpen(false);
    };

    return (
        <>
            <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-white shadow-lg flex flex-col z-50">
                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Prior Authorization Details</h2>
                        <p className="text-sm text-gray-500">{auth.authId}</p>
                    </div>
                    <button
                        onClick={handleReviewClick}
                        className="px-3 py-1 flex items-center gap-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md transition-colors"
                    >
                        <FaEye className="h-4 w-4" />
                        <span>Review</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b flex-shrink-0">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'activity' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        Activity Log
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'clinical' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('clinical')}
                    >
                        Clinical Info
                    </button>
                </div>

                {/* Content - Fix overflow issue */}
                <div className="flex-1 overflow-y-auto p-6 pb-24">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Status section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block">Status</label>
                                        <div className="mt-1">
                                            <StatusBadge status={auth.status} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block">Priority</label>
                                        <div className="mt-1">
                                            <PriorityBadge priority={auth.priority} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block">Deadline</label>
                                        <p className={`text-sm font-medium ${auth.daysLeft <= 3 ? 'text-red-600' : auth.daysLeft <= 7 ? 'text-yellow-600' : 'text-gray-900'}`}>
                                            {auth.daysLeft === 0 ? 'Today' : `${auth.daysLeft} days left`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient section */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                    <FaUser className="mr-2" /> Patient Information
                                </h3>
                                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-900">{auth.patient.name}</p>
                                    <p className="text-sm text-gray-500">MRN: {auth.patient.mrn}</p>
                                </div>
                            </div>

                            {/* Service details */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                    <FaNotesMedical className="mr-2" /> Service Details
                                </h3>
                                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block">Service Type</label>
                                            <p className="text-sm text-gray-900">{auth.serviceType}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block">Service Code</label>
                                            <p className="text-sm text-gray-900">{auth.serviceCode}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block">Request Date</label>
                                            <p className="text-sm text-gray-900">{new Date(auth.requestDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block">Service Date</label>
                                            <p className="text-sm text-gray-900">{new Date(auth.serviceDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block">Requested By</label>
                                            <p className="text-sm text-gray-900">{auth.requestedBy}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payer information */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                    <FaMoneyBillWave className="mr-2" /> Payer Information
                                </h3>
                                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-900">{auth.payer}</p>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <FaPhone className="mr-2 text-gray-400" /> {auth.payerContact.phone}
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <FaEnvelope className="mr-2 text-gray-400" /> {auth.payerContact.email}
                                        </div>
                                    </div>
                                    {auth.payerPolicyReference && (
                                        <div className="mt-2">
                                            <a
                                                href={auth.payerPolicyReference}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                                            >
                                                <FaFileCode className="mr-2" /> View Payer Policy
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Information */}
                            {auth.additionalInfo && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                        <FaFileAlt className="mr-2" /> Additional Information
                                    </h3>
                                    <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700">{auth.additionalInfo}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="pt-2 flex flex-col gap-2">
                                {auth.status === 'Additional Info Needed' && (
                                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                                        <FaFile className="mr-2" /> Submit Additional Information
                                    </button>
                                )}

                                {auth.status === 'Pending Peer-to-Peer' && (
                                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                                        <FaPhone className="mr-2" /> Schedule Peer-to-Peer Review
                                    </button>
                                )}

                                {auth.status === 'Denied' && (
                                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none">
                                        <FaExclamationCircle className="mr-2" /> Appeal Denial
                                    </button>
                                )}

                                <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                                    <FaEdit className="mr-2" /> Edit Request
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                <FaHistory className="mr-2" /> Activity Timeline
                            </h3>
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {auth.auditTrail.map((activity, index) => (
                                        <li key={index}>
                                            <div className="relative pb-8">
                                                {index !== auth.auditTrail.length - 1 ? (
                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                                                            <FaCalendarAlt className="h-4 w-4 text-indigo-600" />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-800">{activity.action}</p>
                                                        </div>
                                                        <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                                            {new Date(activity.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'clinical' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                <FaNotesMedical className="mr-2" /> Clinical Information
                            </h3>

                            {/* Clinical documentation list */}
                            <div className="bg-gray-50 rounded-lg">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700">Supporting Documentation</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {auth.clinicalInfo.map((doc, index) => (
                                        <div key={index} className="px-4 py-3 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <FaFileAlt className="text-gray-400 mr-3" />
                                                <span className="text-sm text-gray-700">{doc.label}</span>
                                            </div>
                                            <a
                                                href={doc.link}
                                                className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full hover:bg-indigo-100"
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional clinical information */}
                            {auth.additionalInfo && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">Clinical Summary</h3>
                                    <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700">{auth.additionalInfo}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notes/Comments section */}
                            <div className="pt-4">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Add Clinical Notes
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={4}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Add additional clinical notes here..."
                                    ></textarea>
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                    >
                                        Save Notes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Render the DenialActionSelector */}
            <DenialActionSelector
                isOpen={isActionSelectorOpen}
                onClose={handleActionSelectorClose}
                denial={auth}
            />
        </>
    );
};

export default PriorAuthDetailsSidebar; 