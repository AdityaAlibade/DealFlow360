# DealFlow360 Backend API

Enterprise B2B CPQ, Quote Governance, Fulfillment, and Revenue Management Engine.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens)
- **Validation:** Joi & express-validator
- **Primary Color Reference:** `#a459a8` (Purple-Magenta)

## Project Structure
```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema & relations
│   └── seed.js             # Realistic seed dataset
├── src/
│   ├── config/             # Environment & system configurations
│   ├── controllers/        # Request handling controllers (11 modules)
│   ├── services/           # Core business & computation engines (6 engines)
│   ├── models/             # Prisma client initialization
│   ├── routes/             # RESTful API route definitions (11 modules)
│   ├── middleware/         # Auth, validation, roles, error handlers
│   ├── utils/              # Calculation formulas, helpers, constants, validators
│   └── server.js           # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
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

### 3. Setup Database & Prisma
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
