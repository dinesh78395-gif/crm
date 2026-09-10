import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import ManagementDashboard from './pages/ManagementDashboard';
import LeadsPage from './pages/LeadsPage';
import FollowupsPage from './pages/FollowupsPage';
import CustomersPage from './pages/CustomersPage';
import Customer360Page from './pages/Customer360Page';
import ProgramsPage from './pages/ProgramsPage';
import PendingAssignmentsPage from './pages/PendingAssignmentsPage';
import BatchesPage from './pages/BatchesPage';
import TrainersPage from './pages/TrainersPage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import ExpensesPage from './pages/ExpensesPage';
import ProfitabilityPage from './pages/ProfitabilityPage';

import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center font-bold text-xs text-slate-500">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><ManagementDashboard /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
          <Route path="/followups" element={<ProtectedRoute><FollowupsPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
          <Route path="/customers/:id/360" element={<ProtectedRoute><Customer360Page /></ProtectedRoute>} />
          <Route path="/programs" element={<ProtectedRoute><ProgramsPage /></ProtectedRoute>} />
          <Route path="/pending-assignments" element={<ProtectedRoute><PendingAssignmentsPage /></ProtectedRoute>} />
          <Route path="/batches" element={<ProtectedRoute><BatchesPage /></ProtectedRoute>} />
          <Route path="/trainers" element={<ProtectedRoute><TrainersPage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/profitability" element={<ProtectedRoute><ProfitabilityPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
