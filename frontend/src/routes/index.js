import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Guard
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { PERMISSIONS } from '../utils/permissions';

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
      {/* 1. Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 2. Customer Portal (Isolated Layout & Token Security) */}
      <Route path="/customer-portal/:token" element={<CustomerPortalPage />} />

      {/* 3. Dashboard (Internal Authenticated Users) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 4. Quotations */}
      <Route
        path="/quotations"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.QUOTATION_READ}>
            <QuotationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.QUOTATION_READ}>
            <QuotationDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 5. Approvals */}
      <Route
        path="/approvals"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.APPROVAL_READ}>
            <ApprovalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.APPROVAL_READ}>
            <ApprovalDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 6. Fulfillment */}
      <Route
        path="/fulfillment"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fulfillment/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 7. Subscriptions */}
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.BILLING_READ}>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.BILLING_READ}>
            <SubscriptionDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 8. Invoices */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.INVOICE_READ}>
            <InvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.INVOICE_READ}>
            <InvoiceDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 9. Deal Health */}
      <Route
        path="/deal-health"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.DEAL_HEALTH_READ}>
            <DealHealthPage />
          </ProtectedRoute>
        }
      />

      {/* 10. Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.REPORT_READ}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* 11. Products & Configuration */}
      <Route
        path="/products"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.PRODUCT_READ}>
            <ProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.PRODUCT_READ}>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Root Redirection */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
