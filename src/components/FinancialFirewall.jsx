import React from 'react';

export default function FinancialFirewall({ currentLayer, validationStatus, validationErrors = [] }) {
  const layers = [
    {
      id: 'ai',
      name: 'Layer 1: AI Assistant',
      description: 'Natural language dialogue, suggests payment options, provides objection handling scripts',
      status: 'active',
      icon: '🤖',
      note: 'AI can suggest values, but cannot modify financial terms directly',
    },
    {
      id: 'dce',
      name: 'Layer 2: Deterministic Constraint Engine (DCE)',
      description: 'Strictly validates all financial terms against predefined rules. Blocks AI hallucinations and human errors.',
      status: validationStatus || 'pending',
      icon: '🛡️',
      note: validationErrors.length > 0 
        ? `${validationErrors.length} validation error(s) detected - values blocked`
        : 'All values validated and approved',
    },
    {
      id: 'ledger',
      name: 'Layer 3: The Ledger',
      description: 'Immutable record of all agreements and transactions with full audit trail',
      status: 'active',
      icon: '📚',
      note: 'All validated transactions are permanently recorded',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Firewall Architecture</h3>
      <div className="space-y-4">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`flex items-start p-4 rounded-lg border-2 transition-all ${
              currentLayer === layer.id
                ? 'border-teal-500 bg-teal-100 shadow-md'
                : layer.status === 'active'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="text-3xl mr-4">{layer.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-800">{layer.name}</h4>
                {layer.status === 'active' && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
                )}
                {layer.status === 'validated' && (
                  <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded-full">Validated</span>
                )}
                {layer.status === 'pending' && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">Pending</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{layer.description}</p>
              {layer.note && (
                <p className={`text-xs mt-2 font-medium ${
                  layer.id === 'dce' && validationErrors.length > 0
                    ? 'text-red-600'
                    : layer.id === 'dce' && validationStatus === 'active'
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}>
                  {layer.id === 'dce' && validationErrors.length > 0 && '⚠️ '}
                  {layer.id === 'dce' && validationStatus === 'active' && validationErrors.length === 0 && '✓ '}
                  {layer.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {validationErrors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
          <p className="text-xs font-semibold text-red-900 mb-2">DCE Validation Blocked:</p>
          <ul className="text-xs text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 p-3 bg-white rounded border border-teal-200">
        <p className="text-xs text-gray-600">
          <strong>Security:</strong> This three-layer architecture ensures AI suggestions are validated by deterministic rules,
          and all actions are recorded in an immutable ledger. No decision can bypass the DCE. The DCE runs server-side validation
          to physically prevent invalid values from being saved.
        </p>
      </div>
    </div>
  );
}

