import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { initialFollowUpQueue, demoPatients, mockAgreements } from '../data/demoData';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function FollowUpQueueScreen() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  // Combine initial queue with follow-ups from context
  const queue = useMemo(() => {
    const queueItems = [...initialFollowUpQueue];
    
    // Add follow-ups from context (state.followUps)
    Object.entries(state.followUps || {}).forEach(([key, followUp]) => {
      const [patientId, agreementId] = key.split('_');
      const agreement = mockAgreements.find(a => a.id === agreementId) || 
                       (agreementId === 'CURRENT' ? { id: 'CURRENT', patientId, patientName: state.currentPatient?.name } : null);
      const patient = demoPatients.find(p => p.id === patientId) || state.currentPatient;
      
      if (agreement && patient && followUp.status) {
        // Check if already in queue
        const exists = queueItems.find(q => q.patientId === patientId && q.agreementId === agreementId);
        if (!exists) {
          const lastComm = followUp.communications?.[followUp.communications.length - 1];
          queueItems.push({
            id: `followup-${key}`,
            patientId,
            agreementId,
            patientName: patient.name,
            treatmentName: agreement.treatmentName || 'Treatment',
            status: followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1),
            lastContact: lastComm?.date || new Date().toISOString(),
            nextAction: followUp.timeline?.[0]?.title || 'Follow-up needed',
            responseState: lastComm?.response ? 'Responded' : 'No response',
            dealValue: agreement.totalCost || 0,
          });
        }
      }
    });
    
    return queueItems;
  }, [state.followUps, state.currentPatient]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterResponse, setFilterResponse] = useState('all');
  const [sortBy, setSortBy] = useState('lastContact');
  const [sortOrder, setSortOrder] = useState('desc');

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getPatientDetails = (patientId) => {
    return demoPatients.find(p => p.id === patientId);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Observation': 'bg-yellow-100 text-yellow-800',
      'Signed': 'bg-blue-100 text-blue-800',
      'Paid': 'bg-green-100 text-green-800',
      'Consultation': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getResponseColor = (response) => {
    if (response === 'Responded') return 'text-green-600';
    if (response === 'No response') return 'text-red-600';
    return 'text-yellow-600';
  };

  // Filter and search logic
  const filteredAndSearchedQueue = useMemo(() => {
    let filtered = [...queue];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const patientDetails = getPatientDetails(item.patientId);
        return (
          item.patientName.toLowerCase().includes(query) ||
          (patientDetails?.email && patientDetails.email.toLowerCase().includes(query)) ||
          (patientDetails?.phone && patientDetails.phone.toLowerCase().includes(query)) ||
          item.nextAction.toLowerCase().includes(query)
        );
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    // Response filter
    if (filterResponse !== 'all') {
      filtered = filtered.filter((item) => item.responseState === filterResponse);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'patientName':
          aValue = a.patientName;
          bValue = b.patientName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastContact':
          aValue = new Date(a.lastContact);
          bValue = new Date(b.lastContact);
          break;
        case 'dealValue':
          aValue = a.dealValue || 0;
          bValue = b.dealValue || 0;
          break;
        default:
          aValue = a.lastContact;
          bValue = b.lastContact;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [queue, searchQuery, filterStatus, filterResponse, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Queue</h1>
            <p className="text-gray-600 mt-1 text-sm">Manage patient follow-ups and track response status</p>
          </div>
          <button
            onClick={() => navigate('/consultation')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            New Consultation
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
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
              placeholder="Search by patient name, email, phone, or next action..."
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

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="Consultation">Consultation</option>
                <option value="Observation">Observation</option>
                <option value="Signed">Signed</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Response
              </label>
              <select
                value={filterResponse}
                onChange={(e) => setFilterResponse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Responses</option>
                <option value="Responded">Responded</option>
                <option value="No response">No response</option>
                <option value="Pending">Pending</option>
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
                <option value="lastContact-desc">Last Contact (Newest)</option>
                <option value="lastContact-asc">Last Contact (Oldest)</option>
                <option value="patientName-asc">Patient Name (A-Z)</option>
                <option value="patientName-desc">Patient Name (Z-A)</option>
                <option value="dealValue-desc">Deal Value (High to Low)</option>
                <option value="dealValue-asc">Deal Value (Low to High)</option>
                <option value="status-asc">Status (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAndSearchedQueue.length} of {queue.length} patients
            </span>
            {(searchQuery || filterStatus !== 'all' || filterResponse !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterResponse('all');
                }}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-8"></th>
                <th 
                  className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('patientName')}
                >
                  <div className="flex items-center">
                    Patient
                    {getSortIcon('patientName') && (
                      <span className="ml-1 text-gray-400">{getSortIcon('patientName')}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status') && (
                      <span className="ml-1 text-gray-400">{getSortIcon('status')}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('lastContact')}
                >
                  <div className="flex items-center">
                    Last Contact
                    {getSortIcon('lastContact') && (
                      <span className="ml-1 text-gray-400">{getSortIcon('lastContact')}</span>
                    )}
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Next Action</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Response State</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSearchedQueue.map((item) => {
                const isExpanded = expandedRows.has(item.id);
                const patientDetails = getPatientDetails(item.patientId);
                
                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleRow(item.id)}
                    >
                      <td className="py-4 px-4">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">{item.patientName}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(item.lastContact)}</td>
                      <td className="py-4 px-4 text-gray-600">{item.nextAction}</td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${getResponseColor(item.responseState)}`}>
                          {item.responseState}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Patient Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                              {patientDetails ? (
                                <div className="space-y-3 text-sm">
                                  <div>
                                    <span className="text-gray-600">Full Name:</span>
                                    <p className="font-medium text-gray-900">{patientDetails.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p className="font-medium text-gray-900">{patientDetails.email}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <p className="font-medium text-gray-900">{patientDetails.phone}</p>
                                  </div>
                                  {patientDetails.dob && (
                                    <div>
                                      <span className="text-gray-600">Date of Birth:</span>
                                      <p className="font-medium text-gray-900">
                                        {formatDate(patientDetails.dob)}
                                      </p>
                                    </div>
                                  )}
                                  {patientDetails.insurance && (
                                    <>
                                      <div>
                                        <span className="text-gray-600">Insurance:</span>
                                        <p className="font-medium text-gray-900">{patientDetails.insurance}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Policy ID:</span>
                                        <p className="font-medium text-gray-900">{patientDetails.insuranceId}</p>
                                      </div>
                                    </>
                                  )}
                                  <div>
                                    <span className="text-gray-600">Previous Consultations:</span>
                                    <p className="font-medium text-gray-900">{patientDetails.previousConsultations}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">Patient details not available</p>
                              )}
                            </div>

                            {/* Deal Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h3>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Deal Value:</span>
                                  <p className="font-medium text-gray-900 text-lg">
                                    {formatCurrency(item.dealValue)}
                                  </p>
                                </div>
                                {item.timeToSign && (
                                  <div>
                                    <span className="text-gray-600">Time to Sign:</span>
                                    <p className="font-medium text-gray-900">{item.timeToSign} minutes</p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Response State:</span>
                                  <span className={`ml-2 font-medium ${getResponseColor(item.responseState)}`}>
                                    {item.responseState}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Contact History */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact History</h3>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Last Contact:</span>
                                  <p className="font-medium text-gray-900">{formatDate(item.lastContact)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Next Action:</span>
                                  <p className="font-medium text-gray-900">{item.nextAction}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h4>
                                  <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex justify-between">
                                      <span>{formatDate(item.lastContact)}</span>
                                      <span>Follow-up sent</span>
                                    </div>
                                    {item.status === 'Observation' && (
                                      <div className="flex justify-between">
                                        <span>{formatDate(new Date(new Date(item.lastContact).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString())}</span>
                                        <span>Initial consultation</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                              <div className="space-y-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/consultation');
                                  }}
                                  className="w-full text-left px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  View/Edit Consultation
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/followup', { 
                                      state: { 
                                        patientId: item.patientId, 
                                        agreementId: item.agreementId || 'CURRENT' 
                                      } 
                                    });
                                  }}
                                  className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Schedule Follow-up
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Navigate to agreement if signed
                                    if (item.status === 'Signed' || item.status === 'Paid') {
                                      navigate('/agreement');
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  View Agreement
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSearchedQueue.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterResponse !== 'all' ? (
              <div>
                <p className="mb-2">No patients found matching your search criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterResponse('all');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              'No patients in follow-up queue'
            )}
          </div>
        )}
      </div>
    </div>
  );
}

