import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { validatePaymentPlan, autoFixPaymentPlan } from '../utils/rulesEngine';
import { calculateMonthlyPayment, formatCurrency } from '../utils/helpers';

export default function PaymentPlanEditor({ showErrors = true, onValidationChange }) {
  const { state, updateConsultation } = useApp();
  const { consultation, rules } = state;
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
      consultation.totalCost,
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
    setLocalDownPayment(numValue);
    updateConsultation({ downPayment: numValue });
    validate(numValue, localInstallments);
  };

  const handleInstallmentsChange = (value) => {
    const numValue = parseInt(value) || 0;
    setLocalInstallments(numValue);
    updateConsultation({ installments: numValue });
    validate(localDownPayment, numValue);
  };

  const handleFixWithAI = () => {
    const fixed = autoFixPaymentPlan(
      localDownPayment,
      localInstallments,
      consultation.totalCost,
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
    consultation.totalCost,
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
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-red-600">{downPaymentError.message}</p>
            <button
              onClick={handleFixWithAI}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Fix with AI →
            </button>
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
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-red-600">{installmentsError.message}</p>
            <button
              onClick={handleFixWithAI}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Fix with AI →
            </button>
          </div>
        )}
      </div>

      <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Payment:</span>
          <span className="text-2xl font-bold text-teal-600">
            {formatCurrency(monthlyPayment)}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          {formatCurrency(localDownPayment)} down + {localInstallments} payments of {formatCurrency(monthlyPayment)}
        </div>
      </div>
    </div>
  );
}

