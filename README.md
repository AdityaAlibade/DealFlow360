# DealFlow360 - Frontend

B2B Sales Platform Frontend built with React, React Router, Tailwind CSS, and Axios.

## Primary Brand Color
- Purple-Magenta: `#a459a8`

## Project Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Architecture & Structure

- **`src/api/`**: Modular API services with centralized Axios client.
- **`src/components/common/`**: Reusable UI components (Button, Input, Select, Modal, Card, Badge, Table, Spinner, Toast, Pagination, EmptyState).
- **`src/components/layout/`**: App shell and navigation layouts (Header, Footer, Sidebar, Navbar, MainLayout).
- **`src/components/`**: Module-specific presentation and container components.
- **`src/pages/`**: 17 Page screens for DealFlow360 platform.
- **`src/contexts/`**: Global state management (Auth, Quotation, Theme).
- **`src/hooks/`**: Custom React hooks.
- **`src/styles/`**: Global styles & Tailwind configuration.
- **`src/utils/`**: Formatters, validators, constants, and helper functions.
- **`src/routes/`**: Centralized routing definitions.
