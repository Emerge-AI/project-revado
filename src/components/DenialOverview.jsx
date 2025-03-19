import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaClock, FaChartLine, FaDollarSign, FaExclamationTriangle, FaHospital, FaFileAlt, FaBell, FaCheckCircle, FaTimesCircle, FaSpinner, FaFileExport, FaChartBar, FaFileContract, FaSearch, FaUpload, FaSort, FaSortUp, FaSortDown, FaFilter, FaEye, FaList, FaChartPie, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MetricCard = ({ title, value, comparison, trend, icon: Icon, prefix = '', suffix = '', colorClass = 'bg-indigo-50 text-indigo-600' }) => {
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
    const TrendIcon = trend === 'up' ? FaArrowUp : FaArrowDown;

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="text-xl" />
                </div>
            </div>
            <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                    {prefix}{value}{suffix}
                </p>
                {comparison && (
                    <span className={`ml-2 flex items-center text-sm ${trendColor}`}>
                        <TrendIcon className="mr-1 h-3 w-3" />
                        {comparison}
                    </span>
                )}
            </div>
        </div>
    );
};

const SummaryMetrics = () => {
    // Mock data - replace with real data from your backend
    const metrics = {
        totalDenials: {
            current: 245,
            previous: 210,
            trend: 'up',
            change: '+16.7%'
        },
        atRisk: {
            amount: 1250000,
            trend: 'up',
            change: '+8.3%'
        },
        recovered: {
            amount: 850000,
            trend: 'up',
            change: '+12.4%'
        },
        successRate: {
            rate: 76.5,
            trend: 'up',
            change: '+2.3%'
        },
        resolutionTime: {
            days: 12.3,
            trend: 'down',
            change: '-15.2%'
        },
        topDenialReason: {
            code: 'CO-22',
            percentage: 30,
            description: 'Missing Modifier'
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
                title="Total Denials (This Month)"
                value={metrics.totalDenials.current}
                comparison={metrics.totalDenials.change}
                trend={metrics.totalDenials.trend}
                icon={FaExclamationTriangle}
                colorClass="bg-red-50 text-red-600"
            />
            <MetricCard
                title="Amount at Risk"
                value={metrics.atRisk.amount.toLocaleString()}
                comparison={metrics.atRisk.change}
                trend={metrics.atRisk.trend}
                icon={FaDollarSign}
                prefix="$"
                colorClass="bg-yellow-50 text-yellow-600"
            />
            <MetricCard
                title="Amount Recovered (YTD)"
                value={metrics.recovered.amount.toLocaleString()}
                comparison={metrics.recovered.change}
                trend={metrics.recovered.trend}
                icon={FaDollarSign}
                prefix="$"
                colorClass="bg-green-50 text-green-600"
            />
            <MetricCard
                title="Appeal Success Rate"
                value={metrics.successRate.rate}
                comparison={metrics.successRate.change}
                trend={metrics.successRate.trend}
                icon={FaChartLine}
                suffix="%"
                colorClass="bg-blue-50 text-blue-600"
            />
            <MetricCard
                title="Avg. Resolution Time"
                value={metrics.resolutionTime.days}
                comparison={metrics.resolutionTime.change}
                trend={metrics.resolutionTime.trend}
                icon={FaClock}
                suffix=" days"
                colorClass="bg-purple-50 text-purple-600"
            />
            <MetricCard
                title="Top Denial Reason"
                value={metrics.topDenialReason.code}
                comparison={`${metrics.topDenialReason.percentage}% of cases`}
                icon={FaFileContract}
                suffix=""
                colorClass="bg-indigo-50 text-indigo-600"
            />
        </div>
    );
};

const DenialTrends = () => {
    // Mock data for the trends - expanded with more points and realistic patterns
    const trends = [
        { month: 'Jan', denials: 185, amount: 2450000, priorDenials: 170, benchmark: 160, department: 'Cardiology', payer: 'UnitedHealthcare', reason: 'Missing Auth' },
        { month: 'Jan W2', denials: 192, amount: 2520000, priorDenials: 175, benchmark: 160, department: 'Cardiology', payer: 'UnitedHealthcare', reason: 'Missing Auth' },
        { month: 'Jan W3', denials: 188, amount: 2480000, priorDenials: 172, benchmark: 160, department: 'Cardiology', payer: 'UnitedHealthcare', reason: 'Missing Auth' },
        { month: 'Jan W4', denials: 195, amount: 2550000, priorDenials: 178, benchmark: 160, department: 'Cardiology', payer: 'UnitedHealthcare', reason: 'Missing Auth' },
        { month: 'Feb', denials: 210, amount: 2820000, priorDenials: 180, benchmark: 160, department: 'Cardiology', payer: 'UnitedHealthcare', reason: 'Missing Auth' },
        { month: 'Feb W2', denials: 215, amount: 2900000, priorDenials: 182, benchmark: 160, department: 'Cardiology', payer: 'UnitedHealthcare', reason: 'Missing Auth' },
        { month: 'Feb W3', denials: 208, amount: 2750000, priorDenials: 179, benchmark: 160, department: 'Cardiology', payer: 'UnitedHealthcare', reason: 'Missing Auth' },
        { month: 'Feb W4', denials: 220, amount: 3100000, priorDenials: 185, benchmark: 160, department: 'Cardiology', payer: 'Aetna', reason: 'Medical Necessity' },
        { month: 'Mar', denials: 205, amount: 2680000, priorDenials: 175, benchmark: 160, department: 'Cardiology', payer: 'Aetna', reason: 'Medical Necessity' },
        { month: 'Mar W2', denials: 198, amount: 2520000, priorDenials: 172, benchmark: 160, department: 'Cardiology', payer: 'Aetna', reason: 'Medical Necessity' },
        { month: 'Mar W3', denials: 212, amount: 2950000, priorDenials: 180, benchmark: 160, department: 'Cardiology', payer: 'Aetna', reason: 'Medical Necessity' },
        { month: 'Mar W4', denials: 225, amount: 3250000, priorDenials: 188, benchmark: 160, department: 'Cardiology', payer: 'Aetna', reason: 'Medical Necessity' },
        { month: 'Apr', denials: 235, amount: 3450000, priorDenials: 195, benchmark: 160, department: 'Cardiology', payer: 'Aetna', reason: 'Medical Necessity' },
        { month: 'Apr W2', denials: 242, amount: 3580000, priorDenials: 198, benchmark: 160, department: 'Orthopedics', payer: 'Blue Cross', reason: 'Coding Error' },
        { month: 'Apr W3', denials: 238, amount: 3420000, priorDenials: 192, benchmark: 160, department: 'Orthopedics', payer: 'Blue Cross', reason: 'Coding Error' },
        { month: 'Apr W4', denials: 245, amount: 3650000, priorDenials: 200, benchmark: 160, department: 'Orthopedics', payer: 'Blue Cross', reason: 'Coding Error' }
    ];

    const [selectedMetric, setSelectedMetric] = useState('denials'); // 'denials' or 'amount'
    const [selectedPayer, setSelectedPayer] = useState('All');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [selectedReason, setSelectedReason] = useState('All');
    const [showPriorPeriod, setShowPriorPeriod] = useState(true);
    const [showBenchmark, setShowBenchmark] = useState(true);

    // Add state for rotating insights
    const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

    // Get unique values for filters
    const payers = ['All', ...new Set(trends.map(t => t.payer))];
    const departments = ['All', ...new Set(trends.map(t => t.department))];
    const reasons = ['All', ...new Set(trends.map(t => t.reason))];

    // Filter data based on selections
    const filteredTrends = trends.filter(trend => {
        if (selectedPayer !== 'All' && trend.payer !== selectedPayer) return false;
        if (selectedDepartment !== 'All' && trend.department !== selectedDepartment) return false;
        if (selectedReason !== 'All' && trend.reason !== selectedReason) return false;
        return true;
    });

    // Calculate percentage change from filtered data
    const latestMonth = filteredTrends[filteredTrends.length - 1];
    const previousMonth = filteredTrends[filteredTrends.length - 2];
    const percentageChange = ((latestMonth?.denials || 0) - (previousMonth?.denials || 0)) / (previousMonth?.denials || 1) * 100;
    const changeDirection = percentageChange > 0 ? 'increased' : 'decreased';

    // Generate insights from the filtered data
    const generateInsights = (data) => {
        if (!data.length) return [];

        const latest = data[data.length - 1];
        const previous = data[data.length - 2];
        const monthAvg = data.reduce((sum, d) => sum + d.denials, 0) / data.length;
        const maxDenial = Math.max(...data.map(d => d.denials));
        const maxDenialPoint = data.find(d => d.denials === maxDenial);

        return [
            {
                text: `${selectedDepartment === 'All' ? 'Overall' : selectedDepartment} denials ${changeDirection} ${Math.abs(percentageChange.toFixed(1))}% in ${latestMonth?.month || ''}`
            },
            {
                text: `Average of ${Math.round(monthAvg)} denials per period, with peak of ${maxDenial} in ${maxDenialPoint.month}`
            },
            {
                text: `Total amount at risk ${latest.amount > previous.amount ? 'increased' : 'decreased'} to $${latest.amount.toLocaleString()}`
            },
            {
                text: selectedPayer !== 'All'
                    ? `${selectedPayer} accounts for ${((data.filter(t => t.payer === selectedPayer).length / data.length) * 100).toFixed(1)}% of denials`
                    : `Analyzing trends across all payers`
            }
        ];
    };

    // Set up rotation interval
    useEffect(() => {
        const insights = generateInsights(filteredTrends);
        const interval = setInterval(() => {
            setCurrentInsightIndex(current => (current + 1) % insights.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval);
    }, [filteredTrends, selectedPayer, selectedDepartment]);

    const insights = generateInsights(filteredTrends);

    const FilterButton = ({ label, options, value, onChange }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    );

    const ToggleButton = ({ label, isActive, onChange }) => (
        <button
            onClick={() => onChange(!isActive)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 
                ${isActive
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );

    // Helper function to format numbers with k/M suffix
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num.toString();
    };

    // Helper function to format tooltip values
    const formatTooltipValue = (value, metric) => {
        if (metric === 'amount') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        }
        return value.toLocaleString();
    };

    // Helper function to get Y-axis values with better distribution
    const getYAxisValues = (data, key) => {
        const values = data.map(t => t[key] || 0);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;
        const step = range / 4;
        const baseValue = Math.floor(minValue / step) * step;
        return Array.from({ length: 5 }, (_, i) => Math.round(baseValue + (step * (4 - i))));
    };

    // Helper function to create SVG path with smoother curves
    const createPath = (data, valueKey) => {
        if (!data.length) return '';
        const values = data.map(t => t[valueKey] || 0);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;
        const padding = range * 0.1;

        // Create points for the curve
        const points = data.map((point, i) => {
            const x = (i / (data.length - 1)) * 100;
            const normalizedY = ((point[valueKey] || 0) - minValue) / (range + padding * 2);
            const y = 100 - (normalizedY * 100);
            return { x, y };
        });

        // Create a smooth curve using cubic bezier
        return points.reduce((path, point, i) => {
            if (i === 0) return `M ${point.x} ${point.y}`;

            const prev = points[i - 1];
            const curr = point;

            // Calculate control points for smooth curve
            const cp1x = prev.x + (curr.x - prev.x) / 3;
            const cp1y = prev.y;
            const cp2x = curr.x - (curr.x - prev.x) / 3;
            const cp2y = curr.y;

            return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }, '');
    };

    const yAxisValues = getYAxisValues(filteredTrends, selectedMetric);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Denial Trends</h3>
                <div className="h-8 w-full relative mt-1 overflow-hidden">
                    {insights.map((insight, index) => (
                        <div key={index} className="absolute w-full">
                            <p
                                className={`text-sm text-gray-500 text-center transition-all duration-500 transform
                                    ${index === currentInsightIndex
                                        ? 'translate-x-0 opacity-100'
                                        : index < currentInsightIndex
                                            ? '-translate-x-full opacity-0'
                                            : 'translate-x-full opacity-0'}`}
                            >
                                {insight.text}
                                {selectedReason !== 'All' ? ` due to ${selectedReason.toLowerCase()}` : ''}
                            </p>
                            {index === currentInsightIndex && (
                                <div className="w-full h-0.5 bg-gray-100 mt-2">
                                    <div
                                        className="h-full bg-indigo-600 transition-all duration-[5000ms] ease-linear"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-2 mt-4">
                    <ToggleButton
                        label="Prior Period"
                        isActive={showPriorPeriod}
                        onChange={setShowPriorPeriod}
                    />
                    <ToggleButton
                        label="Benchmark"
                        isActive={showBenchmark}
                        onChange={setShowBenchmark}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <FilterButton
                    label="Metric"
                    options={[
                        { value: 'denials', label: 'Number of Denials' },
                        { value: 'amount', label: 'Amount ($)' }
                    ].map(opt => opt.value)}
                    value={selectedMetric}
                    onChange={setSelectedMetric}
                />
                <FilterButton
                    label="Payer"
                    options={payers}
                    value={selectedPayer}
                    onChange={setSelectedPayer}
                />
                <FilterButton
                    label="Department"
                    options={departments}
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                />
                <FilterButton
                    label="Denial Reason"
                    options={reasons}
                    value={selectedReason}
                    onChange={setSelectedReason}
                />
            </div>

            <div className="h-64 relative pl-16"> {/* Increased left padding for Y-axis */}
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
                    {yAxisValues.map((value, i) => (
                        <div key={i} className="flex items-center justify-end w-full pr-2">
                            {selectedMetric === 'amount' ? '$' : ''}{formatNumber(value)}
                        </div>
                    ))}
                </div>

                {/* Chart grid lines */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="col-span-6 border-t border-gray-100" />
                    ))}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="row-span-4 border-l border-gray-100" />
                    ))}
                </div>

                {/* Lines */}
                <div className="absolute inset-0">
                    {/* Current period line */}
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d={createPath(filteredTrends, selectedMetric)}
                            fill="none"
                            stroke="#4F46E5"
                            strokeWidth="2"
                            className="transition-all duration-300"
                        />
                    </svg>

                    {/* Prior period line */}
                    {showPriorPeriod && (
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path
                                d={createPath(filteredTrends, 'priorDenials')}
                                fill="none"
                                stroke="#94A3B8"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                className="transition-all duration-300"
                            />
                        </svg>
                    )}

                    {/* Benchmark line */}
                    {showBenchmark && (
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path
                                d={createPath(filteredTrends, 'benchmark')}
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2"
                                strokeDasharray="2 2"
                                className="transition-all duration-300"
                            />
                        </svg>
                    )}

                    {/* Data points with enhanced tooltips */}
                    {filteredTrends.map((point, i) => {
                        const x = (i / (filteredTrends.length - 1)) * 100;
                        const values = filteredTrends.map(t => t[selectedMetric] || 0);
                        const maxValue = Math.max(...values);
                        const minValue = Math.min(...values);
                        const range = maxValue - minValue;
                        const padding = range * 0.1;
                        const normalizedY = ((point[selectedMetric] || 0) - minValue) / (range + padding * 2);
                        const y = 100 - (normalizedY * 100);

                        return (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                                    hover:ring-4 hover:ring-indigo-100 transition-all duration-150"
                                style={{ left: `${x}%`, top: `${y}%` }}
                                title={`${point.month}: ${formatTooltipValue(point[selectedMetric], selectedMetric)}`}
                            />
                        );
                    })}
                </div>

                {/* X-axis labels with better spacing */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                    {filteredTrends.filter((_, i) => i % 4 === 0).map((point, i) => (
                        <div key={i} className="text-xs text-gray-500 transform -rotate-45 origin-top-left">{point.month}</div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6">
                <div className="flex items-center">
                    <div className="w-3 h-0.5 bg-indigo-600 mr-2" />
                    <span className="text-sm text-gray-600">Current Period</span>
                </div>
                {showPriorPeriod && (
                    <div className="flex items-center">
                        <div className="w-3 h-0.5 bg-gray-400 mr-2" style={{ borderTop: '2px dashed' }} />
                        <span className="text-sm text-gray-600">Prior Period</span>
                    </div>
                )}
                {showBenchmark && (
                    <div className="flex items-center">
                        <div className="w-3 h-0.5 bg-green-500 mr-2" style={{ borderTop: '2px dotted' }} />
                        <span className="text-sm text-gray-600">Benchmark</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const TopPayers = () => {
    const payers = [
        { name: 'UnitedHealthcare', denials: 85, amount: 450000 },
        { name: 'Aetna', denials: 65, amount: 320000 },
        { name: 'Blue Cross', denials: 45, amount: 280000 },
        { name: 'Cigna', denials: 35, amount: 175000 },
        { name: 'Medicare', denials: 15, amount: 95000 }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Denials by Payer</h3>
            <div className="space-y-4">
                {payers.map((payer, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">{payer.name}</span>
                            <span className="text-sm text-gray-500">${payer.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${(payer.denials / payers[0].denials) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-500">{payer.denials}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            type: 'success',
            title: 'Appeal Won',
            description: 'Appeal APL-1004 was approved for $3,500',
            time: '2 hours ago'
        },
        {
            id: 2,
            type: 'pending',
            title: 'New Denial',
            description: 'Received denial DNL-0567 from Aetna',
            time: '4 hours ago'
        },
        {
            id: 3,
            type: 'failed',
            title: 'Appeal Lost',
            description: 'Appeal APL-1006 was denied',
            time: '5 hours ago'
        },
        {
            id: 4,
            type: 'pending',
            title: 'Appeal Submitted',
            description: 'New appeal APL-1007 submitted to Medicare',
            time: '6 hours ago'
        }
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'failed':
                return <FaTimesCircle className="text-red-500" />;
            case 'pending':
                return <FaSpinner className="text-yellow-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                            <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ActionItems = () => {
    const actions = [
        {
            id: 1,
            title: 'Appeals Requiring Documentation',
            count: 12,
            icon: FaFileAlt,
            priority: 'high'
        },
        {
            id: 2,
            title: 'Approaching Deadlines',
            count: 8,
            icon: FaClock,
            priority: 'high'
        },
        {
            id: 3,
            title: 'Pending Provider Response',
            count: 15,
            icon: FaHospital,
            priority: 'medium'
        },
        {
            id: 4,
            title: 'Ready for Submission',
            count: 5,
            icon: FaBell,
            priority: 'low'
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Action Items</h3>
            <div className="grid grid-cols-1 gap-4">
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                        <div className="flex items-center space-x-3">
                            <action.icon className={`text-xl ${action.priority === 'high' ? 'text-red-500' :
                                action.priority === 'medium' ? 'text-yellow-500' :
                                    'text-green-500'
                                }`} />
                            <span className="text-sm font-medium text-gray-900">{action.title}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{action.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuickActionToolbar = () => {
    const navigate = useNavigate();

    const actions = [
        {
            id: 1,
            title: 'Bulk Resubmit Claims',
            description: 'Resubmit multiple claims at once',
            icon: FaUpload,
            path: '/bulk-resubmit',
            color: 'bg-gradient-to-br from-gray-700/90 to-gray-800/90'
        },
        {
            id: 2,
            title: 'Generate Custom Report',
            description: 'Create detailed custom reports',
            icon: FaChartBar,
            path: '/trends',
            color: 'bg-gradient-to-br from-gray-800/90 to-gray-700/90'
        },
        {
            id: 3,
            title: 'Review Appeal Templates',
            description: 'Manage appeal letter templates',
            icon: FaFileContract,
            path: '/appeal-letters',
            color: 'bg-gradient-to-br from-gray-700/90 to-gray-800/90'
        },
        {
            id: 4,
            title: 'Audit Denial Trends',
            description: 'Analyze denial patterns',
            icon: FaSearch,
            path: '/trends',
            color: 'bg-gradient-to-br from-gray-800/90 to-gray-700/90'
        }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={action.id}
                        onClick={() => navigate(action.path)}
                        className={`group relative ${action.color} p-6 rounded-xl transition-all duration-300 
                            transform hover:scale-102 hover:shadow-lg overflow-hidden border border-gray-600/20`}
                    >
                        {/* Accent border effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-400/40 via-purple-400/40 to-indigo-400/40" />
                        </div>

                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]" />
                        </div>

                        <div className="relative flex flex-col items-center text-center space-y-3">
                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm ring-1 ring-white/20 group-hover:ring-white/30 group-hover:bg-white/20 transition-all duration-300">
                                <action.icon className="text-2xl text-white/90" />
                            </div>
                            <span className="font-medium text-white/90 group-hover:text-white">{action.title}</span>
                            <span className="text-xs text-white/70 group-hover:text-white/80">{action.description}</span>
                        </div>

                        {/* Hover glow effect */}
                        <div className="absolute -inset-px bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-indigo-400/30 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
                    </button>
                ))}
            </div>
        </div>
    );
};

const TabButton = ({ label, icon: Icon, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${active
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
        >
            <Icon className="mr-2" />
            {label}
        </button>
    );
};

// Dashboard Tab Content
const DashboardContent = () => {
    return (
        <>
            <div className="mb-8">
                <SummaryMetrics />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Denial Trends</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">Last 30 Days</button>
                            <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100">Last Quarter</button>
                            <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100">YTD</button>
                        </div>
                    </div>
                    <DenialTrends />
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Top Payers</h2>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
                    </div>
                    <TopPayers />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
                    </div>
                    <ActionItems />
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
                    </div>
                    <RecentActivity />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <QuickActionToolbar />
            </div>
        </>
    );
};

// Analytics Tab Content
const AnalyticsContent = () => {
    // Mock data for denial analysis
    const denialTypes = [
        { name: 'Medical Necessity', percentage: 35, amount: 520000, change: '+5%' },
        { name: 'Missing Authorization', percentage: 25, amount: 380000, change: '-2%' },
        { name: 'Coding Errors', percentage: 15, amount: 220000, change: '+1%' },
        { name: 'Documentation Issues', percentage: 12, amount: 180000, change: '+3%' },
        { name: 'Eligibility Issues', percentage: 8, amount: 110000, change: '-4%' },
        { name: 'Other', percentage: 5, amount: 70000, change: '0%' }
    ];

    const departments = [
        { name: 'Cardiology', percentage: 28, amount: 420000 },
        { name: 'Orthopedics', percentage: 24, amount: 360000 },
        { name: 'Radiology', percentage: 18, amount: 270000 },
        { name: 'Emergency', percentage: 15, amount: 225000 },
        { name: 'Oncology', percentage: 10, amount: 150000 },
        { name: 'Other', percentage: 5, amount: 75000 }
    ];

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Denial Analysis by Type</h2>
                        <select className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700">
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <div className="space-y-6">
                        {denialTypes.map((type, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">{type.name}</span>
                                        <span className={`ml-2 text-xs ${type.change.startsWith('+') ? 'text-green-500' : type.change.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                                            {type.change}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">${type.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-indigo-600 h-2.5 rounded-full"
                                            style={{ width: `${type.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{type.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Denials by Department</h2>
                        <select className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700">
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <div className="space-y-6">
                        {departments.map((dept, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                                    <span className="text-sm text-gray-500">${dept.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${dept.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{dept.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Appeal Success Rate Trend</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">Weekly</button>
                            <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100">Monthly</button>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-gray-400">Appeal success rate chart would appear here</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Processing Time Analysis</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">By Payer</button>
                            <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100">By Type</button>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-gray-400">Processing time analysis chart would appear here</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h2>
                    <select className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700">
                        <option>Last 30 Days</option>
                        <option>Last Quarter</option>
                        <option>Year to Date</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Average Days to Appeal", value: "8.5 days", change: "-12%", direction: "down" },
                        { label: "Average Response Time", value: "15.3 days", change: "+5%", direction: "up" },
                        { label: "Approval Rate", value: "68%", change: "+2%", direction: "up" },
                        { label: "Revenue Recovered", value: "$845,200", change: "+15%", direction: "up" }
                    ].map((kpi, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">{kpi.label}</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">{kpi.value}</p>
                            <div className="flex items-center mt-2">
                                <span className={`text-xs ${kpi.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {kpi.direction === 'up' ? <FaArrowUp className="inline mr-1" /> : <FaArrowDown className="inline mr-1" />}
                                    {kpi.change}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">vs prior period</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

// Details Tab Content
const DetailsContent = () => {
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Mock data for details view
    const denials = [
        { id: 'DNL-1001', patient: 'John Doe', date: '2023-05-15', amount: 3500, payer: 'UnitedHealthcare', status: 'New', reason: 'Medical Necessity', daysLeft: 12 },
        { id: 'DNL-1002', patient: 'Mary Johnson', date: '2023-05-14', amount: 1800, payer: 'Aetna', status: 'Appealed', reason: 'Missing Authorization', daysLeft: 8 },
        { id: 'DNL-1003', patient: 'Robert Williams', date: '2023-05-12', amount: 5200, payer: 'Blue Cross', status: 'Under Review', reason: 'Coding Error', daysLeft: 15 },
        { id: 'DNL-1004', patient: 'Susan Brown', date: '2023-05-10', amount: 950, payer: 'Cigna', status: 'Appealed', reason: 'Documentation Issue', daysLeft: 7 },
        { id: 'DNL-1005', patient: 'David Miller', date: '2023-05-09', amount: 2750, payer: 'Medicare', status: 'New', reason: 'Eligibility Issue', daysLeft: 18 },
        { id: 'DNL-1006', patient: 'Jennifer Davis', date: '2023-05-08', amount: 1200, payer: 'UnitedHealthcare', status: 'Under Review', reason: 'Medical Necessity', daysLeft: 10 },
        { id: 'DNL-1007', patient: 'Michael Wilson', date: '2023-05-07', amount: 3100, payer: 'Aetna', status: 'New', reason: 'Missing Authorization', daysLeft: 20 },
        { id: 'DNL-1008', patient: 'Lisa Moore', date: '2023-05-06', amount: 4500, payer: 'Blue Cross', status: 'Appealed', reason: 'Coding Error', daysLeft: 5 }
    ];

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) return <FaSort className="inline" />;
        return sortConfig.direction === 'asc' ? <FaSortUp className="inline" /> : <FaSortDown className="inline" />;
    };

    // Filter the data
    const filteredDenials = denials.filter(denial => {
        if (selectedFilter === 'all') return true;
        return denial.status.toLowerCase() === selectedFilter.toLowerCase();
    });

    // Sort the filtered data
    const sortedDenials = [...filteredDenials].sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction;

        if (key === 'date') {
            // Simple string comparison for dates in YYYY-MM-DD format
            return direction === 'asc'
                ? a[key].localeCompare(b[key])
                : b[key].localeCompare(a[key]);
        }

        if (key === 'amount' || key === 'daysLeft') {
            return direction === 'asc'
                ? a[key] - b[key]
                : b[key] - a[key];
        }

        return direction === 'asc'
            ? String(a[key]).localeCompare(String(b[key]))
            : String(b[key]).localeCompare(String(a[key]));
    });

    // Pagination
    const itemsPerPage = 5;
    const totalPages = Math.ceil(sortedDenials.length / itemsPerPage);

    // Adjust current page if it's beyond the total
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    // Get current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedDenials.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFilter]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between mb-6">
                <div className="flex space-x-2 mb-2 sm:mb-0">
                    <button
                        onClick={() => setSelectedFilter('all')}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${selectedFilter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        All Denials
                    </button>
                    <button
                        onClick={() => setSelectedFilter('new')}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${selectedFilter === 'new' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        New
                    </button>
                    <button
                        onClick={() => setSelectedFilter('appealed')}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${selectedFilter === 'appealed' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Appealed
                    </button>
                    <button
                        onClick={() => setSelectedFilter('under review')}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${selectedFilter === 'under review' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Under Review
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <FaFileExport className="inline mr-1" /> Export
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                        <FaFilter className="inline mr-1" /> Advanced Filters
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('id')}>
                                ID {getSortIcon('id')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('patient')}>
                                Patient {getSortIcon('patient')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                                Date {getSortIcon('date')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('amount')}>
                                Amount {getSortIcon('amount')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('payer')}>
                                Payer {getSortIcon('payer')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                                Status {getSortIcon('status')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('reason')}>
                                Reason {getSortIcon('reason')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('daysLeft')}>
                                Days Left {getSortIcon('daysLeft')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((denial) => (
                            <tr key={denial.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{denial.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{denial.patient}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{denial.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${denial.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{denial.payer}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${denial.status === 'New' ? 'bg-yellow-100 text-yellow-800' :
                                            denial.status === 'Appealed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'}`}>
                                        {denial.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{denial.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`${denial.daysLeft <= 7 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                        {denial.daysLeft}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <FaEye className="inline" /> View
                                    </button>
                                    <button className="text-indigo-600 hover:text-indigo-900">
                                        <FaEdit className="inline" /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{sortedDenials.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, sortedDenials.length)}</span> of <span className="font-medium">{sortedDenials.length}</span> denials
                </div>
                <div className="flex space-x-2">
                    <button
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || sortedDenials.length === 0}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || sortedDenials.length === 0}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reports Tab Content
const ReportsContent = () => {
    const reportCategories = [
        {
            name: "Performance Reports",
            reports: [
                { id: 1, name: "Monthly Appeal Success Rate", description: "Analysis of appeal success rates by payer and denial reason", lastRun: "2023-05-01" },
                { id: 2, name: "Denial Trends Report", description: "Analysis of denial trends over time by type, payer, and department", lastRun: "2023-05-15" },
                { id: 3, name: "Revenue Impact Analysis", description: "Financial impact of denials and successful appeals on revenue", lastRun: "2023-05-10" },
            ]
        },
        {
            name: "Operational Reports",
            reports: [
                { id: 4, name: "Aging Denials Report", description: "List of denials approaching appeal deadlines", lastRun: "2023-05-16" },
                { id: 5, name: "Staff Productivity Report", description: "Analysis of team performance on appeal processing", lastRun: "2023-05-15" },
                { id: 6, name: "Appeal Turn Around Time", description: "Analysis of appeal processing times by denial type", lastRun: "2023-05-14" },
            ]
        },
        {
            name: "Compliance Reports",
            reports: [
                { id: 7, name: "Documentation Compliance", description: "Analysis of documentation issues leading to denials", lastRun: "2023-05-12" },
                { id: 8, name: "Regulatory Adherence", description: "Compliance with payer-specific appeal requirements", lastRun: "2023-05-05" },
                { id: 9, name: "Authorization Trends", description: "Analysis of authorization-related denials", lastRun: "2023-05-08" },
            ]
        }
    ];

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Generate Reports</h2>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <FaFileExport className="inline mr-2" /> Create Custom Report
                    </button>
                </div>

                {reportCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-8">
                        <h3 className="text-md font-medium text-gray-700 mb-4">{category.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.reports.map((report) => (
                                <div key={report.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Last run: {report.lastRun}</span>
                                        </div>
                                        <div className="mt-4 flex space-x-2">
                                            <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                                                Run Report
                                            </button>
                                            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">
                                                Schedule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">View All Reports</button>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Report Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Generated On
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Generated By
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Format
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { id: 1, name: "Monthly Appeal Success Rate", date: "2023-05-15 14:30", user: "John Doe", format: "PDF" },
                            { id: 2, name: "Denial Trends Report", date: "2023-05-14 09:15", user: "Jane Smith", format: "Excel" },
                            { id: 3, name: "Revenue Impact Analysis", date: "2023-05-12 16:45", user: "Robert Johnson", format: "PDF" },
                            { id: 4, name: "Aging Denials Report", date: "2023-05-10 11:20", user: "John Doe", format: "Excel" },
                            { id: 5, name: "Staff Productivity Report", date: "2023-05-08 15:10", user: "Jane Smith", format: "PDF" },
                        ].map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.user}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${report.format === 'PDF' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {report.format}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <FaEye className="inline" /> View
                                    </button>
                                    <button className="text-indigo-600 hover:text-indigo-900">
                                        <FaFileExport className="inline" /> Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const DenialOverview = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    // Function to render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return <AnalyticsContent />;
            case 'details':
                return <DetailsContent />;
            case 'reports':
                return <ReportsContent />;
            case 'dashboard':
            default:
                return <DashboardContent />;
        }
    };

    return (
        <div className="px-6 py-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Denial Overview</h1>
                <p className="text-gray-500 mt-1">Overview of denial trends, metrics, and actions</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <TabButton
                        label="Dashboard"
                        icon={FaChartPie}
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <TabButton
                        label="Analytics"
                        icon={FaChartBar}
                        active={activeTab === 'analytics'}
                        onClick={() => setActiveTab('analytics')}
                    />
                    <TabButton
                        label="Details"
                        icon={FaList}
                        active={activeTab === 'details'}
                        onClick={() => setActiveTab('details')}
                    />
                    <TabButton
                        label="Reports"
                        icon={FaFileAlt}
                        active={activeTab === 'reports'}
                        onClick={() => setActiveTab('reports')}
                    />

                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search denials..."
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-64"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700">
                            <FaFilter />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};

export default DenialOverview; 