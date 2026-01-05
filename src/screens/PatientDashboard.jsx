import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, calculateMonthlyPayment } from '../utils/helpers';

export default function PatientDashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { currentPatient, consultation } = state;
  const monthlyPayment = calculateMonthlyPayment(
    consultation.totalCost,
    consultation.downPayment,
    consultation.installments
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Treatment Plan</h1>
        <p className="text-gray-600 mt-1 text-sm">Welcome, {currentPatient.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Treatment Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Treatment Type</p>
              <p className="text-base font-medium text-gray-900">{consultation.treatmentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-teal-600">{formatCurrency(consultation.totalCost)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Plan</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Down Payment</span>
              <span className="text-base font-medium text-gray-900">{formatCurrency(consultation.downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Payment</span>
              <span className="text-base font-medium text-gray-900">{formatCurrency(monthlyPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="text-base font-medium text-gray-900">{consultation.installments} months</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Remaining Balance</span>
                <span className="text-lg font-bold text-teal-600">
                  {formatCurrency(consultation.totalCost - consultation.downPayment)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
        <div className="space-y-3">
          {!state.agreement.signed && (
            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">Sign Treatment Agreement</p>
                <p className="text-sm text-gray-600">Review and sign your treatment agreement to proceed</p>
              </div>
            </div>
          )}
          {state.agreement.signed && !state.payment.completed && (
            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">Complete Payment</p>
                <p className="text-sm text-gray-600">Pay your down payment to begin treatment</p>
              </div>
            </div>
          )}
          {state.payment.completed && (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">Treatment Scheduled</p>
                <p className="text-sm text-gray-600">Your treatment plan is active. We'll contact you soon to schedule your first appointment.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Clinic */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Need Help?</h2>
            <p className="text-sm text-gray-600">Chat with our treatment coordinator for any questions</p>
          </div>
          <button
            onClick={() => navigate('/patient/chat')}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact Clinic
          </button>
        </div>
      </div>
    </div>
  );
}

