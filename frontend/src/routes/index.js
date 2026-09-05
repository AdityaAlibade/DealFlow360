import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';

// Dashboard
import DashboardPage from '../pages/DashboardPage';

// Quotations
import QuotationPage from '../pages/QuotationPage';
import QuotationDetailPage from '../pages/QuotationDetailPage';

// Approvals
import ApprovalPage from '../pages/ApprovalPage';
import ApprovalDetailPage from '../pages/ApprovalDetailPage';

// Fulfillment
import FulfillmentPage from '../pages/FulfillmentPage';
import FulfillmentDetailPage from '../pages/FulfillmentDetailPage';

// Subscriptions
import SubscriptionPage from '../pages/SubscriptionPage';
import SubscriptionDetailPage from '../pages/SubscriptionDetailPage';

// Invoices
import InvoicePage from '../pages/InvoicePage';
import InvoiceDetailPage from '../pages/InvoiceDetailPage';

// Customer Portal
import CustomerPortalPage from '../pages/CustomerPortalPage';

// Deal Health
import DealHealthPage from '../pages/DealHealthPage';

// Reports
import ReportsPage from '../pages/ReportsPage';

// Products
import ProductPage from '../pages/ProductPage';
import ProductDetailPage from '../pages/ProductDetailPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 2. Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* 3. Quotations */}
      <Route path="/quotations" element={<QuotationPage />} />
      <Route path="/quotations/:id" element={<QuotationDetailPage />} />

      {/* 4. Approvals */}
      <Route path="/approvals" element={<ApprovalPage />} />
      <Route path="/approvals/:id" element={<ApprovalDetailPage />} />

      {/* 5. Fulfillment */}
      <Route path="/fulfillment" element={<FulfillmentPage />} />
      <Route path="/fulfillment/:id" element={<FulfillmentDetailPage />} />

      {/* 6. Subscriptions */}
      <Route path="/subscriptions" element={<SubscriptionPage />} />
      <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />

      {/* 7. Invoices */}
      <Route path="/invoices" element={<InvoicePage />} />
      <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

      {/* 8. Customer Portal (Standalone Layout) */}
      <Route path="/customer-portal/:token" element={<CustomerPortalPage />} />

      {/* 9. Deal Health */}
      <Route path="/deal-health" element={<DealHealthPage />} />

      {/* 10. Reports */}
      <Route path="/reports" element={<ReportsPage />} />

      {/* 11. Products */}
      <Route path="/products" element={<ProductPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />

      {/* Root Redirection */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
