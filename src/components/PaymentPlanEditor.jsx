import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { validatePaymentPlan, autoFixPaymentPlan } from '../utils/rulesEngine';
import { calculateMonthlyPayment, formatCurrency } from '../utils/helpers';

export default function PaymentPlanEditor({ showErrors = true, onValidationChange }) {
  const { state, updateConsultation } = useApp();
  const { consultation, rules } = state;
  // Calculate patient's out-of-pocket cost (after insurance)
  const patientCost = consultation.totalCost - (consultation.insuranceCoverage || 0);
  const [errors, setErrors] = useState([]);
  const [localDownPayment, setLocalDownPayment] = useState(consultation.downPayment);
  const [localInstallments, setLocalInstallments] = useState(consultation.installments);

  useEffect(() => {
    setLocalDownPayment(consultation.downPayment);
    setLocalInstallments(consultation.installments);
  }, [consultation]);

  const validate = (downPayment, installments) => {
    const validationErrors = validatePaymentPlan(
      downPayment,
      installments,
      patientCost, // Use patient cost (after insurance) for validation
      rules
    );
    setErrors(validationErrors);
    if (onValidationChange) {
      onValidationChange(validationErrors);
    }
    return validationErrors.length === 0;
  };

  const handleDownPaymentChange = (value) => {
    const numValue = parseFloat(value) || 0;
    const validationErrors = validatePaymentPlan(
      numValue,
      localInstallments,
      patientCost, // Use patient cost (after insurance) for validation
      rules
    );
    
    // Block invalid values - don't update if it violates rules
    const downPaymentError = validationErrors.find(e => e.field === 'downPayment');
    if (downPaymentError && numValue !== 0) {
      // Show error but allow user to see what they tried to enter
      setLocalDownPayment(numValue);
      setErrors(validationErrors);
      if (onValidationChange) {
        onValidationChange(validationErrors);
      }
      return; // Block the update
    }
    
    setLocalDownPayment(numValue);
    updateConsultation({ downPayment: numValue });
    validate(numValue, localInstallments);
  };

  const handleInstallmentsChange = (value) => {
    const numValue = parseInt(value) || 0;
    const validationErrors = validatePaymentPlan(
      localDownPayment,
      numValue,
      patientCost, // Use patient cost (after insurance) for validation
      rules
    );
    
    // Block invalid values - don't update if it violates rules
    const installmentsError = validationErrors.find(e => e.field === 'installments');
    if (installmentsError && numValue > 0) {
      // Show error but allow user to see what they tried to enter
      setLocalInstallments(numValue);
      setErrors(validationErrors);
      if (onValidationChange) {
        onValidationChange(validationErrors);
      }
      return; // Block the update
    }
    
    setLocalInstallments(numValue);
    updateConsultation({ installments: numValue });
    validate(localDownPayment, numValue);
  };

  const handleFixWithAI = () => {
    const fixed = autoFixPaymentPlan(
      localDownPayment,
      localInstallments,
      patientCost, // Use patient cost (after insurance) for auto-fix
      rules
    );
    setLocalDownPayment(fixed.downPayment);
    setLocalInstallments(fixed.installments);
    updateConsultation({
      downPayment: fixed.downPayment,
      installments: fixed.installments,
    });
    validate(fixed.downPayment, fixed.installments);
  };

  const monthlyPayment = calculateMonthlyPayment(
    patientCost, // Use patient cost (after insurance) for monthly payment calculation
    localDownPayment,
    localInstallments
  );

  const downPaymentError = errors.find(e => e.field === 'downPayment');
  const installmentsError = errors.find(e => e.field === 'installments');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Down Payment
        </label>
        <input
          type="number"
          value={localDownPayment}
          onChange={(e) => handleDownPaymentChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
            downPaymentError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {showErrors && downPaymentError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-semibold text-red-900">DCE Validation Blocked</p>
                </div>
                <p className="text-sm text-red-700">{downPaymentError.message}</p>
                <p className="text-xs text-red-600 mt-1">This value cannot be saved. Server-side validation prevents invalid entries.</p>
              </div>
              <button
                onClick={handleFixWithAI}
                className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
              >
                Auto-Fix →
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Installments (months)
        </label>
        <input
          type="number"
          value={localInstallments}
          onChange={(e) => handleInstallmentsChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
            installmentsError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {showErrors && installmentsError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-semibold text-red-900">DCE Validation Blocked</p>
                </div>
                <p className="text-sm text-red-700">{installmentsError.message}</p>
                <p className="text-xs text-red-600 mt-1">This value cannot be saved. Server-side validation prevents invalid entries.</p>
              </div>
              <button
                onClick={handleFixWithAI}
                className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
              >
                Auto-Fix →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 rounded-lg border-2 ${
        errors.length === 0 
          ? 'bg-teal-50 border-teal-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Payment:</span>
          <span className={`text-2xl font-bold ${
            errors.length === 0 ? 'text-teal-600' : 'text-red-600'
          }`}>
            {formatCurrency(monthlyPayment)}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          {formatCurrency(localDownPayment)} down + {localInstallments} payments of {formatCurrency(monthlyPayment)}
        </div>
        {errors.length === 0 && (
          <div className="mt-2 flex items-center text-xs text-teal-700">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            DCE Validated - Ready to proceed
          </div>
        )}
      </div>
    </div>
  );
}

