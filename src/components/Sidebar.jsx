import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const clinicMenuItems = [
  {
    category: 'Analytics & Reports',
    items: [
      { path: '/analytics', label: 'Analytics Dashboard', icon: '📊' },
    ],
  },
  {
    category: 'Patient Management',
    items: [
      { path: '/consultation', label: 'Deal Configurator', icon: '📋' },
      { path: '/queue', label: 'Patient Queue', icon: '👥' },
      { path: '/followup', label: 'Follow-ups', icon: '📞' },
    ],
  },
  {
    category: 'Agreements & Payments',
    items: [
      { path: '/agreement', label: 'Agreements', icon: '📄' },
      { path: '/payment', label: 'Payments', icon: '💳' },
      { path: '/ledger', label: 'Financial Ledger', icon: '📊' },
    ],
  },
  {
    category: 'Administration',
    items: [
      { path: '/admin', label: 'Settings', icon: '⚙️' },
      { path: '/super-admin', label: 'Super Admin', icon: '👑' },
    ],
  },
];

const patientMenuItems = [
  {
    category: 'My Account',
    items: [
      { path: '/patient', label: 'Dashboard', icon: '🏠' },
      { path: '/patient/agreement', label: 'Agreement', icon: '📄' },
      { path: '/patient/payment', label: 'Payment', icon: '💳' },
      { path: '/patient/history', label: 'Payment History', icon: '📊' },
    ],
  },
  {
    category: 'Support',
    items: [
      { path: '/patient/chat', label: 'Contact Clinic', icon: '💬' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, setInterfaceMode } = useApp();
  const isPatientMode = state.interfaceMode === 'patient';
  const menuItems = isPatientMode ? patientMenuItems : clinicMenuItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 flex flex-col shadow-lg`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Coco</h1>
              <span className="text-xs text-gray-600">
                {isPatientMode ? 'Patient Portal' : 'Revenue Management'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Interface Mode Toggle */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Interface Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPatientMode}
                onChange={(e) => {
                  const newMode = e.target.checked ? 'patient' : 'clinic';
                  setInterfaceMode(newMode);
                  if (newMode === 'patient') {
                    navigate('/patient');
                  } else {
                    navigate('/consultation');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={`${!isPatientMode ? 'font-semibold text-teal-600' : 'text-gray-500'}`}>
              Clinic
            </span>
            <span className={`${isPatientMode ? 'font-semibold text-teal-600' : 'text-gray-500'}`}>
              Patient
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h3 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
              {isPatientMode ? state.currentPatient.name.charAt(0) : 'TC'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isPatientMode ? state.currentPatient.name : 'Treatment Coordinator'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isPatientMode ? 'Patient' : 'Band & Wire'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

