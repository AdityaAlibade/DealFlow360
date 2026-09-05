import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Guard
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { PERMISSIONS } from '../utils/permissions';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Dashboard
import DashboardPage from '../pages/DashboardPage';

// Quotations
import QuotationPage from '../pages/QuotationPage';
import QuotationDetailPage from '../pages/QuotationDetailPage';
import NewQuotationPage from '../pages/NewQuotationPage';

// Order Requests
import OrderRequestsPage from '../pages/OrderRequestsPage';
import OrderRequestDetailPage from '../pages/OrderRequestDetailPage';

// Approvals
import ApprovalPage from '../pages/ApprovalPage';
import ApprovalDetailPage from '../pages/ApprovalDetailPage';

// Fulfillment
import FulfillmentPage from '../pages/FulfillmentPage';
import FulfillmentDetailPage from '../pages/FulfillmentDetailPage';

// Subscriptions
import SubscriptionPage from '../pages/SubscriptionPage';
import SubscriptionDetailPage from '../pages/SubscriptionDetailPage';
import NewSubscriptionPlanPage from '../pages/NewSubscriptionPlanPage';

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

// Profile
import ProfilePage from '../pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 2. Customer Portal (Isolated Layout & Token Security) */}
      <Route path="/customer-portal/:token" element={<CustomerPortalPage />} />
      <Route path="/customer" element={<CustomerPortalPage />} />
      <Route path="/customer/portal" element={<CustomerPortalPage />} />
      <Route path="/customer/*" element={<CustomerPortalPage />} />

      {/* 3. Dedicated Admin Portal (/admin/* -> ADMIN only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 4. Dedicated Sales Portal (/sales/* -> SALES REP & SALES MANAGER) */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/dashboard"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/quotations"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']} requiredPermission={PERMISSIONS.QUOTATION_READ}>
            <QuotationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/quotations/new"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']} requiredPermission={PERMISSIONS.QUOTATION_READ}>
            <NewQuotationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/quotations/:id"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']} requiredPermission={PERMISSIONS.QUOTATION_READ}>
            <QuotationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/warehouses"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']} requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/fulfillment"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']} requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/*"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 5. Dedicated Finance Portal (/finance/* -> FINANCE & OPS) */}
      <Route
        path="/finance"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/dashboard"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/invoices"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']} requiredPermission={PERMISSIONS.INVOICE_READ}>
            <InvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/subscriptions"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']} requiredPermission={PERMISSIONS.BILLING_READ}>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/warehouses"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']} requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/fulfillment"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']} requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/approvals"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']} requiredPermission={PERMISSIONS.APPROVAL_READ}>
            <ApprovalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/*"
        element={
          <ProtectedRoute allowedRoles={['finance_ops', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 6. Dashboard (Internal Authenticated Users) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />


      {/* Order Requests */}
      <Route
        path="/order-requests"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.PRODUCT_REQUEST_VIEW}>
            <OrderRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-requests/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.PRODUCT_REQUEST_VIEW}>
            <OrderRequestDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/order-requests"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']} requiredPermission={PERMISSIONS.PRODUCT_REQUEST_VIEW}>
            <OrderRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/order-requests/:id"
        element={
          <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']} requiredPermission={PERMISSIONS.PRODUCT_REQUEST_VIEW}>
            <OrderRequestDetailPage />
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
        path="/quotations/new"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.QUOTATION_READ}>
            <NewQuotationPage />
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

      {/* 6. Warehouses & Fulfillment */}
      <Route
        path="/warehouses"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouses/:id"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.FULFILLMENT_READ}>
            <FulfillmentDetailPage />
          </ProtectedRoute>
        }
      />
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
        path="/subscriptions/plans/new"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.BILLING_READ}>
            <NewSubscriptionPlanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions/new"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.BILLING_READ}>
            <NewSubscriptionPlanPage />
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
