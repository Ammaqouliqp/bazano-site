# 📘 Bazano Platform – Full System Documentation

## 1. Project Overview

**Bazano** is a multi-vendor product discovery and transaction-request platform.  
It is not a traditional online payment marketplace; instead, it facilitates:

- Product presentation
- Buyer request submission
- Seller verification and fulfillment
- Manual or external payment confirmation
- Controlled in-platform communication

The system supports **multiple user roles**, **separate panels**, **auditable transactions**, and **scalable data architecture**.

---

## 2. Business Model & Transaction Flow

### 2.1 Core Transaction Logic

1. Buyer discovers a product on:
   - Main product pages
   - Partner store pages
   - Blog/news sections
2. Buyer submits a **purchase request** from the product detail page.
3. Seller or support reviews the request.
4. After seller confirmation and product availability:
   - Payment is completed **outside the platform** (no payment gateway).
5. Product is shipped to the buyer.
6. Status and records are logged in the system.
7. Optional in-site chat is available if needed.

---

## 3. User Roles (RBAC)

| Role | Description |
|----|----|
| `manager` | Full system oversight, read-only history, governance |
| `admin` | Operational management, data modification |
| `seller` | Product, price, and store management |
| `buyer` | Product browsing, requests, messaging |
| `support` | Assistance, tickets, limited read-only admin access |
| `marketer` | Campaigns, banners, announcements |

> A user may hold **multiple roles** simultaneously.

---

## 4. User Journeys

### 4.1 Registration & Authentication
- Register via **mobile number** (primary) or **email**
- Login via phone + password
- Optional two-factor authentication
- JWT or Session-based auth

### 4.2 Buyer Flow
- Browse blog, products, stores
- Filter and search products
- Submit purchase requests
- Track transaction history
- Chat with seller / support

### 4.3 Seller Flow
- Access Seller Panel
- Add products manually or via Excel upload
- Edit product details
- View transactions
- Publish store news and banners

### 4.4 Messaging / Ticketing
- Public announcements → Blog
- Private communication → Chat box inside user panel
- Supported conversations:
  - Buyer ↔ Seller
  - Buyer ↔ Support
  - Seller ↔ Admin (if required)

---

## 5. Pages & Features

### 5.1 Public Pages
- **Home**: banners, site news, navigation
- **Partners List**: categorized stores
- **Store Page**: description, ads, products, contact
- **Products Page**: global product list with filters
- **Blog**:
  - Site news
  - Store-specific news
- **Login / Register**

### 5.2 Panels

#### Seller Panel
- Transactions (Excel export)
- Products (edit, Excel import/export)
- Store blog & banners
- Notifications

#### Admin Panel
- Manage sellers
- Manage transactions
- Edit products
- Reports & logs

#### Manager Panel
- Read-only overview of all panels
- Full audit history
- Governance dashboard

#### Support Panel
- Admin-level visibility
- No destructive permissions

#### Notification System
- Role-based alerts
- Transaction updates
- System announcements

---

## 6. Technical Requirements

### 6.1 Front-End
- HTML
- CSS
- Vanilla JavaScript

### 6.2 Back-End
- JavaScript
- JSON-based APIs

### 6.3 Database
- Relational (MySQL / SQLite compatible)
- Reference:
  https://github.com/Ammaqouliqp/bazano-site/blob/main/docs/DATABASE_DOC.md

### 6.4 Infrastructure
- Hosting (TBD)
- CDN (TBD)
- Email / SMS service
- SSL (TBD)
- Backup:
  - Daily data backup
  - Weekly full backup

---

## 7. UI / UX & Branding Requirements

### 7.1 Design
- Wireframes for all pages
- UI color palette
- Typography
- Responsive layout

### 7.2 Brand Identity
- Logo
- Banners
- Icons

---

## 8. Content Requirements

- About Us
- Contact Us
- Terms of Service
- Privacy Policy
- Initial seller profiles
- Sample products
- Initial news entries

---

## 9. Functional Specifications by Subdomain

### baza-no.ir (Main Site)
- Login / Signup
- Profile
- Search & filters
- Seller profiles
- News
- Messaging / ticketing

### seller.baza-no.ir
- Product management
- Pricing
- Messages
- News & announcements
- Image uploads

### manager.baza-no.ir
- Role management
- Seller oversight
- Categories
- Reports
- Activity logs

### administrator.baza-no.ir
- User & seller management
- Product management
- Reports
- Logs

---

# 📘 Bazano Database Documentation

## 10. Database Overview

Relational database designed for:
- Normalization
- Auditability
- Multi-role support
- Financial traceability

---

## 11. Naming Conventions
- Tables: lowercase plural
- PK: `id`
- FK: `<entity>_id`
- Money: `DECIMAL(12,2)`
- Dates: `DATETIME`
- Enums for states

---

## 12. Core Tables

### Users
Stores all user accounts.

### User_Roles
Assigns roles (`manager`, `admin`, `seller`, `buyer`, `support`, `marketer`).

### Profiles
Extended user information.

### Wallets
Balance tracking and payouts.

### Products
Seller product catalog.

### Transactions
Buyer–Seller deals.

### Transaction_Items
Line items per transaction.

### Transaction_Calculations
Profit and distribution logic.

### Partner_Calculations
Per-partner revenue shares.

### Requests / Support / Suggestions
Communication channels.

### Feedbacks
Buyer ratings.

### Logs
Immutable audit trail.

---

## 13. Financial Calculation Rules

- Net profit = profit − fee
- Partner credit = 45% of net profit
- Development shares = 55% of net profit
- Buyer credit = 25% of 45%
- Seller profit = 15% of 45%
- Payout type:
  - `cash` if Bazano member
  - `purchase_credit` otherwise

---

## 14. Programmer Guidelines

- Enforce foreign keys
- Hash passwords
- Use DB transactions
- Log every action
- Atomic wallet updates
- Validate Excel imports
- Role checks via `user_roles`

---

## 15. Example Workflow

1. Buyer creates request
2. Transaction created
3. Items added
4. Calculations executed
5. Wallets updated
6. Logs written
7. Admin reporting

---

## 16. Database Schema Diagram

*(Full table structure as defined in DATABASE_DOC.md, unchanged and authoritative)*

