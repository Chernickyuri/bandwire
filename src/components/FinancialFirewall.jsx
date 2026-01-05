import React from 'react';

export default function FinancialFirewall({ currentLayer, validationStatus }) {
  const layers = [
    {
      id: 'ai',
      name: 'Layer 1: AI Assistant',
      description: 'Natural language dialogue, suggests payment options, provides objection handling scripts',
      status: 'active',
      icon: '🤖',
    },
    {
      id: 'dce',
      name: 'Layer 2: Deterministic Constraint Engine (DCE)',
      description: 'Strictly validates all financial terms against predefined rules. Blocks AI hallucinations and human errors.',
      status: validationStatus || 'pending',
      icon: '🛡️',
    },
    {
      id: 'ledger',
      name: 'Layer 3: The Ledger',
      description: 'Immutable record of all agreements and transactions with full audit trail',
      status: 'active',
      icon: '📚',
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
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-white rounded border border-teal-200">
        <p className="text-xs text-gray-600">
          <strong>Security:</strong> This three-layer architecture ensures AI suggestions are validated by deterministic rules,
          and all actions are recorded in an immutable ledger. No decision can bypass the DCE.
        </p>
      </div>
    </div>
  );
}

