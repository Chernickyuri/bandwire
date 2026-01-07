import React from 'react';

export default function HIPAAIndicator({ showDetails = false }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-green-900">HIPAA Compliant</h3>
            <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-medium">
              BAA Active
            </span>
          </div>
          {showDetails && (
            <div className="mt-2 space-y-1 text-xs text-green-700">
              <p>• Encryption at rest: AES-256</p>
              <p>• Encryption in transit: TLS 1.3</p>
              <p>• Business Associate Agreements (BAA) in place for all integrations</p>
              <p>• Audit logging enabled for all PHI access</p>
              <p>• Access controls and authentication required</p>
            </div>
          )}
          {!showDetails && (
            <p className="text-xs text-green-700">
              All patient data is encrypted and protected in compliance with HIPAA regulations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

