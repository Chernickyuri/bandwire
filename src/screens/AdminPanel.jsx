import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import FinancialFirewall from '../components/FinancialFirewall';
import CSVImport from '../components/CSVImport';
import IntegrationStatus from '../components/IntegrationStatus';
import { paymentPresets as initialPaymentPresets } from '../data/demoData';

export default function AdminPanel() {
  const { state, updateRules } = useApp();
  const [minDownPayment, setMinDownPayment] = useState(state.rules.minDownPayment);
  const [maxInstallments, setMaxInstallments] = useState(state.rules.maxInstallmentMonths);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(state.rules.maxDiscountPercent || 10);
  const [minMonthlyPayment, setMinMonthlyPayment] = useState(state.rules.minMonthlyPayment || 100);
  const [paymentPresets, setPaymentPresets] = useState(initialPaymentPresets);
  const [editingPreset, setEditingPreset] = useState(null);

  const handleSaveRules = () => {
    if (minDownPayment < 0 || maxInstallments < 1) {
      return;
    }
    updateRules({
      minDownPayment: parseFloat(minDownPayment),
      maxInstallmentMonths: parseInt(maxInstallments),
      maxDiscountPercent: parseFloat(maxDiscountPercent),
      minMonthlyPayment: parseFloat(minMonthlyPayment),
    });
  };

  const handleSavePreset = (presetId, updates) => {
    setPaymentPresets(presets =>
      presets.map(p => p.id === presetId ? { ...p, ...updates } : p)
    );
    setEditingPreset(null);
  };

  const handleDeletePreset = (presetId) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      setPaymentPresets(presets => presets.filter(p => p.id !== presetId));
    }
  };

  const handleAddPreset = () => {
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: 'New Preset',
      downPaymentPercent: 15,
      installments: 12,
      description: 'Custom payment plan',
    };
    setPaymentPresets([...paymentPresets, newPreset]);
    setEditingPreset(newPreset.id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* DCE Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <FinancialFirewall currentLayer="dce" validationStatus="active" />

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Deterministic Constraint Engine (DCE)</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Configure the Deterministic Constraint Engine (DCE) rules. These rules are enforced automatically and cannot be bypassed.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Down Payment ($)
              </label>
              <input
                type="number"
                value={minDownPayment}
                onChange={(e) => setMinDownPayment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Installment Months
              </label>
              <input
                type="number"
                value={maxInstallments}
                onChange={(e) => setMaxInstallments(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                min="1"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state.rules.allowZeroDownPayment}
                  disabled
                  className="mr-2 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-700">Allow zero down payment</span>
                <span className="ml-2 text-sm text-gray-500">(Disabled - Policy Restriction)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Percent
              </label>
              <input
                type="number"
                value={maxDiscountPercent}
                onChange={(e) => setMaxDiscountPercent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                min="0"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum discount that can be applied to treatment cost</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Monthly Payment ($)
              </label>
              <input
                type="number"
                value={minMonthlyPayment}
                onChange={(e) => setMinMonthlyPayment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum monthly payment amount required</p>
            </div>

            <button
              onClick={handleSaveRules}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
            >
              Save DCE Configuration
            </button>

            <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-teal-800">
                <strong>Note:</strong> Rules apply instantly to all new consultations and payment plans.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Payment Presets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Payment Presets</h2>
            <p className="text-gray-600 mt-1 text-sm">
              Configure preset payment plans that appear in the Deal Configurator
            </p>
          </div>
          <button
            onClick={handleAddPreset}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
          >
            + Add Preset
          </button>
        </div>

        <div className="space-y-4">
          {paymentPresets.map((preset) => {
            const isEditing = editingPreset === preset.id;
            return (
              <div
                key={preset.id}
                className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preset Name</label>
                      <input
                        type="text"
                        defaultValue={preset.name}
                        onBlur={(e) => handleSavePreset(preset.id, { name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment %</label>
                        <input
                          type="number"
                          defaultValue={preset.downPaymentPercent}
                          onBlur={(e) => handleSavePreset(preset.id, { downPaymentPercent: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Installments</label>
                        <input
                          type="number"
                          defaultValue={preset.installments}
                          onBlur={(e) => handleSavePreset(preset.id, { installments: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          min="1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        defaultValue={preset.description}
                        onBlur={(e) => handleSavePreset(preset.id, { description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPreset(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{preset.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {preset.downPaymentPercent}% down • {preset.installments} months
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{preset.description}</p>
                    </div>
                    <button
                      onClick={() => setEditingPreset(preset.id)}
                      className="ml-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {paymentPresets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No payment presets configured. Click "Add Preset" to create one.</p>
          </div>
        )}
      </div>

      {/* CSV Import Section */}
      <CSVImport />

      {/* Integration Status Section */}
      <IntegrationStatus />
    </div>
  );
}

