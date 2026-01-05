import React from 'react';
import MetricsCard from '../components/MetricsCard';
import { analyticsData } from '../data/demoData';
import { formatCurrency } from '../utils/helpers';

export default function AnalyticsDashboard() {
  const conversionRate = (analyticsData.conversionsToday.completed / analyticsData.conversionsToday.total) * 100;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm">Track key performance metrics and business insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Conversion Rate"
            value={`${analyticsData.conversionRate}%`}
            subtitle={`${analyticsData.conversionsToday.completed} / ${analyticsData.conversionsToday.total} today`}
            icon="📊"
            color="blue"
          />
          <MetricsCard
            title="Payment Success"
            value={`${analyticsData.paymentSuccess}%`}
            subtitle="All payments processed"
            icon="✓"
            color="green"
          />
          <MetricsCard
            title="Avg Deal Speed"
            value={`${analyticsData.avgDealSpeed} min`}
            subtitle="Time to signature"
            icon="⚡"
            color="purple"
          />
          <MetricsCard
            title="Monthly Revenue"
            value={formatCurrency(analyticsData.monthlyRevenueForecast)}
            subtitle={`${analyticsData.contractsThisMonth} contracts`}
            icon="💰"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Drop-off Rate"
            value={`${analyticsData.dropOffRate}%`}
            subtitle="Abandoned cases"
            icon="📉"
            color="red"
          />
          <MetricsCard
            title="Time Savings"
            value={`${analyticsData.timeSavings}%`}
            subtitle="Reduced admin work"
            icon="⏰"
            color="green"
          />
          <MetricsCard
            title="NPS Score"
            value={analyticsData.nps}
            subtitle="Patient satisfaction"
            icon="⭐"
            color="yellow"
          />
          <MetricsCard
            title="Total Revenue"
            value={formatCurrency(analyticsData.totalRevenue)}
            subtitle="This month"
            icon="💵"
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-teal-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${conversionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {analyticsData.conversionsToday.completed} of {analyticsData.conversionsToday.total} consultations converted today
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Target: 50% | Current: {conversionRate.toFixed(0)}% | Gap: {Math.max(0, 50 - conversionRate).toFixed(0)}%
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ROI Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Growth:</span>
                <span className="text-sm font-semibold text-green-600">+12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Deal Speed:</span>
                <span className="text-sm font-semibold text-blue-600">&lt; 5 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Collection Speed:</span>
                <span className="text-sm font-semibold text-green-600">95% in 24h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Compliance:</span>
                <span className="text-sm font-semibold text-green-600">0 incidents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

