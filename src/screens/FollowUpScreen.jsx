import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import FollowUpTimeline from '../components/FollowUpTimeline';
import SMSMessage from '../components/SMSMessage';
import { formatDate, formatCurrency } from '../utils/helpers';
import { mockAgreements, demoPatients, initialFollowUpQueue } from '../data/demoData';

const defaultCommunicationHistory = [
  {
    id: '1',
    date: '2024-01-16T10:00:00Z',
    type: 'SMS',
    direction: 'outbound',
    content: 'Thank you for your consultation. We\'ve prepared a treatment plan for you. Please review and let us know if you have any questions.',
    response: null,
    status: 'delivered',
  },
  {
    id: '2',
    date: '2024-01-16T14:30:00Z',
    type: 'Email',
    direction: 'outbound',
    content: 'Treatment plan proposal attached. We\'re here to answer any questions.',
    response: null,
    status: 'opened',
  },
  {
    id: '3',
    date: '2024-01-17T09:15:00Z',
    type: 'Call',
    direction: 'outbound',
    content: 'Follow-up call - discussed payment options',
    response: 'Patient needs time to think. Will respond in 2-3 days.',
    status: 'completed',
  },
];

const determineStatusFromCommunication = (communications) => {
  if (!communications || communications.length === 0) {
    return 'consultation';
  }

  const lastComm = communications[communications.length - 1];
  
  // Если есть ответ от клиента
  if (lastComm.response) {
    const responseLower = lastComm.response.toLowerCase();
    if (responseLower.includes('signed') || responseLower.includes('agree') || responseLower.includes('yes')) {
      return 'signed';
    }
    if (responseLower.includes('paid') || responseLower.includes('payment')) {
      return 'paid';
    }
    if (responseLower.includes('think') || responseLower.includes('time') || responseLower.includes('consider')) {
      return 'observation';
    }
    if (responseLower.includes('interested') || responseLower.includes('maybe')) {
      return 'observation';
    }
  }

  // Если нет ответа, но были попытки связи
  if (lastComm.direction === 'outbound' && !lastComm.response) {
    return 'observation';
  }

  return 'consultation';
};

const determineSequenceFromStatus = (status, communications) => {
  if (!status) return '';
  
  // Если signed или paid - используем gentle sequence для поддержки
  if (status === 'signed' || status === 'paid') {
    return 'gentle-14-day';
  }
  
  // Если observation - проверяем детали коммуникации
  if (status === 'observation') {
    const lastComm = communications[communications.length - 1];
    
    // Если есть ответ с "think/time" - gentle approach
    if (lastComm?.response) {
      const responseLower = lastComm.response.toLowerCase();
      if (responseLower.includes('think') || responseLower.includes('time') || responseLower.includes('consider')) {
        return 'gentle-14-day';
      }
    }
    
    // Если нет ответа на несколько попыток - более агрессивный подход
    const outboundCount = communications.filter(c => c.direction === 'outbound' && !c.response).length;
    if (outboundCount >= 2) {
      return 'aggressive-3-day';
    }
    
    // По умолчанию стандартный
    return 'standard-7-day';
  }
  
  // Если consultation - агрессивный подход для быстрого конверта
  if (status === 'consultation') {
    // Если уже были попытки связи - стандартный
    if (communications.length > 0) {
      return 'standard-7-day';
    }
    // Если первая консультация - агрессивный
    return 'aggressive-3-day';
  }
  
  return 'standard-7-day';
};

