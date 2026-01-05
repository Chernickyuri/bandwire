import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, calculateMonthlyPayment, formatDate } from '../utils/helpers';

export default function CustomerOffer({ onClose }) {
  const { state } = useApp();
  const { consultation, currentPatient } = state;
  const monthly = calculateMonthlyPayment(consultation.totalCost, consultation.downPayment, consultation.installments);
  const totalRemaining = consultation.totalCost - consultation.downPayment;
  const today = new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Offer</h2>
            <p className="text-sm text-gray-600 mt-1">Treatment Plan Proposal</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <div className="mb-4">
              <div className="inline-block px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold mb-3">
                Band & Wire Orthodontics
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Treatment Plan Proposal</h1>
            <p className="text-lg text-gray-600">Prepared for {currentPatient.name}</p>
            <p className="text-sm text-gray-500 mt-2">
              Date: {formatDate(today.toISOString())}
            </p>
          </div>

          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium text-gray-900">{currentPatient.name}</p>
              </div>
              {currentPatient.dob && (
                <div>
                  <span className="text-gray-600">Date of Birth:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentPatient.dob)}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{currentPatient.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium text-gray-900">{currentPatient.phone}</p>
              </div>
              {currentPatient.insurance && (
                <>
                  <div>
                    <span className="text-gray-600">Insurance:</span>
                    <p className="font-medium text-gray-900">{currentPatient.insurance}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Policy ID:</span>
                    <p className="font-medium text-gray-900">{currentPatient.insuranceId || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Treatment Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Overview</h3>
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6 border border-teal-200">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{consultation.treatmentName}</h4>
              <p className="text-gray-700 mb-4">
                This comprehensive treatment plan includes all necessary orthodontic services, 
                regular adjustments, follow-up visits, and ongoing care as determined by our 
                board-certified orthodontists. Treatment duration may vary based on individual 
                patient response and compliance with treatment instructions.
              </p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-teal-600">
                  {formatCurrency(consultation.totalCost)}
                </span>
                <span className="ml-2 text-gray-600">Total Treatment Cost</span>
              </div>
            </div>
          </div>

          {/* Payment Plan Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(consultation.downPayment)}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Initial Down Payment</div>
                <div className="text-xs text-gray-500">
                  {((consultation.downPayment / consultation.totalCost) * 100).toFixed(0)}% of total
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(monthly)}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Monthly Payment</div>
                <div className="text-xs text-gray-500">
                  {consultation.installments} payments
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {consultation.installments}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Payment Duration</div>
                <div className="text-xs text-gray-500">Months</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Remaining Balance:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalRemaining)}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                To be paid in {consultation.installments} monthly installments of {formatCurrency(monthly)}
              </div>
            </div>
          </div>

          {/* Payment Schedule Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                <div className="p-4 bg-teal-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Initial Payment</p>
                      <p className="text-sm text-gray-600">Due upon signing</p>
                    </div>
                    <span className="text-lg font-bold text-teal-600">
                      {formatCurrency(consultation.downPayment)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Monthly Payments</p>
                      <p className="text-sm text-gray-600">
                        {consultation.installments} payments of {formatCurrency(monthly)} each
                      </p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalRemaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <span className="text-green-600 text-xl mr-2">✓</span>
                What's Included
              </h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• All orthodontic appliances and materials</li>
                <li>• Regular adjustment appointments</li>
                <li>• Progress monitoring and X-rays</li>
                <li>• Retainers (if applicable)</li>
                <li>• Post-treatment follow-up care</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="text-blue-600 text-xl mr-2">→</span>
                Next Steps
              </h4>
              <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                <li>Review and sign the treatment agreement</li>
                <li>Complete the initial down payment</li>
                <li>Schedule your first treatment appointment</li>
                <li>Begin your journey to a perfect smile</li>
              </ol>
            </div>
          </div>

          {/* Validation Badge */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">✓</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-lg font-semibold text-teal-900 mb-2">Payment Plan Approved</h4>
                <p className="text-sm text-teal-800 mb-2">
                  This payment plan has been validated by our financial rules engine and meets all 
                  requirements. The plan is designed to be affordable and manageable for your budget.
                </p>
                <p className="text-xs text-teal-700">
                  All terms are subject to the treatment agreement. Monthly payments are due on the 
                  same date each month as the initial payment.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Questions?</strong> Contact us at (630) 320-8888
            </p>
            <p className="text-xs text-gray-500">
              433 E Ogden Ave, Clarendon Hills, IL 60514
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

