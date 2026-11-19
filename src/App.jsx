import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/manager/Dashboard';
import TeamLeadDashboard from './pages/team-lead/Dashboard';
import SalesRepDashboard from './pages/sales-rep/Dashboard';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Super Admin Dashboard routes */}
        <Route path="/" element={<SuperAdminDashboard />} />
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/admin" element={<SuperAdminDashboard />} />
        <Route path="/tasks" element={<SuperAdminDashboard initialNav="Tasks" />} />
        <Route path="/sales" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Opportunity" />} />
        <Route path="/sales/opportunity" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Opportunity" />} />
        <Route path="/sales/quotations" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Quotation" />} />
        <Route path="/sales/quotation" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Quotation" />} />
        <Route path="/sales/commercial-offers" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Quotation" />} />
        <Route path="/sales/orders" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Sales Order" />} />
        <Route path="/sales/invoice" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Tax Invoice" />} />
        <Route path="/sales/invoices" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Tax Invoice" />} />
        <Route path="/sales/receipts" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Receipt" />} />
        <Route path="/sales/delivery-notes" element={<SuperAdminDashboard initialNav="Sales" initialSalesSubTab="Receipt" />} />
        <Route path="/leads" element={<SuperAdminDashboard initialNav="Leads" />} />
        <Route path="/customers" element={<SuperAdminDashboard initialNav="Customers" initialCustomerSubTab="Customer" />} />
        <Route path="/customers/contacts" element={<SuperAdminDashboard initialNav="Customers" initialCustomerSubTab="Contact" />} />
        <Route path="/contacts" element={<SuperAdminDashboard initialNav="Customers" initialCustomerSubTab="Contact" />} />
        <Route path="/employees" element={<SuperAdminDashboard initialNav="Employees" />} />
        <Route path="/users" element={<SuperAdminDashboard initialNav="Employees" />} />
        <Route path="/reports" element={<SuperAdminDashboard initialNav="Reports" />} />
        
        {/* Unified Real CRM Dashboard for all roles */}
        <Route path="/manager" element={<SuperAdminDashboard />} />
        <Route path="/manager/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/lead" element={<SuperAdminDashboard />} />
        <Route path="/lead/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/rep" element={<SuperAdminDashboard />} />
        <Route path="/rep/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/executive" element={<SuperAdminDashboard />} />
        <Route path="/executive/dashboard" element={<SuperAdminDashboard />} />

        {/* Dedicated Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Fallback to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
  );
}
