import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

export default function SuperAdminDashboard() {
  const { state, setCurrentTenant } = useApp();
  const navigate = useNavigate();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const tenants = state.tenants || [];

  const totalPatients = tenants.reduce((sum, t) => sum + (t.patients || 0), 0);
  const totalRevenue = tenants.reduce((sum, t) => sum + (t.revenue || 0), 0);
  const activeTenants = tenants.filter(t => t.status === 'Active').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage all clinics and tenants across the platform</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 font-medium mb-1">Total Tenants</div>
            <div className="text-2xl font-bold text-blue-900">{tenants.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 font-medium mb-1">Active Tenants</div>
            <div className="text-2xl font-bold text-green-900">{activeTenants}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-700 font-medium mb-1">Total Patients</div>
            <div className="text-2xl font-bold text-purple-900">{totalPatients}</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="text-sm text-teal-700 font-medium mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-teal-900">{formatCurrency(totalRevenue)}</div>
          </div>
        </div>

        {/* Tenants List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Tenants</h2>
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tenant.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : tenant.status === 'Trial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tenant.status}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {tenant.subscription}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tenant.location || 'Location not specified'}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Patients:</span>
                        <p className="font-semibold text-gray-900">{tenant.patients || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Revenue:</span>
                        <p className="font-semibold text-gray-900">{formatCurrency(tenant.revenue || 0)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Joined:</span>
                        <p className="font-semibold text-gray-900">
                          {tenant.joinedDate ? new Date(tenant.joinedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tenant && tenant.id) {
                          setCurrentTenant(tenant);
                          navigate('/consultation');
                        } else {
                          console.error('Invalid tenant data:', tenant);
                          alert('Error: Invalid tenant data. Please try again.');
                        }
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      Switch to Tenant
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTenant(tenant);
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Tenancy Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">Multi-Tenant Architecture</p>
              <p className="text-xs text-blue-700">
                All tenant data is isolated at the database level. Each clinic operates independently with their own
                patients, agreements, and financial records. Data isolation is enforced through tenant ID scoping.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedTenant(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tenant Details</h2>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTenant.name}</h3>
                <p className="text-gray-600">{selectedTenant.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className={`text-lg font-semibold ${
                    selectedTenant.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedTenant.status}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Subscription</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTenant.subscription}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTenant.patients}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedTenant.revenue)}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">Joined Date</p>
                <p className="text-sm text-blue-700">
                  {new Date(selectedTenant.joinedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (selectedTenant && selectedTenant.id) {
                      setCurrentTenant(selectedTenant);
                      setSelectedTenant(null);
                      navigate('/consultation');
                    } else {
                      console.error('Invalid tenant data:', selectedTenant);
                      alert('Error: Invalid tenant data. Please try again.');
                    }
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Switch to This Tenant
                </button>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

