import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FiSearch, FiHome, FiFileText, FiTrendingUp, FiSettings,
    FiFolder, FiLink, FiUsers, FiPlusCircle, FiRefreshCw
} from 'react-icons/fi';

const Sidebar = ({ isMobile, isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            title: 'DASHBOARD',
            items: [
                { name: 'Denial Overview', icon: <FiHome />, path: '/dashboard' },
                { name: 'Active Denials', icon: <FiFileText />, path: '/active-denials' },
            ],
        },
        {
            title: 'ACTIONS',
            items: [
                { name: 'New Appeal', icon: <FiPlusCircle />, path: '/new-appeal' },
                { name: 'Bulk Resubmit', icon: <FiRefreshCw />, path: '/bulk-resubmit' },
            ],
        },
        {
            title: 'ANALYTICS',
            items: [
                { name: 'Trends', icon: <FiTrendingUp />, path: '/trends' },
                { name: 'Financial Impact', icon: <FiTrendingUp />, path: '/financial-impact' },
            ],
        },
        {
            title: 'TEMPLATES & TOOLS',
            items: [
                { name: 'Appeal Letters', icon: <FiFolder />, path: '/appeal-letters' },
                { name: 'Clinical Evidence', icon: <FiFolder />, path: '/clinical-evidence' },
                { name: 'Coding Reference', icon: <FiFolder />, path: '/coding-reference' },
            ],
        },
        {
            title: 'INTEGRATIONS',
            items: [
                { name: 'EHR Patient Chart', icon: <FiLink />, path: '/ehr-integration' },
                { name: 'Billing System', icon: <FiLink />, path: '/billing-integration' },
            ],
        },
        {
            title: 'ADMIN',
            items: [
                { name: 'User Assignments', icon: <FiUsers />, path: '/user-assignments' },
                { name: 'Audit Logs', icon: <FiFileText />, path: '/audit-logs' },
                { name: 'Settings', icon: <FiSettings />, path: '/settings' },
            ],
        },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            onClose();
        }
    };

    const filteredMenuItems = useMemo(() => {
        if (!searchQuery.trim()) return menuItems;

        const query = searchQuery.toLowerCase().trim();
        return menuItems.map(section => ({
            ...section,
            items: section.items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                section.title.toLowerCase().includes(query)
            )
        })).filter(section => section.items.length > 0);
    }, [searchQuery]);

    const sidebarVariants = {
        open: {
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            x: isMobile ? "-100%" : 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            variants={sidebarVariants}
            className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 w-64 shadow-lg flex flex-col
                  transform transition-transform duration-300 ease-in-out z-50
                  ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}`}
        >
            {/* Logo Section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Revado</h1>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                    {filteredMenuItems.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="py-2"
                        >
                            <div className="px-4 py-2">
                                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                                    {section.title}
                                </h2>
                            </div>
                            <AnimatePresence>
                                {section.items.map((item) => (
                                    <motion.button
                                        key={item.path}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full flex items-center px-4 py-2 text-left
                                            ${location.pathname === item.path
                                                ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-300'} 
                                            hover:bg-blue-50/50 dark:hover:bg-gray-800/50
                                            `}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                            {index < filteredMenuItems.length - 1 && (
                                <div className="mx-4 my-2 border-b border-gray-200 dark:border-gray-700" />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Mobile Close Button */}
            {isMobile && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 md:hidden"
                >
                    ✕
                </button>
            )}
        </motion.div>
    );
};

export default Sidebar; 