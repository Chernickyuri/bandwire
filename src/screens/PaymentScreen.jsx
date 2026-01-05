import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { demoPatients, mockPayments } from '../data/demoData';

export default function PaymentScreen() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPatient, setFilterPatient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [groupByPatient, setGroupByPatient] = useState(true);
  
  const [payments, setPayments] = useState([
    ...mockPayments,
    // Add current payment if completed
    ...(state.payment.completed && state.payment.transactionId ? [{
      id: state.payment.transactionId,
      date: new Date().toISOString(),
      amount: state.consultation.downPayment,
      type: 'Down Payment',
      status: 'Completed',
      transactionId: state.payment.transactionId,
      method: state.payment.method,
      patientId: state.currentPatient.id,
      patientName: state.currentPatient.name,
      agreementId: null,
      cardLast4: state.payment.method === 'Credit Card' ? '4242' : null,
      receiptUrl: '#',
    }] : []),
  ]);

  // Filter, search, and sort logic
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = [...payments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((payment) => {
        const patient = demoPatients.find(p => p.id === payment.patientId);
        return (
          payment.patientName.toLowerCase().includes(query) ||
          payment.transactionId.toLowerCase().includes(query) ||
          (patient?.email && patient.email.toLowerCase().includes(query)) ||
          (patient?.phone && patient.phone.toLowerCase().includes(query)) ||
          payment.type.toLowerCase().includes(query)
        );
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((payment) => payment.status === filterStatus);
    }

    // Patient filter
    if (filterPatient !== 'all') {
      filtered = filtered.filter((payment) => payment.patientId === filterPatient);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((payment) => payment.type === filterType);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'patient':
          aValue = a.patientName;
          bValue = b.patientName;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [payments, searchQuery, filterStatus, filterPatient, filterType, sortBy, sortOrder]);

  // Group payments by patient
  const groupedPayments = useMemo(() => {
    if (!groupByPatient) {
      return { 'All Payments': filteredAndSortedPayments };
    }

    const grouped = {};
    filteredAndSortedPayments.forEach((payment) => {
      if (!grouped[payment.patientName]) {
        grouped[payment.patientName] = [];
      }
      grouped[payment.patientName].push(payment);
    });
    return grouped;
  }, [filteredAndSortedPayments, groupByPatient]);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setViewMode('detail');
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Failed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getMethodIcon = (method) => {
    if (method === 'Credit Card') return '💳';
    if (method === 'ACH') return '🏦';
    return '💰';
  };

  const totalAmount = filteredAndSortedPayments.reduce((sum, p) => sum + (p.status === 'Completed' ? p.amount : 0), 0);
  const completedCount = filteredAndSortedPayments.filter(p => p.status === 'Completed').length;
  const pendingCount = filteredAndSortedPayments.filter(p => p.status === 'Pending').length;
  const failedCount = filteredAndSortedPayments.filter(p => p.status === 'Failed').length;

  // Detail view
  if (viewMode === 'detail' && selectedPayment) {
    const patient = demoPatients.find(p => p.id === selectedPayment.patientId);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedPayment(null);
            }}
            className="text-teal-600 hover:text-teal-800 font-medium mb-6 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Payments
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h1>
            <p className="text-gray-600 text-sm">
              {selectedPayment.patientName} • {formatDate(selectedPayment.date)}
            </p>
          </div>

          <div className="space-y-6">
            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Amount</span>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium text-gray-900">{selectedPayment.type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Method:</span>
                  <p className="font-medium text-gray-900">
                    {getMethodIcon(selectedPayment.method)} {selectedPayment.method}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Transaction ID:</span>
                  <p className="font-mono text-gray-900">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium text-gray-900">{formatDate(selectedPayment.date)}</p>
                </div>
              </div>
              {selectedPayment.cardLast4 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Card:</span>
                  <p className="font-medium text-gray-900">**** {selectedPayment.cardLast4}</p>
                </div>
              )}
              {selectedPayment.bankAccount && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Bank Account:</span>
                  <p className="font-medium text-gray-900">{selectedPayment.bankAccount}</p>
                </div>
              )}
              {selectedPayment.failureReason && (
                <div className="mt-4 pt-4 border-t border-red-200 bg-red-50 rounded p-3">
                  <span className="text-sm font-medium text-red-800">Failure Reason:</span>
                  <p className="text-sm text-red-700 mt-1">{selectedPayment.failureReason}</p>
                </div>
              )}
            </div>

            {/* Patient Info */}
            {patient && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900">{patient.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900">{patient.phone}</p>
                  </div>
                  {selectedPayment.agreementId && (
                    <div>
                      <span className="text-gray-600">Agreement ID:</span>
                      <p className="font-medium text-gray-900">{selectedPayment.agreementId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedPayment.receiptUrl && (
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  View Receipt
                </button>
                <button
                  onClick={() => navigate('/ledger')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  View in Ledger
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1 text-sm">View and manage all payment transactions</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Processed</div>
            <div className="text-2xl font-bold text-teal-600">{formatCurrency(totalAmount)}</div>
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
              placeholder="Search by patient name, transaction ID, email, phone, or type..."
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
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
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
                {demoPatients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Types</option>
                <option value="Down Payment">Down Payment</option>
                <option value="Monthly Installment">Monthly Installment</option>
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
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="patient-asc">Patient (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={groupByPatient}
                  onChange={(e) => setGroupByPatient(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Group by Patient
              </label>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedPayments.length} of {payments.length} payments
              </span>
              {(searchQuery || filterStatus !== 'all' || filterPatient !== 'all' || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterPatient('all');
                    setFilterType('all');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="text-sm text-teal-700 font-medium mb-1">Total Payments</div>
            <div className="text-2xl font-bold text-teal-900">{filteredAndSortedPayments.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 font-medium mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-900">{completedCount}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-700 font-medium mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">{pendingCount}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 font-medium mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</div>
          </div>
        </div>

        {/* Payments List - Grouped or Flat */}
        <div className="space-y-6">
          {Object.entries(groupedPayments).map(([groupName, groupPayments]) => (
            <div key={groupName}>
              {groupByPatient && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {groupName}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({groupPayments.length} {groupPayments.length === 1 ? 'payment' : 'payments'})
                    </span>
                  </h2>
                  <div className="text-sm text-gray-600">
                    Total: {formatCurrency(groupPayments.reduce((sum, p) => sum + (p.status === 'Completed' ? p.amount : 0), 0))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {groupPayments.map((payment) => {
                  const patient = demoPatients.find(p => p.id === payment.patientId);
                  return (
                    <div
                      key={payment.id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewPayment(payment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {!groupByPatient && (
                              <h3 className="text-lg font-semibold text-gray-900">{payment.patientName}</h3>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                            <span className="text-sm text-gray-500">{payment.type}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Amount:</span>
                              <p className="font-semibold text-gray-900 text-lg">{formatCurrency(payment.amount)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Method:</span>
                              <p className="font-medium text-gray-900">
                                {getMethodIcon(payment.method)} {payment.method}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <p className="font-medium text-gray-900">{formatDate(payment.date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Transaction ID:</span>
                              <p className="font-mono text-xs text-gray-600">{payment.transactionId}</p>
                            </div>
                          </div>
                          {patient && !groupByPatient && (
                            <div className="mt-3 text-xs text-gray-500">
                              {patient.email} • {patient.phone}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPayment(payment);
                          }}
                          className="ml-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedPayments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterPatient !== 'all' || filterType !== 'all' ? (
              <div>
                <p className="mb-2">No payments found matching your search criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterPatient('all');
                    setFilterType('all');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              'No payments found'
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate('/queue')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            View Patient Queue
          </button>
          <button
            onClick={() => navigate('/ledger')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            View Financial Ledger
          </button>
        </div>
      </div>
    </div>
  );
}

