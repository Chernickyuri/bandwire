import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { patientPaymentHistory } from '../data/demoData';

export default function PatientHistory() {
  const { state } = useApp();

  // Combine demo payment history with any completed payment from current session
  const payments = useMemo(() => {
    const allPayments = [...patientPaymentHistory];
    
    // Add current session payment if completed
    if (state.payment.completed) {
      allPayments.unshift({
        id: 'CURRENT',
        date: new Date().toISOString(),
        amount: state.consultation.downPayment,
        type: 'Down Payment',
        status: 'Completed',
        transactionId: state.payment.transactionId || 'TXN-CURRENT',
        method: state.payment.method || 'Credit Card',
        cardLast4: state.payment.cardLast4 || '4242',
      });
    }
    
    // Sort by date (newest first)
    return allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [state.payment.completed, state.consultation.downPayment, state.payment.transactionId, state.payment.method, state.payment.cardLast4]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-1 text-sm">View your payment transactions and history</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {payments.length > 0 ? (
          <>
            {/* Payment Summary */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-teal-600">
                  {formatCurrency(payments.reduce((sum, p) => sum + (p.status === 'Completed' ? p.amount : 0), 0))}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Completed Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'Completed').length}
                </p>
              </div>
            </div>

            {/* Payment List */}
            <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{payment.type}</h3>
                    <p className="text-sm text-gray-600">{formatDate(payment.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-teal-600">{formatCurrency(payment.amount)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{payment.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.method}
                      {payment.cardLast4 && (
                        <span className="ml-2 text-gray-500">•••• {payment.cardLast4}</span>
                      )}
                      {payment.bankAccount && (
                        <span className="ml-2 text-gray-500">{payment.bankAccount}</span>
                      )}
                    </p>
                  </div>
                </div>
                {payment.status === 'Completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                      Download Receipt
                    </button>
                  </div>
                )}
              </div>
            ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No payment history available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

