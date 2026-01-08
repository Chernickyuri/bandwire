import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { calculateMonthlyPayment } from '../utils/helpers';
import { downloadAgreementPDF } from '../utils/pdfGenerator';

export default function PDFPreview() {
  const { state } = useApp();
  const { currentPatient, consultation } = state;
  const [isGenerating, setIsGenerating] = useState(false);
  // Calculate patient's out-of-pocket cost (after insurance)
  const patientCost = consultation.totalCost - (consultation.insuranceCoverage || 0);
  const monthlyPayment = calculateMonthlyPayment(
    patientCost,
    consultation.downPayment,
    consultation.installments
  );
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await downloadAgreementPDF(currentPatient, consultation);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-lg" style={{ minHeight: '800px' }}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>
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
          <div className="border-l-4 border-blue-600 pl-4 py-2 mb-4">
            <p className="text-lg font-semibold text-gray-900 mb-2">{consultation.treatmentName}</p>
            <p className="text-gray-700">
              This treatment plan includes all necessary orthodontic services, adjustments, and follow-up visits 
              as determined by our board-certified orthodontists. Treatment duration may vary based on individual 
              patient response and compliance with treatment instructions.
            </p>
          </div>

          {/* Treatment Breakdown */}
          {consultation.breakdown && consultation.breakdown.length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Treatment Breakdown</h3>
              
              {/* Services */}
              {consultation.breakdown.filter(item => item.type === 'service').length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-blue-700 mb-2">Services</h4>
                  <div className="space-y-1">
                    {consultation.breakdown.filter(item => item.type === 'service').map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-200">
                        <span className="text-gray-700">{item.name} (Qty: {item.quantity})</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.total || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {consultation.breakdown.filter(item => item.type === 'material').length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-green-700 mb-2">Materials</h4>
                  <div className="space-y-1">
                    {consultation.breakdown.filter(item => item.type === 'material').map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-200">
                        <span className="text-gray-700">{item.name} (Qty: {item.quantity})</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.total || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-teal-600">
                  {formatCurrency(consultation.breakdown.reduce((sum, item) => sum + (item.total || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Financial Agreement */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Financial Agreement</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-semibold text-gray-700">Total Treatment Fee:</span>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(consultation.totalCost)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Agreement Date:</span>
                <p className="text-lg text-gray-900">{formattedDate}</p>
              </div>
            </div>
            {consultation.insuranceCoverage > 0 && (
              <div className="pt-4 border-t border-blue-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">Insurance Coverage:</span>
                  <span className="text-lg font-bold text-blue-600">-{formatCurrency(consultation.insuranceCoverage)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                  <span className="font-semibold text-gray-900">Patient's Out-of-Pocket Cost:</span>
                  <span className="text-2xl font-bold text-teal-600">{formatCurrency(patientCost)}</span>
                </div>
              </div>
            )}
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
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(patientCost - consultation.downPayment)}</span>
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

