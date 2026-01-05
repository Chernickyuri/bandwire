import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { demoPatients } from '../data/demoData';

export default function PatientSelector() {
  const { state, updatePatient, createPatient } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editedPatient, setEditedPatient] = useState(state.currentPatient);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    insurance: '',
    insuranceId: '',
    status: 'Consultation',
    previousConsultations: 0,
  });

  useEffect(() => {
    setEditedPatient(state.currentPatient);
  }, [state.currentPatient]);

  const handlePatientSelect = (e) => {
    const allPatients = [...demoPatients, ...(state.customPatients || [])];
    const patient = allPatients.find(p => p.id === e.target.value);
    if (patient) {
      updatePatient(patient);
      setEditedPatient(patient);
      setIsEditing(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedPatient({
      ...editedPatient,
      [field]: value,
    });
  };

  const handleSave = () => {
    updatePatient(editedPatient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPatient(state.currentPatient);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSaveNew = () => {
    if (!newPatient.name || !newPatient.email) {
      alert('Please fill in at least Name and Email');
      return;
    }
    createPatient(newPatient);
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      dob: '',
      insurance: '',
      insuranceId: '',
      status: 'Consultation',
      previousConsultations: 0,
    });
    setIsCreating(false);
  };

  const handleCancelNew = () => {
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      dob: '',
      insurance: '',
      insuranceId: '',
      status: 'Consultation',
      previousConsultations: 0,
    });
    setIsCreating(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Patient Information
        </label>
        <div className="flex gap-2">
          {!isEditing && !isCreating && (
            <>
              <button
                onClick={handleCreateNew}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium px-3 py-1 border border-teal-600 rounded-lg hover:bg-teal-50"
              >
                + New Patient
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Edit
              </button>
            </>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Save
              </button>
            </div>
          )}
          {isCreating && (
            <div className="flex gap-2">
              <button
                onClick={handleCancelNew}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Create
              </button>
            </div>
          )}
        </div>
      </div>

      {!isCreating && (
        <select
          value={state.currentPatient.id}
          onChange={handlePatientSelect}
          disabled={isEditing}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed mb-4"
        >
          {demoPatients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
          {(state.customPatients || []).map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.name} (New)
            </option>
          ))}
        </select>
      )}

      {isCreating && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <h3 className="text-sm font-semibold text-teal-900 mb-3">Create New Patient</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="patient@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={newPatient.dob}
                onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Insurance Provider
              </label>
              <input
                type="text"
                value={newPatient.insurance}
                onChange={(e) => setNewPatient({ ...newPatient, insurance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="e.g., BlueCross BlueShield"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Insurance ID
              </label>
              <input
                type="text"
                value={newPatient.insuranceId}
                onChange={(e) => setNewPatient({ ...newPatient, insuranceId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newPatient.status}
                onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              >
                <option value="Consultation">Consultation</option>
                <option value="Active">Active</option>
                <option value="Observation">Observation</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!isCreating && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editedPatient.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={editedPatient.dob || ''}
                  onChange={(e) => handleFieldChange('dob', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editedPatient.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editedPatient.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={editedPatient.insurance || ''}
                  onChange={(e) => handleFieldChange('insurance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="e.g., BlueCross BlueShield"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Insurance ID
                </label>
                <input
                  type="text"
                  value={editedPatient.insuranceId || ''}
                  onChange={(e) => handleFieldChange('insuranceId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editedPatient.status || 'Consultation'}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Active">Active</option>
                  <option value="Observation">Observation</option>
                  <option value="Signed">Signed</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Name:</span>
              <p className="text-gray-900 font-medium">{state.currentPatient.name}</p>
            </div>
            {state.currentPatient.dob && (
              <div>
                <span className="text-gray-500 text-xs">Date of Birth:</span>
                <p className="text-gray-900 font-medium">
                  {new Date(state.currentPatient.dob).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-xs">Email:</span>
              <p className="text-gray-900 font-medium">{state.currentPatient.email}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Phone:</span>
              <p className="text-gray-900 font-medium">{state.currentPatient.phone}</p>
            </div>
            {state.currentPatient.insurance && (
              <>
                <div>
                  <span className="text-gray-500 text-xs">Insurance:</span>
                  <p className="text-gray-900 font-medium">{state.currentPatient.insurance}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Insurance ID:</span>
                  <p className="text-gray-900 font-medium">{state.currentPatient.insuranceId}</p>
                </div>
              </>
            )}
            <div>
              <span className="text-gray-500 text-xs">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                state.currentPatient.status === 'Active' ? 'bg-green-100 text-green-800' :
                state.currentPatient.status === 'Observation' ? 'bg-yellow-100 text-yellow-800' :
                state.currentPatient.status === 'Signed' ? 'bg-blue-100 text-blue-800' :
                state.currentPatient.status === 'Paid' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {state.currentPatient.status}
              </span>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

