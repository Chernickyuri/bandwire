import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PDFPreview from '../components/PDFPreview';
import SignatureCanvas from '../components/SignatureCanvas';
import { validatePaymentPlan } from '../utils/rulesEngine';
import { mockAgreements, demoPatients } from '../data/demoData';
import { formatDate, formatCurrency, calculateMonthlyPayment } from '../utils/helpers';

export default function AgreementScreen() {
  const { state, finalizeAgreement, signAgreement, sendForSignature, updatePatient } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [agreementSent, setAgreementSent] = useState(false);
  
  // Check if coming from Deal Configurator (new agreement)
  const isNewAgreement = location.state?.fromDealConfigurator || false;
  
  // Create new agreement from Deal Configurator data
  const newAgreementFromConfigurator = useMemo(() => {
    if (!isNewAgreement) return null;
    
    return {
      id: `AGR-${Date.now()}`,
      patientId: state.currentPatient.id,
      patientName: state.currentPatient.name,
      treatmentName: state.consultation.treatmentName,
      totalCost: state.consultation.totalCost,
      downPayment: state.consultation.downPayment,
      installments: state.consultation.installments,
      status: 'Draft',
      finalized: false,
      signed: false,
      finalizedDate: null,
      signedDate: null,
      signatureData: null,
    };
  }, [isNewAgreement, state.currentPatient, state.consultation]);

  const [agreements, setAgreements] = useState([
    ...mockAgreements,
    // Add current agreement if finalized
    ...(state.agreement.finalized ? [{
      id: 'CURRENT',
      patientId: state.currentPatient.id,
      patientName: state.currentPatient.name,
      treatmentName: state.consultation.treatmentName,
      totalCost: state.consultation.totalCost,
      downPayment: state.consultation.downPayment,
      installments: state.consultation.installments,
      status: state.agreement.signed ? 'Signed' : 'Finalized',
      finalized: state.agreement.finalized,
      signed: state.agreement.signed,
      signedDate: state.agreement.signed ? new Date().toISOString() : null,
      finalizedDate: state.agreement.finalized ? new Date().toISOString() : null,
      signatureData: state.agreement.signatureData,
    }] : []),
  ]);

  // Auto-open new agreement when coming from Deal Configurator
  useEffect(() => {
    if (isNewAgreement && newAgreementFromConfigurator) {
      setSelectedAgreement(newAgreementFromConfigurator);
      setViewMode('detail');
      // Add to agreements list if not already there
      setAgreements(prev => {
        const exists = prev.find(a => a.id === newAgreementFromConfigurator.id);
        if (!exists) {
          return [newAgreementFromConfigurator, ...prev];
        }
        return prev;
      });
    }
  }, [isNewAgreement, newAgreementFromConfigurator]);

  // Check if agreement was sent for signature
  useEffect(() => {
    if (selectedAgreement) {
      const isCurrentAgreement = selectedAgreement.id === 'CURRENT' || selectedAgreement.id?.startsWith('AGR-');
      if (isCurrentAgreement) {
        setAgreementSent(state.agreement.sentForSignature || false);
      } else {
        setAgreementSent(selectedAgreement.sentForSignature || false);
      }
    } else {
      setAgreementSent(false);
    }
  }, [selectedAgreement, state.agreement.sentForSignature]);

  const filteredAgreements = useMemo(() => {
    let filtered = [...agreements];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((agreement) => {
        const patient = demoPatients.find(p => p.id === agreement.patientId);
        return (
          agreement.patientName.toLowerCase().includes(query) ||
          agreement.treatmentName.toLowerCase().includes(query) ||
          (patient?.email && patient.email.toLowerCase().includes(query)) ||
          (patient?.phone && patient.phone.toLowerCase().includes(query))
        );
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((agreement) => {
        if (filterStatus === 'signed') return agreement.signed;
        if (filterStatus === 'finalized') return agreement.finalized && !agreement.signed;
        if (filterStatus === 'draft') return !agreement.finalized;
        return true;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.signedDate || a.finalizedDate || '';
      const dateB = b.signedDate || b.finalizedDate || '';
      return dateB.localeCompare(dateA);
    });

    return filtered;
  }, [agreements, searchQuery, filterStatus]);

  const handleViewAgreement = (agreement) => {
    const patient = demoPatients.find(p => p.id === agreement.patientId);
    if (patient) {
      updatePatient(patient);
    }
    setSelectedAgreement(agreement);
    setViewMode('detail');
  };

  const handleFinalize = () => {
    const errors = validatePaymentPlan(
      state.consultation.downPayment,
      state.consultation.installments,
      state.consultation.totalCost,
      state.rules
    );

    if (errors.length > 0) {
      return;
    }

    finalizeAgreement();
    // Update agreement in list
    const agreementId = selectedAgreement?.id || 'CURRENT';
    setAgreements(agreements.map(a => 
      a.id === agreementId
        ? { ...a, finalized: true, status: 'Finalized', finalizedDate: new Date().toISOString() }
        : a
    ));
    // Update selected agreement
    if (selectedAgreement) {
      setSelectedAgreement({
        ...selectedAgreement,
        finalized: true,
        status: 'Finalized',
        finalizedDate: new Date().toISOString(),
      });
    }
  };

  const handleSign = (signatureData) => {
    signAgreement(signatureData);
    // Update agreement in list
    const agreementId = selectedAgreement?.id || 'CURRENT';
    setAgreements(agreements.map(a => 
      a.id === agreementId
        ? { ...a, signed: true, status: 'Signed', signedDate: new Date().toISOString(), signatureData }
        : a
    ));
    // Update selected agreement
    if (selectedAgreement) {
      setSelectedAgreement({
        ...selectedAgreement,
        signed: true,
        status: 'Signed',
        signedDate: new Date().toISOString(),
        signatureData,
      });
    }
    navigate('/payment');
  };

  const handleSendForSignature = () => {
    sendForSignature();
    setAgreementSent(true);
    // Update agreement in list
    const agreementId = selectedAgreement?.id || 'CURRENT';
    const sentDate = new Date().toISOString();
    setAgreements(agreements.map(a => 
      a.id === agreementId
        ? { ...a, sentForSignature: true, sentDate }
        : a
    ));
    // Update selected agreement
    if (selectedAgreement) {
      setSelectedAgreement({
        ...selectedAgreement,
        sentForSignature: true,
        sentDate,
      });
    }
    // Show success message
    alert('Agreement sent for signature! Patient will receive notification via email and SMS.');
  };

  // Detail view for specific agreement
  if (viewMode === 'detail' && selectedAgreement) {
    const patient = demoPatients.find(p => p.id === selectedAgreement.patientId) || state.currentPatient;
    const isCurrentAgreement = selectedAgreement.id === 'CURRENT';
    const isNewAgreementFromConfig = selectedAgreement.id?.startsWith('AGR-');
    
    // For new agreement from configurator, use current state data
    const agreementData = isNewAgreementFromConfig ? {
      ...selectedAgreement,
      patientName: state.currentPatient.name,
      treatmentName: state.consultation.treatmentName,
      totalCost: state.consultation.totalCost,
      downPayment: state.consultation.downPayment,
      installments: state.consultation.installments,
    } : selectedAgreement;

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedAgreement(null);
                }}
                className="text-teal-600 hover:text-teal-800 font-medium mb-4 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Agreements
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Treatment Agreement</h1>
              <p className="text-gray-600 mt-1 text-sm">
                {agreementData.patientName} • {agreementData.treatmentName}
              </p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                agreementData.signed ? 'bg-green-100 text-green-800' :
                agreementData.finalized ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {agreementData.status}
              </span>
            </div>
          </div>

          {(!agreementData.finalized && (isCurrentAgreement || isNewAgreementFromConfig)) ? (
            <>
              <PDFPreview />
              <div className="mt-6">
                <button
                  onClick={handleFinalize}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Finalize Agreement
                </button>
              </div>
            </>
          ) : agreementData.finalized && !agreementData.signed && (isCurrentAgreement || isNewAgreementFromConfig) ? (
            <>
              <PDFPreview />
              
              {/* Send for Signature Section */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      {agreementSent ? 'Agreement Sent for Signature' : 'Send for Signature'}
                    </h3>
                    {agreementSent && (state.agreement.sentDate || agreementData.sentDate) && (
                      <p className="text-sm text-blue-700">
                        Sent on {formatDate(state.agreement.sentDate || agreementData.sentDate)}
                      </p>
                    )}
                    <p className="text-sm text-blue-700 mt-1">
                      {agreementSent 
                        ? 'Patient will receive a reminder to sign the agreement via email and SMS.'
                        : 'Send this agreement to the patient for digital signature via email and SMS.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSendForSignature}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm ${
                    agreementSent
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {agreementSent ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Send Reminder for Signature
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send for Signature
                    </span>
                  )}
                </button>
              </div>

              {/* Digital Signature Section */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Digital Signature</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Patient can sign directly here, or you can send the agreement for them to sign remotely.
                </p>
                <SignatureCanvas onSign={handleSign} />
              </div>
            </>
          ) : (
            <>
              <PDFPreview />
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Finalized:</span>
                        <p className="font-medium text-gray-900">
                          {agreementData.finalizedDate ? formatDate(agreementData.finalizedDate) : 'N/A'}
                        </p>
                      </div>
                      {agreementData.signed && (
                        <div>
                          <span className="text-gray-600">Signed:</span>
                          <p className="font-medium text-gray-900">
                            {agreementData.signedDate ? formatDate(agreementData.signedDate) : 'N/A'}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
                
                {/* Follow-up Management Button */}
                <button
                  onClick={() => navigate('/followup', { 
                    state: { 
                      patientId: agreementData.patientId || state.currentPatient?.id, 
                      agreementId: agreementData.id 
                    } 
                  })}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Manage Follow-up
                </button>
              </div>
            </>
          )}
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
            <h1 className="text-2xl font-bold text-gray-900">Agreements</h1>
            <p className="text-gray-600 mt-1 text-sm">Manage and track all treatment agreements</p>
          </div>
          <button
            onClick={() => navigate('/consultation')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            New Agreement
          </button>
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
              placeholder="Search by patient name, treatment, email, or phone..."
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="signed">Signed</option>
                <option value="finalized">Finalized (Not Signed)</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAgreements.length} of {agreements.length} agreements
            </span>
            {(searchQuery || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Agreements List */}
        <div className="space-y-3">
          {filteredAgreements.map((agreement) => {
            const patient = demoPatients.find(p => p.id === agreement.patientId);
            const monthly = calculateMonthlyPayment(agreement.totalCost, agreement.downPayment, agreement.installments);

            return (
              <div
                key={agreement.id}
                className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewAgreement(agreement)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{agreement.patientName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agreement.signed ? 'bg-green-100 text-green-800' :
                        agreement.finalized ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {agreement.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{agreement.treatmentName}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Cost:</span>
                        <p className="font-semibold text-gray-900">{formatCurrency(agreement.totalCost)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Down Payment:</span>
                        <p className="font-semibold text-gray-900">{formatCurrency(agreement.downPayment)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly:</span>
                        <p className="font-semibold text-gray-900">{formatCurrency(monthly)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-semibold text-gray-900">{agreement.installments} months</p>
                      </div>
                    </div>
                    {patient && (
                      <div className="mt-3 text-xs text-gray-500">
                        {patient.email} • {patient.phone}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    {agreement.finalizedDate && (
                      <div className="text-xs text-gray-500 mb-1">
                        Finalized: {formatDate(agreement.finalizedDate)}
                      </div>
                    )}
                    {agreement.signedDate && (
                      <div className="text-xs text-gray-500">
                        Signed: {formatDate(agreement.signedDate)}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAgreement(agreement);
                      }}
                      className="mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAgreements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || filterStatus !== 'all' ? (
              <div>
                <p className="mb-2">No agreements found matching your search criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              'No agreements found'
            )}
          </div>
        )}
      </div>
    </div>
  );
}

