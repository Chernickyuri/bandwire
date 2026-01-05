import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { calculateMonthlyPayment } from '../utils/helpers';

export default function PDFPreview() {
  const { state } = useApp();
  const { currentPatient, consultation } = state;
  const monthlyPayment = calculateMonthlyPayment(
    consultation.totalCost,
    consultation.downPayment,
    consultation.installments
  );
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-lg" style={{ minHeight: '800px' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ORTHODONTIC TREATMENT AGREEMENT</h1>
          <div className="mt-4">
            <p className="text-xl font-semibold text-blue-600">Band & Wire Orthodontics</p>
            <p className="text-sm text-gray-600 mt-1">433 E Ogden Ave, Clarendon Hills, IL 60514</p>
            <p className="text-sm text-gray-600">Phone: (630) 320-8888</p>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Patient Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Patient Name:</span>
                <p className="text-gray-900">{currentPatient.name}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Date of Birth:</span>
                <p className="text-gray-900">{currentPatient.dob ? formatDate(currentPatient.dob) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Email:</span>
                <p className="text-gray-900">{currentPatient.email}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Phone:</span>
                <p className="text-gray-900">{currentPatient.phone}</p>
              </div>
              {currentPatient.insurance && (
                <>
                  <div>
                    <span className="font-semibold text-gray-700">Insurance:</span>
                    <p className="text-gray-900">{currentPatient.insurance}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Policy ID:</span>
                    <p className="text-gray-900">{currentPatient.insuranceId || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Treatment Plan</h2>
          <div className="border-l-4 border-blue-600 pl-4 py-2">
            <p className="text-lg font-semibold text-gray-900 mb-2">{consultation.treatmentName}</p>
            <p className="text-gray-700">
              This treatment plan includes all necessary orthodontic services, adjustments, and follow-up visits 
              as determined by our board-certified orthodontists. Treatment duration may vary based on individual 
              patient response and compliance with treatment instructions.
            </p>
          </div>
        </div>

        {/* Financial Agreement */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Financial Agreement</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Total Treatment Fee:</span>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(consultation.totalCost)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Agreement Date:</span>
                <p className="text-lg text-gray-900">{formattedDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Schedule</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Initial Down Payment:</span>
                <span className="font-bold text-gray-900">{formatCurrency(consultation.downPayment)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Monthly Payment Amount:</span>
                <span className="font-bold text-gray-900">{formatCurrency(monthlyPayment)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Number of Monthly Payments:</span>
                <span className="font-bold text-gray-900">{consultation.installments} months</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-blue-50 -mx-4 px-4 py-3 mt-2">
                <span className="font-semibold text-gray-900">Remaining Balance:</span>
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(consultation.totalCost - consultation.downPayment)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Terms and Conditions</h2>
          <div className="text-xs text-gray-700 space-y-3 leading-relaxed">
            <p>
              <strong>1. Payment Obligations:</strong> I understand that payment is due according to the schedule outlined above. 
              Monthly payments are due on the same day each month as the initial payment date. Late payments may incur a 
              service charge as permitted by law.
            </p>
            <p>
              <strong>2. Treatment Continuity:</strong> I understand that failure to make scheduled payments may result in 
              suspension of treatment until payment arrangements are made. Treatment will resume once payment obligations 
              are current.
            </p>
            <p>
              <strong>3. Insurance:</strong> If applicable, I understand that insurance benefits are estimated and not guaranteed. 
              I am responsible for any portion not covered by insurance. I authorize Band & Wire Orthodontics to submit claims 
              to my insurance company on my behalf.
            </p>
            <p>
              <strong>4. Treatment Duration:</strong> The estimated treatment time is approximate and may vary based on 
              patient compliance, oral hygiene, and individual response to treatment. I understand that additional fees may 
              apply if treatment extends beyond the estimated completion date.
            </p>
            <p>
              <strong>5. Patient Responsibilities:</strong> I agree to follow all treatment instructions, maintain good oral 
              hygiene, attend all scheduled appointments, and wear appliances as directed. Failure to comply may result in 
              extended treatment time and additional fees.
            </p>
            <p>
              <strong>6. Refund Policy:</strong> In the event of early termination of treatment, refunds will be calculated 
              based on services rendered and materials used. No refunds will be issued for completed treatment phases.
            </p>
            <p>
              <strong>7. HIPAA Compliance:</strong> I acknowledge that Band & Wire Orthodontics maintains strict compliance 
              with HIPAA regulations regarding the protection of my health information.
            </p>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            <strong>ACKNOWLEDGMENT:</strong> I have read and understand the terms and conditions of this agreement. 
            I acknowledge that I have been given the opportunity to ask questions, and all my questions have been answered 
            to my satisfaction. I understand that this agreement constitutes a legally binding contract.
          </p>
        </div>

        {/* Signature Section */}
        <div className="mt-12 border-t-2 border-gray-300 pt-6">
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Patient/Parent/Guardian Signature:</p>
              <div className="h-24 border-b-2 border-gray-400"></div>
              <p className="text-xs text-gray-500 mt-1">(Required for patients under 18)</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Date:</p>
              <div className="h-12 border-b-2 border-gray-400"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Print Name:</p>
              <div className="h-12 border-b border-gray-300"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Relationship to Patient:</p>
              <div className="h-12 border-b border-gray-300"></div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Band & Wire Orthodontics Authorized Representative:</p>
            <div className="h-12 border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-gray-500">Dr. Ramzi Daibis or Dr. Tamara Oweis</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>This agreement is subject to the laws of the State of Illinois.</p>
          <p className="mt-1">Band & Wire Orthodontics • 433 E Ogden Ave, Clarendon Hills, IL 60514 • (630) 320-8888</p>
        </div>
      </div>
    </div>
  );
}

