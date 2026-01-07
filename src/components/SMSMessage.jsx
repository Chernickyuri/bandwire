import React from 'react';
import { formatDate } from '../utils/helpers';

export default function SMSMessage({ message, patientPhone }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return '✓';
      case 'sent':
        return '→';
      case 'failed':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '→';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'sent':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">SMS Message</p>
            <p className="text-xs text-gray-500">To: {patientPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getStatusColor(message.status)}`}>
            {getStatusIcon(message.status)} {message.status}
          </span>
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded text-xs">
            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-purple-700 font-semibold">Twilio</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(message.date)}</span>
        {message.direction === 'outbound' && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Outbound
          </span>
        )}
        {message.direction === 'inbound' && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Inbound
          </span>
        )}
      </div>

      {message.response && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Patient Response:</p>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-gray-800">{message.response}</p>
          </div>
        </div>
      )}

      {message.status === 'failed' && message.errorMessage && (
        <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-900 mb-1">Delivery Failed</p>
          <p className="text-xs text-red-700">{message.errorMessage}</p>
        </div>
      )}
    </div>
  );
}