export default function FollowUpScreen() {
  const { state, setFollowUp, updateFollowUpCommunications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get patient and agreement from location state or use current
  const patientId = location.state?.patientId || state.currentPatient?.id;
  const agreementId = location.state?.agreementId || (state.agreement.finalized ? 'CURRENT' : null);
  
  // Get follow-up data for this specific patient and agreement (useMemo to recalculate when keys change)
  const followUpKey = useMemo(() => {
    if (!patientId || !agreementId) return null;
    return `${patientId}_${agreementId}`;
  }, [patientId, agreementId]);
  
  const currentFollowUp = useMemo(() => {
    if (!followUpKey) return {};
    return state.followUps[followUpKey] || {};
  }, [followUpKey, state.followUps]);
  
  const savedCommunications = currentFollowUp.communications || defaultCommunicationHistory;
  
  const [communications, setCommunications] = useState(savedCommunications);
  const [autoStatus, setAutoStatus] = useState(determineStatusFromCommunication(savedCommunications));
  const [autoSequence, setAutoSequence] = useState(determineSequenceFromStatus(autoStatus, savedCommunications));
  const [manualStatus, setManualStatus] = useState(currentFollowUp.status || autoStatus);
  const [manualSequence, setManualSequence] = useState(currentFollowUp.sequence || '');
  const [useAutoStatus, setUseAutoStatus] = useState(!currentFollowUp.status && !currentFollowUp.sequence);
  
  // Get agreement details
  const agreement = agreementId === 'CURRENT' 
    ? { id: 'CURRENT', patientId, patientName: state.currentPatient?.name, treatmentName: state.consultation.treatmentName }
    : mockAgreements.find(a => a.id === agreementId) || { id: agreementId, patientId, patientName: state.currentPatient?.name };

  // Get patient details
  const patient = demoPatients.find(p => p.id === patientId) || state.currentPatient || null;

  const currentStatus = useAutoStatus ? autoStatus : manualStatus;
  const currentSequence = useAutoStatus ? autoSequence : manualSequence;
  const [newCommunication, setNewCommunication] = useState({
    type: 'SMS',
    direction: 'outbound',
    content: '',
    response: '',
  });

  useEffect(() => {
    const newAutoStatus = determineStatusFromCommunication(communications);
    const newAutoSequence = determineSequenceFromStatus(newAutoStatus, communications);
    
    setAutoStatus(newAutoStatus);
    setAutoSequence(newAutoSequence);
    
    if (useAutoStatus) {
      setManualStatus(newAutoStatus);
      setManualSequence(newAutoSequence);
    }
  }, [communications, useAutoStatus]);

  // Load saved follow-up data when component mounts or patient/agreement changes
  useEffect(() => {
    if (patientId && agreementId && followUpKey) {
      // Load communications
      if (currentFollowUp.communications && currentFollowUp.communications.length > 0) {
        setCommunications(currentFollowUp.communications);
      } else {
        setCommunications(defaultCommunicationHistory);
      }
      
      // Load status
      if (currentFollowUp.status) {
        setManualStatus(currentFollowUp.status);
        setUseAutoStatus(false);
      } else {
        const initialStatus = determineStatusFromCommunication(currentFollowUp.communications || defaultCommunicationHistory);
        setManualStatus(initialStatus);
        setAutoStatus(initialStatus);
      }
      
      // Load sequence
      if (currentFollowUp.sequence) {
        setManualSequence(currentFollowUp.sequence);
        setUseAutoStatus(false);
      } else {
        const initialSequence = determineSequenceFromStatus(
          currentFollowUp.status || determineStatusFromCommunication(currentFollowUp.communications || defaultCommunicationHistory),
          currentFollowUp.communications || defaultCommunicationHistory
        );
        setManualSequence(initialSequence);
        setAutoSequence(initialSequence);
      }
    }
  }, [patientId, agreementId, followUpKey, currentFollowUp]);

  // Auto-activate follow-up sequence when status or sequence changes
  useEffect(() => {
    if (currentStatus && currentSequence && patientId && agreementId) {
      // Only update if values actually changed
      if (currentFollowUp.status !== currentStatus || currentFollowUp.sequence !== currentSequence) {
        const timeline = generateTimeline(currentSequence);
        setFollowUp(patientId, agreementId, currentStatus, currentSequence, timeline, communications);
      }
    }
  }, [currentStatus, currentSequence, patientId, agreementId]);

  const handleAddCommunication = () => {
    if (!newCommunication.content.trim()) {
      return;
    }

    const comm = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: newCommunication.type,
      direction: newCommunication.direction,
      content: newCommunication.content,
      response: newCommunication.response || null,
      status: newCommunication.direction === 'outbound' ? 'sent' : 'received',
    };

    const updatedCommunications = [...communications, comm];
    setCommunications(updatedCommunications);
    
    // Save communications to context
    if (patientId && agreementId) {
      updateFollowUpCommunications(patientId, agreementId, updatedCommunications);
    }
    
    setNewCommunication({
      type: 'SMS',
      direction: 'outbound',
      content: '',
      response: '',
    });
  };

  const handleSetFollowUp = () => {
    if (!currentStatus || !currentSequence || !patientId || !agreementId) {
      return;
    }

    const timeline = generateTimeline(currentSequence);
    setFollowUp(patientId, agreementId, currentStatus, currentSequence, timeline, communications);
  };

  const generateTimeline = (seq) => {
    const timelines = {
      'standard-7-day': [
        {
          title: 'Day 1: Initial SMS',
          description: 'SMS sent to patient with treatment reminder and payment options',
          date: 'Today',
          completed: true,
          active: false,
        },
        {
          title: 'Day 3: Reminder',
          description: 'Follow-up reminder sent via SMS and email',
          date: 'In 2 days',
          completed: false,
          active: true,
        },
        {
          title: 'Day 7: Final Follow-up',
          description: 'Final follow-up call scheduled with treatment coordinator',
          date: 'In 6 days',
          completed: false,
          active: false,
        },
      ],
      'aggressive-3-day': [
        {
          title: 'Day 1: Initial Contact',
          description: 'SMS and email sent immediately',
          date: 'Today',
          completed: true,
          active: false,
        },
        {
          title: 'Day 2: Follow-up Call',
          description: 'Phone call to discuss any concerns',
          date: 'Tomorrow',
          completed: false,
          active: true,
        },
        {
          title: 'Day 3: Final Push',
          description: 'Final reminder with special offer if applicable',
          date: 'In 2 days',
          completed: false,
          active: false,
        },
      ],
      'gentle-14-day': [
        {
          title: 'Day 1: Initial Contact',
          description: 'Gentle email introduction',
          date: 'Today',
          completed: true,
          active: false,
        },
        {
          title: 'Day 7: Check-in',
          description: 'Friendly reminder email',
          date: 'In 6 days',
          completed: false,
          active: false,
        },
        {
          title: 'Day 14: Final Follow-up',
          description: 'Final check-in call',
          date: 'In 13 days',
          completed: false,
          active: false,
        },
      ],
    };

    return timelines[seq] || timelines['standard-7-day'];
  };

  // List view mode - show all follow-ups with filter
  // Initialize viewMode based on whether we have patient/agreement from location state
  const [viewMode, setViewMode] = useState(() => {
    const locPatientId = location.state?.patientId;
    const locAgreementId = location.state?.agreementId;
    return (locPatientId && locAgreementId) || (patientId && agreementId) ? 'detail' : 'list';
  });
  const [filterPatientId, setFilterPatientId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Update viewMode when location state changes (e.g., after navigation)
  useEffect(() => {
    const locPatientId = location.state?.patientId;
    const locAgreementId = location.state?.agreementId;
    if (locPatientId && locAgreementId) {
      setViewMode('detail');
    } else if (!patientId || !agreementId) {
      setViewMode('list');
    }
  }, [location.state, patientId, agreementId]);

  // Get all follow-ups for list view
  const allFollowUps = useMemo(() => {
    const followUps = [];
    
    // Add from initial queue
    initialFollowUpQueue.forEach(item => {
      const agreement = mockAgreements.find(a => a.id === item.agreementId);
      if (agreement) {
        followUps.push({
          ...item,
          agreement,
          patient: demoPatients.find(p => p.id === item.patientId),
        });
      }
    });
    
    // Add from context
    Object.entries(state.followUps || {}).forEach(([key, followUp]) => {
      const [pId, aId] = key.split('_');
      const agreement = mockAgreements.find(a => a.id === aId) || 
                       (aId === 'CURRENT' ? { id: 'CURRENT', patientId: pId, patientName: state.currentPatient?.name, treatmentName: state.consultation.treatmentName } : null);
      const patient = demoPatients.find(p => p.id === pId) || state.currentPatient;
      
      if (agreement && patient && followUp.status) {
        const exists = followUps.find(f => f.patientId === pId && f.agreementId === aId);
        if (!exists) {
          const lastComm = followUp.communications?.[followUp.communications.length - 1];
          followUps.push({
            id: `followup-${key}`,
            patientId: pId,
            agreementId: aId,
            patientName: patient.name,
            treatmentName: agreement.treatmentName || 'Treatment',
            status: followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1),
            lastContact: lastComm?.date || new Date().toISOString(),
            nextAction: followUp.timeline?.[0]?.title || 'Follow-up needed',
            responseState: lastComm?.response ? 'Responded' : 'No response',
            dealValue: agreement.totalCost || 0,
            agreement,
            patient,
            followUp,
          });
        }
      }
    });
    
    return followUps;
  }, [state.followUps, state.currentPatient]);

  // Filter follow-ups
  const filteredFollowUps = useMemo(() => {
    let filtered = [...allFollowUps];
    
    // Filter by patient
    if (filterPatientId !== 'all') {
      filtered = filtered.filter(f => f.patientId === filterPatientId);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.patientName.toLowerCase().includes(query) ||
        f.treatmentName.toLowerCase().includes(query) ||
        (f.patient?.email && f.patient.email.toLowerCase().includes(query)) ||
        (f.patient?.phone && f.patient.phone.toLowerCase().includes(query))
      );
    }
    
    // Sort by last contact (newest first)
    filtered.sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
    
    return filtered;
  }, [allFollowUps, filterPatientId, searchQuery]);

  // Handle selecting a follow-up
  const handleSelectFollowUp = (selectedPatientId, selectedAgreementId) => {
    if (!selectedPatientId || !selectedAgreementId) {
      console.error('Missing patientId or agreementId');
      return;
    }
    navigate('/followup', { 
      state: { 
        patientId: selectedPatientId, 
        agreementId: selectedAgreementId 
      } 
    });
    // Force re-render by updating viewMode
    setViewMode('detail');
  };

  // If no patient/agreement selected, show list view
  if (!patientId || !agreementId || viewMode === 'list') {
    // Reset viewMode if we have valid data
    if (patientId && agreementId && viewMode === 'detail') {
      // This shouldn't happen, but just in case
    }
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Follow-up Management</h1>
              <p className="text-gray-600 mt-1 text-sm">Manage follow-ups for all patients and agreements</p>
            </div>
            <button
              onClick={() => navigate('/agreement')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
            >
              View Agreements
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Patient
                </label>
                <select
                  value={filterPatientId}
                  onChange={(e) => setFilterPatientId(e.target.value)}
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
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient, treatment, email, or phone..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Follow-ups List */}
          <div className="space-y-3">
            {filteredFollowUps.length > 0 ? (
              filteredFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectFollowUp(item.patientId, item.agreementId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.patientName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Signed' ? 'bg-green-100 text-green-800' :
                          item.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'Observation' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.responseState === 'Responded' ? 'bg-green-50 text-green-700' :
                          item.responseState === 'No response' ? 'bg-red-50 text-red-700' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {item.responseState}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{item.treatmentName}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Last Contact:</span>
                          <p className="font-medium text-gray-900">{formatDate(item.lastContact)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Next Action:</span>
                          <p className="font-medium text-gray-900">{item.nextAction}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Deal Value:</span>
                          <p className="font-medium text-gray-900">{formatCurrency(item.dealValue)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Communications:</span>
                          <p className="font-medium text-gray-900">
                            {item.followUp?.communications?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFollowUp(item.patientId, item.agreementId);
                      }}
                      className="ml-4 text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No follow-ups found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Safety check: if we don't have required data, show error or fallback
  if (!patientId || !agreementId) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Patient or Agreement information is missing.</p>
            <button
              onClick={() => {
                setViewMode('list');
                navigate('/followup');
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header with Patient and Agreement Info */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Follow-up Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigate('/followup');
                }}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                ← Back to List
              </button>
              <button
                onClick={() => navigate('/agreement')}
                className="text-gray-600 hover:text-gray-700 font-medium text-sm"
              >
                View Agreements
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Patient</p>
              <p className="text-sm font-semibold text-gray-900">{agreement.patientName || state.currentPatient?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Agreement</p>
              <p className="text-sm font-semibold text-gray-900">
                {agreement.treatmentName || state.consultation.treatmentName || `Agreement ${agreementId}`}
              </p>
            </div>
          </div>
        </div>

        {/* Communication History */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Communication History</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              autoStatus === 'signed' ? 'bg-green-100 text-green-800' :
              autoStatus === 'paid' ? 'bg-blue-100 text-blue-800' :
              autoStatus === 'observation' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Auto-detected: {autoStatus}
            </span>
          </div>

          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {communications && communications.length > 0 ? (
              communications.map((comm) => (
                comm.type === 'SMS' ? (
                  <SMSMessage 
                    key={comm.id} 
                    message={comm} 
                    patientPhone={patient?.phone || '(555) 123-4567'} 
                  />
                ) : (
                  <div
                    key={comm.id}
                    className={`p-4 rounded-lg border ${
                      comm.direction === 'outbound'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          comm.type === 'Email' ? 'bg-blue-100 text-blue-800' :
                          'bg-teal-100 text-teal-800'
                        }`}>
                          {comm.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comm.date)} • {comm.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{comm.content}</p>
                    {comm.response && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-1">Patient Response:</p>
                        <p className="text-sm text-gray-800 italic">"{comm.response}"</p>
                      </div>
                    )}
                  </div>
                )
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No communication history yet. Add your first communication below.
              </div>
            )}
          </div>

          {/* Add New Communication */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Add Communication</h3>
              {newCommunication.type === 'SMS' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded text-xs">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-purple-700 font-semibold">Twilio SMS</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <select
                value={newCommunication.type}
                onChange={(e) => setNewCommunication({ ...newCommunication, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="SMS">SMS (via Twilio)</option>
                <option value="Email">Email</option>
                <option value="Call">Call</option>
              </select>
              <select
                value={newCommunication.direction}
                onChange={(e) => setNewCommunication({ ...newCommunication, direction: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>
            <textarea
              value={newCommunication.content}
              onChange={(e) => setNewCommunication({ ...newCommunication, content: e.target.value })}
              placeholder="Communication content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-teal-500 min-h-[60px]"
            />
            {newCommunication.direction === 'inbound' && (
              <textarea
                value={newCommunication.response}
                onChange={(e) => setNewCommunication({ ...newCommunication, response: e.target.value })}
                placeholder="Patient response (if any)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-teal-500 min-h-[60px]"
              />
            )}
            <button
              onClick={handleAddCommunication}
              disabled={!newCommunication.content.trim()}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !newCommunication.content.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              Add Communication
            </button>
          </div>
        </div>

        {/* Status Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Patient Status
            </label>
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useAutoStatus}
                onChange={(e) => {
                  setUseAutoStatus(e.target.checked);
                  if (e.target.checked) {
                    setManualStatus(autoStatus);
                    setManualSequence(autoSequence);
                  }
                }}
                className="mr-2"
              />
              Use auto-detected status & sequence
            </label>
          </div>
          <select
            value={currentStatus}
            onChange={(e) => {
              setManualStatus(e.target.value);
              setUseAutoStatus(false);
            }}
            disabled={useAutoStatus}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              useAutoStatus ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
            }`}
          >
            <option value="consultation">Consultation</option>
            <option value="observation">Observation</option>
            <option value="signed">Signed</option>
            <option value="paid">Paid</option>
          </select>
          {useAutoStatus && (
            <p className="mt-2 text-xs text-gray-600">
              Status automatically determined from communication history
            </p>
          )}
        </div>

        {/* Follow-up Sequence */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Follow-up Sequence
            </label>
            {useAutoStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                autoSequence === 'aggressive-3-day' ? 'bg-red-100 text-red-800' :
                autoSequence === 'standard-7-day' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                Auto-detected: {autoSequence === 'aggressive-3-day' ? 'Aggressive' :
                                autoSequence === 'standard-7-day' ? 'Standard' :
                                'Gentle'}
              </span>
            )}
          </div>
          <select
            value={currentSequence}
            onChange={(e) => {
              setManualSequence(e.target.value);
              setUseAutoStatus(false);
            }}
            disabled={useAutoStatus}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              useAutoStatus ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select sequence...</option>
            <option value="standard-7-day">Standard 7-day follow-up</option>
            <option value="aggressive-3-day">Aggressive 3-day follow-up</option>
            <option value="gentle-14-day">Gentle 14-day follow-up</option>
          </select>
          {currentSequence && (
            <div className="mt-2 text-xs text-gray-600">
              {currentSequence === 'standard-7-day' && 'SMS on Day 1, Reminder on Day 3, Final call on Day 7'}
              {currentSequence === 'aggressive-3-day' && 'Immediate contact, Call on Day 2, Final push on Day 3'}
              {currentSequence === 'gentle-14-day' && 'Email on Day 1, Check-in on Day 7, Final call on Day 14'}
            </div>
          )}
          {useAutoStatus && (
            <p className="mt-2 text-xs text-gray-600">
              Sequence automatically determined based on patient status and communication history
            </p>
          )}
        </div>

        {currentFollowUp.timeline && currentFollowUp.timeline.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Follow-up Timeline</h2>
            <FollowUpTimeline timeline={currentFollowUp.timeline} />
          </div>
        )}
        
        {currentSequence && (!currentFollowUp.timeline || currentFollowUp.timeline.length === 0) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Follow-up Timeline</h2>
            <FollowUpTimeline timeline={generateTimeline(currentSequence)} />
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSetFollowUp}
            disabled={!currentStatus || !currentSequence}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors shadow-md ${
              !currentStatus || !currentSequence
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Activate Follow-up Sequence
          </button>
          <button
            onClick={() => navigate('/queue')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            View Patient Queue
          </button>
        </div>
      </div>
    </div>
  );
}

