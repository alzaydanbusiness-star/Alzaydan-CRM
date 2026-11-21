import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('alzaydan_current_user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RootRedirect() {
  const user = localStorage.getItem('alzaydan_current_user');
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Default root path: checks auth and redirects to /login or /dashboard */}
          <Route path="/" element={<RootRedirect />} />

          {/* Super Admin Dashboard protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><SuperAdminDashboard initialNav="Tasks" /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Opportunity" /></ProtectedRoute>} />
          <Route path="/sales/opportunity" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Opportunity" /></ProtectedRoute>} />
          <Route path="/sales/quotations" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Quotation" /></ProtectedRoute>} />
          <Route path="/sales/quotation" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Quotation" /></ProtectedRoute>} />
          <Route path="/sales/commercial-offers" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Quotation" /></ProtectedRoute>} />
          <Route path="/sales/orders" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Sales Order" /></ProtectedRoute>} />
          <Route path="/sales/invoice" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Tax Invoice" /></ProtectedRoute>} />
          <Route path="/sales/invoices" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Tax Invoice" /></ProtectedRoute>} />
          <Route path="/sales/receipts" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Receipt" /></ProtectedRoute>} />
          <Route path="/sales/delivery-notes" element={<ProtectedRoute><SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Receipt" /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><SuperAdminDashboard initialNav="Leads" /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><SuperAdminDashboard initialNav="Customers" initialCustomerSubTab="Customer" /></ProtectedRoute>} />
          <Route path="/customers/contacts" element={<ProtectedRoute><SuperAdminDashboard initialNav="Customers" initialCustomerSubTab="Contact" /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><SuperAdminDashboard initialNav="Customers" initialCustomerSubTab="Contact" /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><SuperAdminDashboard initialNav="Employees" /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><SuperAdminDashboard initialNav="Employees" /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><SuperAdminDashboard initialNav="Reports" /></ProtectedRoute>} />
          
          {/* Unified Real CRM Dashboard for all roles */}
          <Route path="/manager" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/manager/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/lead" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/lead/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/rep" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/rep/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/executive" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/executive/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />

          {/* Dedicated Login route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Fallback route */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
