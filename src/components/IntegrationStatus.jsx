import React from 'react';

const integrations = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscriptions',
    status: 'connected',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 468 222" fill="none">
        <path d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.7 39.5 45.7 6.3 0 11.9-.8 16.3-2.1v-20.7h-15.7v14.4c0 8.3-4.3 13.6-11.2 13.6-8.4 0-12.5-6.2-12.5-13.8 0-21.1 11.1-33.2 23.9-33.2 6.3 0 10.6 2.4 13.6 6.9l11.1-7.5c-4.6-7.2-12.9-12-24.7-12-21.5 0-39.5 16.8-39.5 45.7 0 28.9 18 45.7 39.5 45.7 11.8 0 20.1-4.8 24.7-12l-11.1-7.5c-3 4.5-7.3 6.9-13.6 6.9-12.8 0-23.9-12.1-23.9-33.2 0-7.6 4.1-13.8 12.5-13.8 6.9 0 11.2 5.3 11.2 13.6v13.8h15.7v20.7c-4.4 1.3-10 2.1-16.3 2.1-22.5 0-39.5-15.6-39.5-45.7 0-25.4 14.4-45.6 38.2-45.6 23.7 0 36.1 20.2 36.1 45.8z" fill="#635BFF"/>
        <path d="M301.1 67.4c-6 0-10.8 2.1-14.3 6.7l-1.4-5.2h-18.1v93.1h21.6V89.8c0-7.1 4.3-10.8 9.8-10.8 6.3 0 9.1 4.5 9.1 10.8v71.4h21.6V89.8c0-14.8-8.2-22.4-19.3-22.4z" fill="#635BFF"/>
        <path d="M223.3 61.6l-25.4 7.1c-2.1-7.1-7.9-11.2-15.5-11.2-12.5 0-22.1 10.1-22.1 25.7 0 15.6 9.6 25.7 22.1 25.7 7.6 0 13.4-4.1 15.5-11.2l25.4 7.1c-4.1 13.7-15.8 23.3-41 23.3-26.2 0-45.1-18.2-45.1-44.9 0-26.7 18.9-44.9 45.1-44.9 25.2 0 36.9 9.6 41 23.3z" fill="#635BFF"/>
        <path d="M183.5 73.1c-3.8 0-6.8 2.9-6.8 7.1 0 4.2 3 7.1 6.8 7.1 3.8 0 6.8-2.9 6.8-7.1 0-4.2-3-7.1-6.8-7.1z" fill="#635BFF"/>
        <path d="M146.9 61.6l-1.4 5.2c-3.5-4.6-8.3-6.7-14.3-6.7-11.1 0-19.3 7.6-19.3 22.4v71.4h21.6V89.8c0-6.3 2.8-10.8 9.1-10.8 5.5 0 9.8 3.7 9.8 10.8v71.4H66.1V89.8c0-14.8-8.2-22.4-19.3-22.4z" fill="#635BFF"/>
        <path d="M79.3 61.6l-1.4 5.2c-3.5-4.6-8.3-6.7-14.3-6.7-11.1 0-19.3 7.6-19.3 22.4v71.4H66.1V89.8c0-6.3 2.8-10.8 9.1-10.8 5.5 0 9.8 3.7 9.8 10.8v71.4H66.1V89.8c0-14.8-8.2-22.4-19.3-22.4z" fill="#635BFF"/>
      </svg>
    ),
    baaStatus: 'signed',
    lastSync: '2 minutes ago',
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'E-signature and document management',
    status: 'connected',
    icon: '📝',
    baaStatus: 'signed',
    lastSync: '5 minutes ago',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and reminders',
    status: 'connected',
    icon: '💬',
    baaStatus: 'signed',
    lastSync: '1 minute ago',
  },
];

export default function IntegrationStatus() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return '✓';
      case 'disconnected':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '?';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Integration Status</h2>
        <p className="text-gray-600 text-sm">Monitor the status of all third-party integrations</p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0">
                  {typeof integration.icon === 'string' ? (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      {integration.icon}
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {integration.icon}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(integration.status)}`}>
                      {getStatusIcon(integration.status)} {integration.status === 'connected' ? 'Connected' : integration.status === 'disconnected' ? 'Disconnected' : 'Pending'}
                    </span>
                    {integration.baaStatus === 'signed' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        BAA Signed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Last sync: {integration.lastSync}</span>
                    {integration.baaStatus === 'signed' && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        HIPAA Compliant
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Configure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">Business Associate Agreements (BAA)</p>
            <p className="text-xs text-blue-700">
              All integrations have signed BAAs in place to ensure HIPAA compliance. All data transmitted through these
              services is encrypted and protected according to HIPAA regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

