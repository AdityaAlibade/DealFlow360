# DealFlow360 — Enterprise CPQ, Subscription Billing & Revenue Intelligence Platform

DealFlow360 closes the gap between deal negotiation, margin enforcement, fulfillment allocation, recurring billing contracts, and revenue recognition.

---

## Getting Started & Running the Application

### Prerequisites
- **Node.js**: v18+ installed
- **PostgreSQL**: Running locally on port `5432` with a database named `dealFlowDb`

---

### 1. Backend Setup & Startup

Open a terminal in the root directory:

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables (create .env file)
# Make sure DATABASE_URL points to your PostgreSQL instance
# Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/dealFlowDb?schema=public"

# Synchronize database schema and seed initial demo data
npx prisma db push
npm run db:seed

# Start the backend server (runs on http://localhost:5000)
npm start
# or for development mode with auto-reload:
# npm run dev
```

---

### 2. Frontend Setup & Startup

Open a **second terminal** in the root directory:

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the React development server (runs on http://localhost:3000)
npm start
```

The application will open automatically in your browser at **http://localhost:3000**.

---

## Role-Based Access Control (RBAC) & Demo Login Credentials

DealFlow360 supports 5 distinct user roles. You can log in with any of the demo accounts below or use the **Quick Role Switcher Pill** located in the top header bar to switch active roles instantly.

| Role | Demo User Name | Demo Email | Password | Primary Responsibilities & Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | Aditya Alibade | `adityaalibade1046@gmail.com` | `password123` | Full platform administration, catalog management, discount governance & global overrides |
| **Sales Manager / Approver** | Priya Sharma | `salesmanager@dealflow360.com` | `password123` | Level-1 discount approvals, configures discount tiers & approval chains, monitors Deal Health |
| **Sales Rep** | Rajesh Kumar | `salesrep@dealflow360.com` | `password123` | Builds CPQ quotations in INR (₹), applies item discounts, adds margin upsells, customer negotiation |
| **Finance / Operations** | Vikram Malhotra | `financemanager@dealflow360.com` | `password123` | Level-2 high-risk margin approvals, multi-warehouse split allocations, GST invoice reconciliation |
| **Customer (Portal)** | Ananya Deshmukh (Tata Digital) | Portal URL (`/customer-portal/demo-token-123`) | N/A | Reviewing quote online, counter-discount negotiation, requesting products, digital sign-off |

### Live Role Switching
- **Top Header Bar**: Click on `Role: [Role Name]` pill in the header to trigger the live role selector dropdown.
- **Route Protection**: Restricted pages (e.g. Reports for Sales Reps) automatically display an interactive **Access Restricted** shield view with single-click role escalation options.

---

## Application Structure & Route Map

- `/dashboard`: Sales & Revenue Executive Dashboard
- `/quotations`: Guided CPQ Quotation Builder & Draft Cart
- `/approvals`: Governance & Risk Matrix Approval Queue
- `/fulfillment`: Stock Allocation & Multi-Warehouse Splits
- `/subscriptions`: SaaS Recurring Billing Contracts & MRR
- `/invoices`: Invoicing & Commercial Payment Reconciliation
- `/customer-portal/:token`: Public Customer Quote Negotiation Portal
- `/deal-health`: Pipeline Anomaly Alerts & Health Intelligence
- `/reports`: Executive Revenue Analytics & Discount Reports
- `/products`: Catalog Management, Price Lists & Tiered Rules
