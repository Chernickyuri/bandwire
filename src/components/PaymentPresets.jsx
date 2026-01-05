import React from 'react';
import { useApp } from '../context/AppContext';
import { paymentPresets } from '../data/demoData';
import { formatCurrency, calculateMonthlyPayment } from '../utils/helpers';

export default function PaymentPresets({ onSelect }) {
  const { state } = useApp();
  const { totalCost } = state.consultation;

  const handleSelect = (preset) => {
    const downPayment = Math.round(totalCost * (preset.downPaymentPercent / 100));
    onSelect({
      downPayment,
      installments: preset.installments,
    });
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Payment Presets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {paymentPresets.map((preset) => {
          const downPayment = Math.round(totalCost * (preset.downPaymentPercent / 100));
          const monthly = calculateMonthlyPayment(totalCost, downPayment, preset.installments);
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-800 mb-1">{preset.name}</div>
              <div className="text-sm text-gray-600 mb-2">{preset.description}</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(downPayment)} down • {formatCurrency(monthly)}/mo
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

