import React from 'react';
import { useApp } from '../context/AppContext';

export default function TenantSelector() {
  const { state, setCurrentTenant } = useApp();
  const currentTenant = state.currentTenant || state.tenants?.[0];

  // Only show in clinic interface, not in patient interface
  if (state.interfaceMode !== 'clinic') {
    return null;
  }

  if (!state.tenants || state.tenants.length <= 1) {
    return null; // Don't show selector if only one tenant
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-sm font-medium text-blue-900">Multi-Tenant Mode</span>
        </div>
        <select
          value={currentTenant?.id || ''}
          onChange={(e) => {
            const tenant = state.tenants.find(t => t.id === e.target.value);
            if (tenant) setCurrentTenant(tenant);
          }}
          className="px-3 py-1 text-sm border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {state.tenants.map(tenant => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-blue-700 mt-2">
        Data is isolated per tenant. All operations are scoped to the selected clinic.
      </p>
    </div>
  );
}

