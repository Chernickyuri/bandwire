import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ConsultationScreen from './screens/ConsultationScreen';
import ObjectionScreen from './screens/ObjectionScreen';
import AgreementScreen from './screens/AgreementScreen';
import PaymentScreen from './screens/PaymentScreen';
import LedgerScreen from './screens/LedgerScreen';
import FollowUpScreen from './screens/FollowUpScreen';
import FollowUpQueueScreen from './screens/FollowUpQueueScreen';
import AdminPanel from './screens/AdminPanel';
import AnalyticsDashboard from './screens/AnalyticsDashboard';
import PatientDashboard from './screens/PatientDashboard';
import PatientAgreement from './screens/PatientAgreement';
import PatientPayment from './screens/PatientPayment';
import PatientHistory from './screens/PatientHistory';
import PatientChat from './screens/PatientChat';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/consultation" replace />} />
            {/* Clinic routes */}
            <Route path="/consultation" element={<ConsultationScreen />} />
            <Route path="/objection" element={<ObjectionScreen />} />
            <Route path="/agreement" element={<AgreementScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/ledger" element={<LedgerScreen />} />
            <Route path="/followup" element={<FollowUpScreen />} />
            <Route path="/queue" element={<FollowUpQueueScreen />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* Patient routes */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/agreement" element={<PatientAgreement />} />
            <Route path="/patient/payment" element={<PatientPayment />} />
            <Route path="/patient/history" element={<PatientHistory />} />
            <Route path="/patient/chat" element={<PatientChat />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;

