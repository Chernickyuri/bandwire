import React, { createContext, useContext, useReducer } from 'react';
import { defaultRules, demoPatients, mockTenants } from '../data/demoData';

const AppContext = createContext();

const initialState = {
  interfaceMode: 'clinic', // 'clinic' or 'patient'
  currentPatient: demoPatients[0],
  consultation: {
    treatmentName: 'Braces – Full Treatment',
    totalCost: 5000,
    insuranceCoverage: 0, // Amount covered by insurance
    downPayment: 1000,
    installments: 12,
    breakdown: [], // Treatment breakdown (services and materials)
  },
  agreement: {
    finalized: false,
    signed: false,
    signatureData: null,
    sentForSignature: false,
    sentDate: null,
  },
  payment: {
    completed: false,
    transactionId: null,
    method: null,
    startTime: null,
    elapsedTime: null,
  },
  paymentHistory: [],
  savedPaymentMethods: [], // Saved credit cards and bank accounts
  followUps: {}, // Key: `${patientId}_${agreementId}`, Value: { status, sequence, timeline, communications }
  followUpQueue: [],
  rules: defaultRules,
  customPatients: [], // Store newly created patients
  tenants: mockTenants,
  currentTenant: mockTenants[0], // Default to first tenant
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_INTERFACE_MODE':
      return {
        ...state,
        interfaceMode: action.payload,
      };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        currentPatient: action.payload,
      };
    case 'CREATE_PATIENT':
      const newPatient = {
        ...action.payload,
        id: `patient-${Date.now()}`,
      };
      // Add to customPatients array (in real app, this would be an API call)
      return {
        ...state,
        currentPatient: newPatient,
        customPatients: [...state.customPatients, newPatient],
      };
    case 'BULK_IMPORT_PATIENTS':
      const importedPatients = action.payload.map((patientData, index) => ({
        ...patientData,
        id: `patient-import-${Date.now()}-${index}`,
      }));
      return {
        ...state,
        customPatients: [...state.customPatients, ...importedPatients],
      };
    case 'UPDATE_CONSULTATION':
      return {
        ...state,
        consultation: {
          ...state.consultation,
          ...action.payload,
        },
      };
    case 'APPLY_AI_SUGGESTION':
      return {
        ...state,
        consultation: {
          ...state.consultation,
          downPayment: action.payload.downPayment,
          installments: action.payload.installments,
        },
      };
    case 'FINALIZE_AGREEMENT':
      return {
        ...state,
        agreement: {
          ...state.agreement,
          finalized: true,
        },
      };
    case 'SIGN_AGREEMENT':
      return {
        ...state,
        agreement: {
          ...state.agreement,
          signed: true,
          signatureData: action.payload,
        },
        payment: {
          ...state.payment,
          startTime: Date.now(),
        },
      };
    case 'SEND_FOR_SIGNATURE':
      return {
        ...state,
        agreement: {
          ...state.agreement,
          sentForSignature: true,
          sentDate: new Date().toISOString(),
        },
      };
    case 'COMPLETE_PAYMENT':
      const elapsed = Math.round((Date.now() - state.payment.startTime) / 1000 / 60);
      const paymentRecord = {
        id: action.payload.transactionId,
        date: new Date().toISOString(),
        amount: action.payload.amount || state.consultation.downPayment,
        type: action.payload.type || 'Down Payment',
        status: 'Completed',
        transactionId: action.payload.transactionId,
        method: action.payload.method,
        patientId: state.currentPatient.id,
        patientName: state.currentPatient.name,
      };
      return {
        ...state,
        payment: {
          ...state.payment,
          completed: true,
          transactionId: action.payload.transactionId,
          method: action.payload.method,
          elapsedTime: elapsed,
        },
        paymentHistory: [...state.paymentHistory, paymentRecord],
      };
    case 'ADD_PAYMENT_HISTORY':
      return {
        ...state,
        paymentHistory: [...state.paymentHistory, action.payload],
      };
    case 'SET_FOLLOW_UP':
      const { patientId, agreementId, status, sequence, timeline, communications } = action.payload;
      const followUpKey = `${patientId}_${agreementId}`;
      return {
        ...state,
        followUps: {
          ...state.followUps,
          [followUpKey]: {
            status,
            sequence,
            timeline: timeline || [],
            communications: communications || [],
          },
        },
      };
    case 'UPDATE_FOLLOW_UP_COMMUNICATIONS':
      const { patientId: pId, agreementId: aId, communications: comms } = action.payload;
      const key = `${pId}_${aId}`;
      return {
        ...state,
        followUps: {
          ...state.followUps,
          [key]: {
            ...state.followUps[key],
            communications: comms,
          },
        },
      };
    case 'UPDATE_RULES':
      return {
        ...state,
        rules: {
          ...state.rules,
          ...action.payload,
        },
      };
    case 'SET_CURRENT_TENANT':
      return {
        ...state,
        currentTenant: action.payload,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const updatePatient = (patient) => {
    dispatch({ type: 'UPDATE_PATIENT', payload: patient });
  };

  const createPatient = (patientData) => {
    dispatch({ type: 'CREATE_PATIENT', payload: patientData });
  };

  const bulkImportPatients = (patientsData) => {
    dispatch({ type: 'BULK_IMPORT_PATIENTS', payload: patientsData });
  };

  const updateConsultation = (updates) => {
    dispatch({ type: 'UPDATE_CONSULTATION', payload: updates });
  };

  const applyAISuggestion = (suggestion) => {
    dispatch({
      type: 'APPLY_AI_SUGGESTION',
      payload: suggestion.suggestedChanges,
    });
  };

  const finalizeAgreement = () => {
    dispatch({ type: 'FINALIZE_AGREEMENT' });
  };

  const signAgreement = (signatureData) => {
    dispatch({ type: 'SIGN_AGREEMENT', payload: signatureData });
  };

  const sendForSignature = () => {
    dispatch({ type: 'SEND_FOR_SIGNATURE' });
  };

  const completePayment = (transactionId, method, amount, type) => {
    dispatch({
      type: 'COMPLETE_PAYMENT',
      payload: { transactionId, method, amount, type },
    });
  };

  const addPaymentHistory = (paymentRecord) => {
    dispatch({
      type: 'ADD_PAYMENT_HISTORY',
      payload: paymentRecord,
    });
  };

  const savePaymentMethod = (methodData) => {
    dispatch({
      type: 'SAVE_PAYMENT_METHOD',
      payload: {
        ...methodData,
        id: `pm_${Date.now()}`,
        savedAt: new Date().toISOString(),
      },
    });
  };

  const removePaymentMethod = (methodId) => {
    dispatch({
      type: 'REMOVE_PAYMENT_METHOD',
      payload: methodId,
    });
  };

  const setFollowUp = (patientId, agreementId, status, sequence, timeline, communications = []) => {
    dispatch({
      type: 'SET_FOLLOW_UP',
      payload: { patientId, agreementId, status, sequence, timeline, communications },
    });
  };

  const updateFollowUpCommunications = (patientId, agreementId, communications) => {
    dispatch({
      type: 'UPDATE_FOLLOW_UP_COMMUNICATIONS',
      payload: { patientId, agreementId, communications },
    });
  };

  const updateRules = (rules) => {
    dispatch({ type: 'UPDATE_RULES', payload: rules });
  };

  const setInterfaceMode = (mode) => {
    dispatch({ type: 'SET_INTERFACE_MODE', payload: mode });
  };

  const setCurrentTenant = (tenant) => {
    dispatch({ type: 'SET_CURRENT_TENANT', payload: tenant });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updatePatient,
        createPatient,
        bulkImportPatients,
        updateConsultation,
        applyAISuggestion,
        finalizeAgreement,
        signAgreement,
        sendForSignature,
        completePayment,
        addPaymentHistory,
        savePaymentMethod,
        removePaymentMethod,
        setFollowUp,
        updateFollowUpCommunications,
        updateRules,
        setInterfaceMode,
        setCurrentTenant,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

