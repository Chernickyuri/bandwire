import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { auditLogEntries, demoPatients } from '../data/demoData';
import { formatDate } from '../utils/helpers';

export default function LedgerScreen() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterPatient, setFilterPatient] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const getActionColor = (action) => {
    if (action.includes('Payment')) return 'bg-green-100 text-green-800';
    if (action.includes('Signed')) return 'bg-blue-100 text-blue-800';
    if (action.includes('Validation')) return 'bg-purple-100 text-purple-800';
    if (action.includes('Modified')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const allEntries = useMemo(() => {
    const entries = [...auditLogEntries];

    // Add current session entries if available
    if (state.agreement.finalized) {
      entries.unshift({
        id: 'current-1',
        timestamp: new Date().toISOString(),
        user: 'System (DCE)',
        action: 'Rule Validation',
        patient: state.currentPatient.name,
        details: `Payment plan validated: $${state.consultation.downPayment} down, ${state.consultation.installments} months`,
        ipAddress: 'System',
      });
    }

    if (state.agreement.signed) {
      entries.unshift({
        id: 'current-2',
        timestamp: new Date().toISOString(),
        user: state.currentPatient.name,
        action: 'Agreement Signed',
        patient: state.currentPatient.name,
        details: 'Digital signature captured via DocuSign integration',
        ipAddress: '192.168.1.105',
      });
    }

    if (state.payment.completed) {
      entries.unshift({
        id: 'current-3',
        timestamp: new Date().toISOString(),
        user: 'System (Stripe)',
        action: 'Payment Processed',
        patient: state.currentPatient.name,
        details: `Transaction: ${state.payment.transactionId}, Amount: $${state.consultation.downPayment}, Method: ${state.payment.method}`,
        ipAddress: 'System',
      });
    }

    return entries;
  }, [state.agreement.finalized, state.agreement.signed, state.payment.completed, state.currentPatient.name, state.consultation.downPayment, state.consultation.installments, state.payment.transactionId, state.payment.method]);

  // Get unique values for filters
  const uniqueActions = useMemo(() => {
    const actions = new Set(allEntries.map(e => e.action));
    return Array.from(actions).sort();
  }, [allEntries]);

  const uniqueUsers = useMemo(() => {
    const users = new Set(allEntries.map(e => e.user));
    return Array.from(users).sort();
  }, [allEntries]);

  // Filter and search logic
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...allEntries];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        return (
          entry.action.toLowerCase().includes(query) ||
          entry.user.toLowerCase().includes(query) ||
          entry.patient.toLowerCase().includes(query) ||
          entry.details.toLowerCase().includes(query) ||
          entry.ipAddress.toLowerCase().includes(query) ||
          (entry.id && entry.id.toLowerCase().includes(query))
        );
      });
    }

    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter((entry) => entry.action === filterAction);
    }

    // User filter
    if (filterUser !== 'all') {
      filtered = filtered.filter((entry) => entry.user === filterUser);
    }

    // Patient filter
    if (filterPatient !== 'all') {
      filtered = filtered.filter((entry) => entry.patient === filterPatient);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        case 'user':
          aValue = a.user;
          bValue = b.user;
          break;
        case 'patient':
          aValue = a.patient;
          bValue = b.patient;
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allEntries, searchQuery, filterAction, filterUser, filterPatient, sortBy, sortOrder]);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Ledger</h1>
            <p className="text-gray-600 mt-1 text-sm">Complete audit trail of all transactions, agreements, and system actions</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Entries</div>
            <div className="text-2xl font-bold text-gray-800">{filteredAndSortedEntries.length}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, user, patient, details, IP address, or entry ID..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Action
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by User
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Patient
              </label>
              <select
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Patients</option>
                {demoPatients.map((patient) => (
                  <option key={patient.id} value={patient.name}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [col, order] = e.target.value.split('-');
                  setSortBy(col);
                  setSortOrder(order);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="action-asc">Action (A-Z)</option>
                <option value="user-asc">User (A-Z)</option>
                <option value="patient-asc">Patient (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAndSortedEntries.length} of {allEntries.length} entries
            </span>
            {(searchQuery || filterAction !== 'all' || filterUser !== 'all' || filterPatient !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterAction('all');
                  setFilterUser('all');
                  setFilterPatient('all');
                }}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔒</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">Immutable Record</p>
              <p className="text-xs text-blue-600">
                All entries are cryptographically signed and cannot be modified or deleted. Full HIPAA compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAndSortedEntries.map((entry, index) => (
            <div
              key={entry.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                    <span className="text-sm text-gray-600">{entry.user}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{entry.patient}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{entry.details}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(entry.timestamp)}</span>
                    <span>•</span>
                    <span>IP: {entry.ipAddress}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  #{entry.id || `ENTRY-${index + 1}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || filterAction !== 'all' || filterUser !== 'all' || filterPatient !== 'all' ? (
              <div>
                <p className="mb-2">No entries found matching your search criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterAction('all');
                    setFilterUser('all');
                    setFilterPatient('all');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              'No ledger entries yet. Transactions will appear here as they occur.'
            )}
          </div>
        )}
      </div>
    </div>
  );
}

