import React from 'react';
import { FiShield, FiAlertTriangle, FiServer, FiClock } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useDashboardStore } from '../../store/useDashboardStore';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'red' | 'blue' | 'green' | 'purple';
  loading?: boolean;
}

const colorClasses = {
  red: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    icon: 'text-red-500 dark:text-red-400',
    border: 'border-red-500/20 dark:border-red-500/30',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    icon: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/20 dark:border-blue-500/30',
  },
  green: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    icon: 'text-green-500 dark:text-green-400',
    border: 'border-green-500/20 dark:border-green-500/30',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    icon: 'text-purple-500 dark:text-purple-400',
    border: 'border-purple-500/20 dark:border-purple-500/30',
  },
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, color, loading }) => {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Icon skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${colors.bg} animate-pulse`}></div>
        </div>
        
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3 animate-pulse"></div>
        
        {/* Value skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse"></div>
        
        {/* Trend skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </h3>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium ${
            trend.isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
};

interface DashboardOverviewProps {
  className?: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ className = '' }) => {
  const { data, loading, error, fetchDashboard } = useDashboardStore();

  // Auto-fetch on mount
  React.useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Error state
  if (error && !loading && !data) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                Failed to load dashboard data
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                {error}
              </p>
              <button
                onClick={() => fetchDashboard(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate KPI values from data
  const riskScore = data?.stats?.riskScore ?? 'N/A';
  const openVulns = data?.stats?.openVulnerabilities ?? data?.stats?.totalAudits ?? 0;
  const assetsMonitored = data?.stats?.assetsMonitored ?? data?.stats?.activeAudits ?? 0;
  const lastScan = data?.stats?.lastScanDate 
    ? new Date(data.stats.lastScanDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : data?.recentAudits?.[0]?.createdAt 
      ? new Date(data.recentAudits[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Never';

  const kpiData = [
    {
      title: 'Risk Score',
      value: riskScore,
      icon: FiShield,
      color: 'red' as const,
      trend: {
        value: 12,
        isPositive: false,
      },
    },
    {
      title: 'Open Vulnerabilities',
      value: openVulns,
      icon: FiAlertTriangle,
      color: 'blue' as const,
      trend: {
        value: 8,
        isPositive: false,
      },
    },
    {
      title: 'Assets Monitored',
      value: assetsMonitored,
      icon: FiServer,
      color: 'green' as const,
      trend: {
        value: 15,
        isPositive: true,
      },
    },
    {
      title: 'Last Scan',
      value: lastScan,
      icon: FiClock,
      color: 'purple' as const,
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Security Overview
        </h2>
        {!loading && data && (
          <button
            onClick={() => fetchDashboard(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            title="Refresh data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            trend={kpi.trend}
            loading={loading}
          />
        ))}
      </div>

      {/* Error banner (when there's data but also an error) */}
      {error && data && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Data may be outdated: {error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
