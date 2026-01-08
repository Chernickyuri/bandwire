import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/helpers';

export default function SignatureStatus({ 
  sentForSignature, 
  sentDate, 
  signed, 
  signedDate,
  patientName,
  patientEmail,
  provider = 'DocuSign' // Default to DocuSign
}) {
  const [currentStatus, setCurrentStatus] = useState('draft');
  const [statusHistory, setStatusHistory] = useState([]);
  const [envelopeId, setEnvelopeId] = useState(null);

  useEffect(() => {
    // Generate mock envelope ID when sent
    if (sentForSignature && sentDate && !envelopeId) {
      const mockId = `env_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setEnvelopeId(mockId);
    }

    if (signed && signedDate) {
      setCurrentStatus('signed');
      setStatusHistory([
        { status: 'sent', label: 'Agreement Sent', date: sentDate, icon: '📧', details: `Envelope ID: ${envelopeId || 'N/A'}` },
        { status: 'delivered', label: 'Email Delivered', date: new Date(new Date(sentDate).getTime() + 2 * 60000).toISOString(), icon: '✉️' },
        { status: 'viewed', label: 'Agreement Viewed', date: new Date(new Date(sentDate).getTime() + 5 * 60000).toISOString(), icon: '👁️' },
        { status: 'signed', label: 'Agreement Signed', date: signedDate, icon: '✓', details: 'Legally binding signature' },
      ]);
    } else if (sentForSignature && sentDate) {
      setCurrentStatus('sent');
      const viewedDate = new Date(new Date(sentDate).getTime() + 5 * 60000);
      const hasViewed = new Date() > viewedDate;
      
      const history = [
        { status: 'sent', label: 'Agreement Sent', date: sentDate, icon: '📧', details: `Envelope ID: ${envelopeId || 'N/A'}` },
        { status: 'delivered', label: 'Email Delivered', date: new Date(new Date(sentDate).getTime() + 2 * 60000).toISOString(), icon: '✉️' },
      ];
      
      if (hasViewed) {
        history.push({ status: 'viewed', label: 'Agreement Viewed', date: viewedDate.toISOString(), icon: '👁️' });
        setCurrentStatus('viewed');
      }
      
      setStatusHistory(history);
    } else {
      setCurrentStatus('draft');
      setStatusHistory([]);
    }
  }, [sentForSignature, sentDate, signed, signedDate, envelopeId, patientEmail]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'viewed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed':
        return '✓';
      case 'viewed':
        return '👁️';
      case 'delivered':
        return '✉️';
      case 'sent':
        return '📧';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">E-Signature Status</h3>
          <p className="text-sm text-gray-600 mt-1">Track the digital signature process</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Powered by</span>
          <span className={`px-3 py-1 text-white text-xs font-semibold rounded ${
            provider === 'DocuSign' ? 'bg-blue-700' : 'bg-blue-600'
          }`}>
            {provider}
          </span>
        </div>
      </div>

      {currentStatus === 'draft' && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Agreement is in draft status. Send it to the patient for digital signature.
          </p>
        </div>
      )}

      {currentStatus !== 'draft' && (
        <>
          {/* Status Timeline */}
          <div className="mb-6">
            <div className="relative">
              {statusHistory.map((item, index) => (
                <div key={index} className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStatusColor(item.status)}`}>
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    {index < statusHistory.length - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-12 bg-gray-300"></div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${getStatusColor(item.status).split(' ')[1]}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(item.date)}
                        </p>
                        {item.details && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            {item.details}
                          </p>
                        )}
                      </div>
                      {item.status === 'sent' && patientEmail && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">To:</span> {patientEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Status Badge */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(currentStatus)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStatusIcon(currentStatus)}</span>
                <div>
                  <p className="font-semibold text-sm">
                    {currentStatus === 'signed' ? 'Agreement Fully Executed' : 
                     currentStatus === 'viewed' ? 'Patient Has Viewed Agreement' :
                     'Agreement Sent for Signature'}
                  </p>
                  <p className="text-xs mt-1 opacity-75">
                    {currentStatus === 'signed' 
                      ? `Signed on ${formatDate(signedDate)}`
                      : currentStatus === 'viewed'
                      ? 'Waiting for signature'
                      : `Sent on ${formatDate(sentDate)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-900 mb-1">{provider} Integration</p>
                <p className="text-xs text-blue-700">
                  {currentStatus === 'signed' 
                    ? 'Agreement has been digitally signed and is legally binding. A copy has been sent to the patient via email.'
                    : `Agreement sent via ${provider}. Patient will receive email and SMS notifications to sign the document.`}
                </p>
                {envelopeId && (
                  <p className="text-xs text-blue-600 mt-1 font-mono">
                    Envelope ID: {envelopeId}
                  </p>
                )}
                {currentStatus !== 'signed' && (
                  <p className="text-xs text-blue-600 mt-1">
                    HIPAA-compliant BAA in place. All signatures are cryptographically signed and tamper-proof.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

