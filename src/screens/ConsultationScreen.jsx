import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PatientSelector from '../components/PatientSelector';
import PaymentPlanEditor from '../components/PaymentPlanEditor';
import PaymentPresets from '../components/PaymentPresets';
import DealSpeedTracker from '../components/DealSpeedTracker';
import CustomerOffer from '../components/CustomerOffer';
import AIResponseCard from '../components/AIResponseCard';
import { formatCurrency } from '../utils/helpers';
import { validatePaymentPlan, autoFixPaymentPlan } from '../utils/rulesEngine';
import { getObjectionSuggestion } from '../utils/mockAI';
import { treatmentOptions } from '../data/demoData';

export default function ConsultationScreen() {
  const { state, updateConsultation, applyAISuggestion } = useApp();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState([]);
  const [dceValidated, setDceValidated] = useState(false);
  const [showCustomerOffer, setShowCustomerOffer] = useState(false);
  const [objection, setObjection] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAISection, setShowAISection] = useState(false);

  // Auto-validate DCE when payment plan changes
  useEffect(() => {
    const errors = validatePaymentPlan(
      state.consultation.downPayment,
      state.consultation.installments,
      state.consultation.totalCost,
      state.rules
    );
    setValidationErrors(errors);
    setDceValidated(errors.length === 0);
  }, [state.consultation.downPayment, state.consultation.installments, state.consultation.totalCost, state.rules]);

  const handleTreatmentChange = (e) => {
    const selectedTreatment = treatmentOptions.find(t => t.id === e.target.value);
    if (selectedTreatment) {
      updateConsultation({ 
        treatmentName: selectedTreatment.name,
        totalCost: selectedTreatment.typicalCost,
      });
    }
  };

  const handleTotalCostChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    updateConsultation({ totalCost: value });
  };

  const handlePresetSelect = (preset) => {
    updateConsultation(preset);
  };

  const [aiValidationErrors, setAiValidationErrors] = useState([]);
  const [aiSuggestionValid, setAiSuggestionValid] = useState(true);

  const handleGetAISuggestion = () => {
    if (!objection.trim()) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const aiSuggestion = getObjectionSuggestion(objection, state.consultation);
      
      // Validate AI suggestion against DCE rules
      const validationErrors = validatePaymentPlan(
        aiSuggestion.suggestedChanges.downPayment,
        aiSuggestion.suggestedChanges.installments,
        state.consultation.totalCost,
        state.rules
      );
      
      setAiValidationErrors(validationErrors);
      setAiSuggestionValid(validationErrors.length === 0);
      
      // If suggestion violates DCE rules, auto-fix it
      if (validationErrors.length > 0) {
        // Save original suggestion before fixing
        const originalDownPayment = aiSuggestion.suggestedChanges.downPayment;
        const originalInstallments = aiSuggestion.suggestedChanges.installments;
        
        const fixed = autoFixPaymentPlan(
          originalDownPayment,
          originalInstallments,
          state.consultation.totalCost,
          state.rules
        );
        
        // Update suggestion with fixed values
        aiSuggestion.suggestedChanges = fixed;
        aiSuggestion.dceAutoFixed = true;
        aiSuggestion.originalSuggestion = {
          downPayment: originalDownPayment,
          installments: originalInstallments,
        };
        
        // Re-validate after auto-fix
        const fixedErrors = validatePaymentPlan(
          fixed.downPayment,
          fixed.installments,
          state.consultation.totalCost,
          state.rules
        );
        setAiValidationErrors(fixedErrors);
        setAiSuggestionValid(fixedErrors.length === 0);
      }
      
      setSuggestion(aiSuggestion);
      setLoading(false);
    }, 1500);
  };

  const handleApplySuggestion = () => {
    if (suggestion && aiSuggestionValid) {
      applyAISuggestion(suggestion);
      setSuggestion(null);
      setObjection('');
      setShowAISection(false);
      setAiValidationErrors([]);
      setAiSuggestionValid(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Configurator</h1>
            <p className="text-gray-600 mt-1 text-sm">Configure treatment plan and payment options for patient consultation</p>
          </div>
          <DealSpeedTracker />
        </div>

        <PatientSelector />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Name
            </label>
            <select
              value={treatmentOptions.find(t => t.name === state.consultation.treatmentName)?.id || ''}
              onChange={handleTreatmentChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white"
            >
              <option value="">Select a treatment...</option>
              {treatmentOptions.map(treatment => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name}
                </option>
              ))}
            </select>
            {treatmentOptions.find(t => t.name === state.consultation.treatmentName) && (
              <p className="mt-1 text-xs text-gray-500">
                {treatmentOptions.find(t => t.name === state.consultation.treatmentName)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Cost
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={state.consultation.totalCost}
                onChange={handleTotalCostChange}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>
        </div>

        <PaymentPresets onSelect={handlePresetSelect} />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Plan Configuration</h2>
          <PaymentPlanEditor
            showErrors={true}
            onValidationChange={(errors) => {
              setValidationErrors(errors);
              setDceValidated(errors.length === 0);
            }}
          />
        </div>

        {/* DCE Validation Status */}
        <div className="mb-6">
          {dceValidated ? (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-teal-900">DCE Validation Passed</p>
                  <p className="text-sm text-teal-700 mt-1">
                    Payment plan meets all financial constraints. All rules validated:
                  </p>
                  <ul className="text-xs text-teal-700 mt-2 space-y-1">
                    <li>✓ Minimum down payment: {formatCurrency(state.rules.minDownPayment)}</li>
                    <li>✓ Maximum installments: {state.rules.maxInstallmentMonths} months</li>
                    <li>✓ Down payment within limits</li>
                    <li>✓ Installment duration valid</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">✗</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-red-900">DCE Validation Failed</p>
                  <p className="text-sm text-red-700 mt-1">
                    Payment plan does not meet financial constraints. Please fix the following issues:
                  </p>
                  <ul className="text-xs text-red-700 mt-2 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>✗ {error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Section */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
              <p className="text-sm text-gray-600 mt-1">Get intelligent suggestions for handling patient objections</p>
            </div>
            {!showAISection && (
              <button
                onClick={() => setShowAISection(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Open AI Assistant
              </button>
            )}
          </div>

          {showAISection && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Concern or Objection
                </label>
                <textarea
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  placeholder="Enter the patient's concern or objection (e.g., 'This is too expensive, I can't afford it right now')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleGetAISuggestion}
                  disabled={loading || !objection.trim() || !dceValidated}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors text-sm ${
                    loading || !objection.trim() || !dceValidated
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Get AI Suggestion'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAISection(false);
                    setObjection('');
                    setSuggestion(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>

              {!dceValidated && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please fix DCE validation errors before using AI Assistant
                  </p>
                </div>
              )}

              {suggestion && (
                <>
                  {/* DCE Validation for AI Suggestion */}
                  {!aiSuggestionValid ? (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-bold">⚠</span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-semibold text-red-900 mb-1">AI Suggestion Violates DCE Rules</p>
                          <p className="text-sm text-red-700 mb-2">
                            The AI's suggestion does not comply with financial constraints. Please review the errors:
                          </p>
                          <ul className="text-xs text-red-700 space-y-1 mb-2">
                            {aiValidationErrors.map((error, index) => (
                              <li key={index}>✗ {error.message}</li>
                            ))}
                          </ul>
                          {suggestion.dceAutoFixed && (
                            <p className="text-xs text-red-600 mt-2">
                              ⚠️ The suggestion has been automatically adjusted to comply with DCE rules.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : suggestion.dceAutoFixed ? (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-bold">ℹ</span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-semibold text-yellow-900 mb-1">AI Suggestion Auto-Adjusted</p>
                          <p className="text-sm text-yellow-700">
                            The AI's original suggestion was adjusted to comply with DCE rules. The values have been corrected to meet financial constraints.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-bold">✓</span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-semibold text-green-900">AI Suggestion Validated</p>
                          <p className="text-sm text-green-700">
                            The AI's suggestion complies with all DCE rules and is ready to apply.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <AIResponseCard 
                    suggestion={suggestion} 
                    onApply={handleApplySuggestion}
                    canApply={aiSuggestionValid}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setShowCustomerOffer(true)}
            disabled={validationErrors.length > 0}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors shadow-sm ${
              validationErrors.length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            View Customer Offer
          </button>
          <button
            onClick={() => navigate('/agreement', { state: { fromDealConfigurator: true } })}
            disabled={validationErrors.length > 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors border-2 ${
              validationErrors.length > 0
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            Proceed to Agreement
          </button>
        </div>
      </div>
      {showCustomerOffer && (
        <CustomerOffer onClose={() => setShowCustomerOffer(false)} />
      )}
    </>
  );
}

