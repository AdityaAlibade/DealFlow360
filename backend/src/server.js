// TODO: Express Server Entry Point
// Create Express app
// Configure middleware
// Setup routes
// Connect to database
// Start server
// Error handling

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const fulfillmentRoutes = require('./routes/fulfillmentRoutes');
const backorderRoutes = require('./routes/backorderRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const customerPortalRoutes = require('./routes/customerPortalRoutes');
const dealHealthRoutes = require('./routes/dealHealthRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRequestRoutes = require('./routes/orderRequestRoutes');

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// Health Check & Root Handlers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', app: config.brand.appName, timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: config.brand.appName,
    description: 'DealFlow360 — Enterprise CPQ, Subscription Billing & Revenue Intelligence Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      orderRequests: '/api/order-requests',
      quotations: '/api/quotations',
      orders: '/api/orders',
      approvals: '/api/approvals',
      fulfillment: '/api/fulfillment',
      fulfillments: '/api/fulfillments',
      backorders: '/api/backorders',
      warehouses: '/api/warehouses',
      subscriptions: '/api/subscriptions',
      invoices: '/api/invoices',
      dealHealth: '/api/deal-health',
      reports: '/api/reports',
      products: '/api/products'
    },
    frontendApp: config.frontendUrl || 'http://localhost:3000'
  });
});

// Mount API Modules
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/order-requests', orderRequestRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/fulfillment', fulfillmentRoutes);
app.use('/api/fulfillments', fulfillmentRoutes); // Alias
app.use('/api/backorders', backorderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customer-portal', customerPortalRoutes);
app.use('/api/deal-health', dealHealthRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/products', productRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`[DealFlow360 API] Server running on port ${config.port} (${config.env})`);
  });
}

module.exports = app;
