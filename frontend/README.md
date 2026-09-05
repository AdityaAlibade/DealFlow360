# DealFlow360 - Frontend

DealFlow360 is an enterprise quote configuration, approval workflow, subscription billing, and deal health intelligence application.

## Primary Theme
- Primary Brand Color: `#a459a8` (Purple-Magenta)

## Project Structure
```
frontend/
├── public/
├── src/
│   ├── api/             # API services
│   ├── components/      # UI components grouped by feature
│   │   ├── common/      # Generic reusable UI elements
│   │   ├── layout/      # Shell layout, header, sidebar, footer
│   │   ├── auth/        # Login and registration components
│   │   ├── dashboard/   # Dashboard widgets and metric cards
│   │   ├── quotations/  # Quote builder, cart, upsell, margin
│   │   ├── approvals/   # Approval lists, risk breakdown & timeline
│   │   ├── fulfillment/ # Stock allocation and warehouse splitting
│   │   ├── subscriptions/ # Recurring contracts and billing schedule
│   │   ├── invoices/    # Invoicing and reconciliation
│   │   ├── customerPortal/ # Customer quote negotiation & counter-proposal
│   │   ├── dealHealth/  # Anomaly alerts and deal metrics
│   │   ├── reports/     # Analytics and report charts
│   │   └── products/    # Product catalog, forms, and discount rules
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # 17 Main Route Views
│   ├── routes/          # Application router configuration
│   ├── styles/          # Tailwind CSS and theme definitions
│   └── utils/           # Formatters, constants, helpers, validators
```

## Getting Started

### 1. Install Dependencies
```bash
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
