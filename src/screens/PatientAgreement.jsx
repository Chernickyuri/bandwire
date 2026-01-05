import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PDFPreview from '../components/PDFPreview';
import SignatureCanvas from '../components/SignatureCanvas';
import { formatCurrency, calculateMonthlyPayment } from '../utils/helpers';

export default function PatientAgreement() {
  const { state, finalizeAgreement, signAgreement } = useApp();
  const navigate = useNavigate();

  const handleFinalize = () => {
    finalizeAgreement();
  };

  const handleSign = (signatureData) => {
    signAgreement(signatureData);
    navigate('/patient/payment');
  };

  if (!state.agreement.finalized) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Treatment Agreement</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Please review your treatment agreement carefully. Once you're ready, click "I Agree" to proceed with signing.
          </p>

          <PDFPreview />

          <div className="mt-6">
            <button
              onClick={handleFinalize}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
            >
              I Agree - Proceed to Sign
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.agreement.signed) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign Your Agreement</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Please sign below using your mouse or touch screen.
          </p>

          <div className="mb-6">
            <PDFPreview />
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Signature</h2>
            <SignatureCanvas onSign={handleSign} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Success Header */}
        <div className="text-center mb-6 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agreement Signed Successfully</h1>
          <p className="text-gray-600 text-sm">Your treatment agreement has been successfully signed and is now active.</p>
        </div>

        {/* Agreement Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Signed Agreement</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Patient:</span>
                <p className="font-medium text-gray-900">{state.currentPatient?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Treatment:</span>
                <p className="font-medium text-gray-900">{state.consultation.treatmentName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Cost:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(state.consultation.totalCost || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Down Payment:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(state.consultation.downPayment || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Monthly Payment:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(
                    calculateMonthlyPayment(
                      state.consultation.totalCost || 0,
                      state.consultation.downPayment || 0,
                      state.consultation.installments || 0
                    )
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Installments:</span>
                <p className="font-medium text-gray-900">{state.consultation.installments || 0} months</p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agreement Document</h2>
          <PDFPreview />
        </div>

        {/* Signature Display */}
        {state.agreement.signatureData && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Signature</h3>
            <div className="bg-white p-4 rounded border border-gray-300 inline-block">
              <img 
                src={state.agreement.signatureData} 
                alt="Signature" 
                className="max-w-xs h-auto"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/patient/payment')}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            Continue to Payment
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

