// TODO: Define all routes
import React from 'react';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import QuotationPage from '../pages/QuotationPage';
import QuotationDetailPage from '../pages/QuotationDetailPage';
import ApprovalPage from '../pages/ApprovalPage';
import ApprovalDetailPage from '../pages/ApprovalDetailPage';
import FulfillmentPage from '../pages/FulfillmentPage';
import FulfillmentDetailPage from '../pages/FulfillmentDetailPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import SubscriptionDetailPage from '../pages/SubscriptionDetailPage';
import InvoicePage from '../pages/InvoicePage';
import InvoiceDetailPage from '../pages/InvoiceDetailPage';
import CustomerPortalPage from '../pages/CustomerPortalPage';
import DealHealthPage from '../pages/DealHealthPage';
import ReportsPage from '../pages/ReportsPage';
import ProductPage from '../pages/ProductPage';
import ProductDetailPage from '../pages/ProductDetailPage';

const routes = [
  // Authentication
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  
  // Dashboard
  { path: '/', element: <DashboardPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  
  // Quotations
  { path: '/quotations', element: <QuotationPage /> },
  { path: '/quotations/:id', element: <QuotationDetailPage /> },
  
  // Approvals
  { path: '/approvals', element: <ApprovalPage /> },
  { path: '/approvals/:id', element: <ApprovalDetailPage /> },
  
  // Fulfillment
  { path: '/fulfillment', element: <FulfillmentPage /> },
  { path: '/fulfillment/:id', element: <FulfillmentDetailPage /> },
  
  // Subscriptions
  { path: '/subscriptions', element: <SubscriptionPage /> },
  { path: '/subscriptions/:id', element: <SubscriptionDetailPage /> },
  
  // Invoices
  { path: '/invoices', element: <InvoicePage /> },
  { path: '/invoices/:id', element: <InvoiceDetailPage /> },
  
  // Customer Portal
  { path: '/customer-portal/:token', element: <CustomerPortalPage /> },
  
  // Deal Health
  { path: '/deal-health', element: <DealHealthPage /> },
  
  // Reports
  { path: '/reports', element: <ReportsPage /> },
  
  // Products
  { path: '/products', element: <ProductPage /> },
  { path: '/products/:id', element: <ProductDetailPage /> }
];

export default routes;
