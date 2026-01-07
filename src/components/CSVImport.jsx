import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function CSVImport() {
  const { bulkImportPatients } = useApp();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Simple CSV parser
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Parse rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.some(v => v)) { // Skip empty rows
        const row = {};
        headers.forEach((header, index) => {
          row[header.toLowerCase()] = values[index] || '';
        });
        rows.push(row);
      }
    }
    return rows;
  };

  // Map CSV columns to patient fields
  const mapToPatient = (csvRow) => {
    const fieldMap = {
      'name': ['name', 'full name', 'patient name'],
      'email': ['email', 'email address'],
      'phone': ['phone', 'phone number', 'telephone'],
      'dob': ['dob', 'date of birth', 'birthdate', 'birth date'],
      'insurance': ['insurance', 'insurance provider', 'insurance company'],
      'insuranceid': ['insurance id', 'insuranceid', 'insurance number', 'member id'],
      'status': ['status', 'patient status'],
    };

    const patient = {
      name: '',
      email: '',
      phone: '',
      dob: '',
      insurance: '',
      insuranceId: '',
      status: 'Consultation',
      previousConsultations: 0,
    };

    Object.keys(csvRow).forEach(csvKey => {
      const lowerKey = csvKey.toLowerCase();
      
      for (const [patientField, possibleNames] of Object.entries(fieldMap)) {
        if (possibleNames.some(name => lowerKey.includes(name) || name.includes(lowerKey))) {
          patient[patientField] = csvRow[csvKey];
          break;
        }
      }
    });

    return patient;
  };

  // Validate patient data
  const validatePatient = (patient, index) => {
    const errors = [];
    
    if (!patient.name || patient.name.trim() === '') {
      errors.push(`Row ${index + 1}: Name is required`);
    }
    
    if (!patient.email || patient.email.trim() === '') {
      errors.push(`Row ${index + 1}: Email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      errors.push(`Row ${index + 1}: Invalid email format`);
    }

    return errors;
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const csvRows = parseCSV(csvText);
        
        if (csvRows.length === 0) {
          setErrors(['CSV file is empty or invalid']);
          return;
        }

        // Map and validate
        const patients = csvRows.map((row, index) => mapToPatient(row));
        const validationErrors = [];
        
        patients.forEach((patient, index) => {
          const patientErrors = validatePatient(patient, index);
          validationErrors.push(...patientErrors);
        });

        setErrors(validationErrors);
        setPreview(patients);
      } catch (error) {
        setErrors([`Error parsing CSV: ${error.message}`]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleImport = () => {
    if (!preview || preview.length === 0) return;
    
    // Check if there are validation errors
    if (errors.length > 0) {
      if (!window.confirm(`There are ${errors.length} validation errors. Import anyway?`)) {
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      bulkImportPatients(preview);
      setIsProcessing(false);
      setFile(null);
      setPreview(null);
      setErrors([]);
      alert(`Successfully imported ${preview.length} patient(s)`);
    }, 1000);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Data Import (CSV)</h2>
        <p className="text-gray-600 text-sm">
          Import multiple patients from a CSV file. Required columns: Name, Email. Optional: Phone, DOB, Insurance, Insurance ID, Status.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-teal-400 bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold text-teal-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">CSV file only</p>
        </label>
      </div>

      {file && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-900">{file.name}</span>
              <span className="ml-2 text-xs text-blue-600">({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
            <button
              onClick={handleClear}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-semibold text-red-900 mb-2">Validation Errors ({errors.length})</h3>
          <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Preview ({preview.length} patient{preview.length !== 1 ? 's' : ''})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Importing...' : `Import ${preview.length} Patient${preview.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.slice(0, 10).map((patient, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-900">{patient.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{patient.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{patient.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{patient.status || 'Consultation'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 10 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                Showing first 10 of {preview.length} patients
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sample CSV Format */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Sample CSV Format</h3>
        <pre className="text-xs text-gray-600 overflow-x-auto">
{`Name,Email,Phone,DOB,Insurance,Insurance ID,Status
John Doe,john@example.com,(555) 123-4567,1990-05-15,BlueCross BlueShield,BC123456789,Consultation
Jane Smith,jane@example.com,(555) 987-6543,1985-08-22,Aetna,AET987654321,Active`}
        </pre>
      </div>
    </div>
  );
}

