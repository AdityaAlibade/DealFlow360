# DealFlow360 — Enterprise CPQ, Subscription Billing & Revenue Intelligence Platform

DealFlow360 closes the gap between deal negotiation, margin enforcement, fulfillment allocation, recurring billing contracts, and revenue recognition.

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm start
```
The application will launch on **http://localhost:3000**.

---

## Role-Based Access Control (RBAC) & Demo Login Credentials

DealFlow360 supports 5 distinct user roles. You can log in with any of the demo accounts below or use the **Quick Role Switcher Pill** located in the top header bar to switch active roles instantly.

| Role | Demo User Name | Demo Email | Password | Primary Responsibilities & Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Sales Rep** | John Doe | `john.rep@dealflow360.io` | `password123` | Builds quotes, applies item discounts, adds upsells, tracks fulfillment & customer counter-proposals |
| **Sales Manager / Approver** | Sarah Jenkins | `sarah.manager@dealflow360.io` | `password123` | Level-1 discount approvals, configures discount tiers & approval chains, monitors Deal Health |
| **Finance / Operations** | Marcus Vance | `marcus.finance@dealflow360.io` | `password123` | Level-2 high-risk margin approvals, warehouse split allocations, backorders & invoice reconciliation |
| **Customer (Portal)** | Acme Corp Buyer | Portal URL (`/customer-portal/demo-token-123`) | N/A | External portal user reviewing quote online, countering terms & line discounts, digital sign-off |
| **System Admin** | Alex Rivera | `alex.admin@dealflow360.io` | `password123` | Full backend management: catalog, price lists, discount tiers, warehouses, reports & admin overrides |

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
