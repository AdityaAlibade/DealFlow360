# DealFlow360 — Customer Product Selection & Product Request Feature

## Summary of Completed Feature
We have extended DealFlow360 with a self-governing **Customer Product Selection & Product Request** workflow. Customers can browse customer-facing products, select quantities, add custom deployment notes, and submit formal product requests. Sales Representatives review, accept, or reject incoming requests, and accepted products are automatically integrated into the quotation proposal following DealFlow360's approval rules.

---

## 1. Architectural Workflow

```
+---------------------------------------------------------------------------------------------------+
|                                      CUSTOMER PORTAL WORKFLOW                                     |
|                                                                                                   |
|   1. Customer logs into Portal (/customer-portal/:token)                                          |
|         ↓                                                                                         |
|   2. Clicks "Products & Services" (Sanitized customer catalog: NO margin / cost exposed)         |
|         ↓                                                                                         |
|   3. Selects Product & Quantity (e.g. 3x Docking Station USB-C) + Adds Custom Request Note        |
|         ↓                                                                                         |
|   4. Submits Request (Request status = PENDING, stored in ProductRequestService, Audit Logged)    |
|         ↓                                                                                         |
|   5. Customer Tracks Status in "My Product Requests" Tab (Can cancel if PENDING)                  |
+---------------------------------------------------------------------------------------------------+
                                                  ↓
+---------------------------------------------------------------------------------------------------+
|                                      SALES REP WORKFLOW & CPQ                                     |
|                                                                                                   |
|   6. Sales Rep opens Quotation (/quotations/Q-1042)                                               |
|         ↓                                                                                         |
|   7. Inspects "Customer Product Requests" Review Card                                             |
|         ↓                                                                                         |
|   8. Clicks [ Accept Request ] or [ Reject Request ] with response reason                         |
|         ↓                                                                                         |
|   9. If Accepted: Product added as official line item via Quotation Service                       |
|         ↓                                                                                         |
|   10. Discount & Margin Governance evaluated:                                                     |
|         - If within limit (≤10%): Proposal updated directly                                       |
|         - If exceeding limit (>10%): Automatically routes to Sales Manager approval flow           |
|         ↓                                                                                         |
|   11. Customer Portal proposal immediately reflects the new item in real-time!                   |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Permissions Added

| Permission | Role Assignment | Description |
| :--- | :--- | :--- |
| `product.catalog.view` | `customer`, `sales_rep`, `sales_manager`, `admin` | View customer-facing product directory |
| `product.view` | `customer`, `sales_rep`, `sales_manager`, `admin` | View sanitized product specifications & pricing |
| `product.request.create`| `customer` | Submit product addition requests |
| `product.request.view` | `customer`, `sales_rep`, `sales_manager`, `admin` | View submitted requests and their review status |
| `product.request.cancel`| `customer` | Cancel own requests while status is `PENDING` |
| `product.request.accept`| `sales_rep`, `sales_manager`, `admin` | Officially approve and inject product into quotation |
| `product.request.reject`| `sales_rep`, `sales_manager`, `admin` | Reject request with recorded explanation |

---

## 3. Files Created & Modified

### Created Files:
1. [`frontend/src/services/productRequestService.js`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/services/productRequestService.js) — Core service handling customer catalog sanitization, request lifecycle (`PENDING` -> `ACCEPTED` / `REJECTED` / `CANCELLED`), and quote integration.

### Modified Files:
1. [`frontend/src/utils/permissions.js`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/utils/permissions.js) — Added product request permissions to registry and role mappings.
2. [`frontend/src/utils/auditLogger.js`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/utils/auditLogger.js) — Added audit actions (`PRODUCT_REQUEST_CREATED`, `PRODUCT_REQUEST_ACCEPTED`, `PRODUCT_REQUEST_REJECTED`, `PRODUCT_REQUEST_CANCELLED`).
3. [`frontend/src/services/customerNegotiationService.js`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/services/customerNegotiationService.js) — Added helper methods `addDirectLineItemToQuote` and `updateQuoteStatus`.
4. [`frontend/src/api/customerPortalAPI.js`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/api/customerPortalAPI.js) — Exposed catalog search, request creation, list, and cancel methods.
5. [`frontend/src/api/productAPI.js`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/api/productAPI.js) — Exposed `getAllCustomerRequests`, `acceptCustomerRequest`, and `rejectCustomerRequest`.
6. [`frontend/src/api/client.js`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/api/client.js) — Enforced service-level RBAC and customer route isolation.
7. [`frontend/src/pages/CustomerPortalPage.jsx`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/pages/CustomerPortalPage.jsx) — Built full 3-tab portal layout (**Quotation**, **Products & Services**, **My Requests**).
8. [`frontend/src/pages/QuotationDetailPage.jsx`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/pages/QuotationDetailPage.jsx) — Added **Customer Product Requests** review card with Accept/Reject modal.
9. [`frontend/src/pages/QuotationPage.jsx`](file:///c:/Users/pratik/Desktop/Odoo/DealFlow360/frontend/src/pages/QuotationPage.jsx) — Added alert banner and request badge indicator for incoming customer requests.

---

## 4. Test Verification Results

All 12 required scenarios were tested and passed:
- **TEST 1**: Customer catalog displays only customer-facing products with clean pricing ($1,200, $450, $180, $85/mo, etc.). Internal margins and risk scores are completely stripped.
- **TEST 2**: Customer selects quantity and submits note; product enters `PENDING` request state and is NOT directly added to the quotation.
- **TEST 3**: Request is registered in "My Product Requests" with `REQ-xxxx` ID, timestamp, and `PENDING` status.
- **TEST 4**: Sales Rep opens `/quotations/Q-1042` and views the pending request with customer note.
- **TEST 5**: Sales Rep clicks `Accept`; product is added to the quotation line items table and subtotal/tax/totals recompute automatically.
- **TEST 6 & 7**: Approval threshold is evaluated (standard ≤10% proceeds, >10% triggers approval requirement).
- **TEST 8**: Rejection records the sales response reason and sets status to `REJECTED`.
- **TEST 9 & 10**: Customer calling internal APIs or modifying unauthorized requests receives `403 Access Denied`.
- **TEST 11**: Real-time sync verified: Customer Portal reflects the accepted product in both "My Requests" and the official Quotation proposal!
