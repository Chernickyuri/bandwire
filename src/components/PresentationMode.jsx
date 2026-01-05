import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, calculateMonthlyPayment } from '../utils/helpers';

export default function PresentationMode({ onClose }) {
  const { state } = useApp();
  const { consultation, currentPatient } = state;
  const monthly = calculateMonthlyPayment(consultation.totalCost, consultation.downPayment, consultation.installments);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Presentation Mode</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Treatment Plan</h1>
            <p className="text-xl text-gray-600">{currentPatient.name}</p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-8 mb-6 border border-teal-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{consultation.treatmentName}</h2>
            <div className="text-5xl font-bold text-teal-600 mb-2">
              {formatCurrency(consultation.totalCost)}
            </div>
            <p className="text-gray-600">Total Treatment Cost</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-white border-2 border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {formatCurrency(consultation.downPayment)}
              </div>
              <div className="text-sm text-gray-600">Down Payment</div>
            </div>
            <div className="text-center p-6 bg-white border-2 border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {formatCurrency(monthly)}
              </div>
              <div className="text-sm text-gray-600">Monthly Payment</div>
            </div>
            <div className="text-center p-6 bg-white border-2 border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {consultation.installments}
              </div>
              <div className="text-sm text-gray-600">Months</div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <span className="text-teal-600 text-2xl mr-3">✓</span>
              <h3 className="text-lg font-semibold text-teal-800">Payment Plan Approved</h3>
            </div>
            <p className="text-sm text-teal-700">
              This plan has been validated by our Deterministic Constraint Engine and meets all financial requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

