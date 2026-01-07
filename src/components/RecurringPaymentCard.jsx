import React from 'react';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function RecurringPaymentCard({ payment }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{payment.patientName}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(payment.status)}`}>
              {payment.status === 'active' ? '✓ Active' : payment.status === 'paused' ? '⏸ Paused' : '✗ Cancelled'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">Agreement: {payment.agreementId}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-teal-600">{formatCurrency(payment.amount)}</div>
          <div className="text-xs text-gray-500">per {payment.frequency}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Next Payment:</span>
          <p className="font-semibold text-gray-900">{formatDate(payment.nextPaymentDate)}</p>
        </div>
        <div>
          <span className="text-gray-600">Payment Method:</span>
          <p className="font-semibold text-gray-900">
            {payment.paymentMethod === 'Credit Card' ? '💳' : '🏦'} {payment.paymentMethod}
            {payment.cardLast4 && ` •••• ${payment.cardLast4}`}
            {payment.bankAccount && ` ${payment.bankAccount}`}
          </p>
        </div>
        <div>
          <span className="text-gray-600">Progress:</span>
          <p className="font-semibold text-gray-900">
            {payment.totalPayments - payment.paymentsRemaining} / {payment.totalPayments} payments
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all"
              style={{ width: `${((payment.totalPayments - payment.paymentsRemaining) / payment.totalPayments) * 100}%` }}
            ></div>
          </div>
        </div>
        <div>
          <span className="text-gray-600">Stripe Subscription:</span>
          <p className="font-mono text-xs text-gray-600">{payment.stripeSubscriptionId}</p>
        </div>
      </div>

      {payment.status === 'paused' && payment.pauseReason && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Paused:</strong> {payment.pauseReason}
          </p>
        </div>
      )}

      {payment.status === 'active' && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Auto-debit enabled via Stripe Subscriptions</span>
        </div>
      )}
    </div>
  );
}

