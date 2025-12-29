# 📘 Bazano Database Documentation

## 1. Overview
This database powers the Bazano e‑commerce and partner system. It is designed with **MySQL** relational tables, strict foreign keys, and auditability.

Key principles:
- **Normalization**: no text blobs for lists; use linking tables.
- **Auditability**: every action logged.
- **Permissions**: enforced via foreign keys and role checks.
- **Extensibility**: calculations, wallets, and multi‑role support separated for clarity.

---

## 2. Naming Conventions
- **Tables**: lowercase, plural (`users`, `products`, `transactions`).
- **Primary keys**: always `id` (INT AUTO_INCREMENT).
- **Foreign keys**: `<entity>_id` (e.g., `user_id`, `transaction_id`).
- **Codes**: unique identifiers like `transaction_code`.
- **Dates**: `DATETIME` or `DATE`, named `<field>_date`.
- **Money values**: `DECIMAL(12,2)` for precision.
- **Enums**: used for controlled states (`role`, `status`, `payout_type`).

---

## 3. Core Tables and Usage

### Users
Stores all accounts. Each user can have multiple roles.

Functions:
- `createUser(firstname, lastname, phone, password)`
- `getUserByPhone(phone)`
- `updateUser(user_id, fields)`

### User_Roles
Assigns one or more roles to a user. Roles: `manager`, `admin`, `seller`, `buyer`, `support`, `marketer`.

Functions:
- `assignRole(user_id, role)`
- `removeRole(user_id, role)`
- `getRoles(user_id)`

### Profiles
Extended user info (address, avatar, etc.).

Functions:
- `updateProfile(user_id, email, address, avatar)`

### Wallets
Tracks balances for payouts.

Functions:
- `creditWallet(user_id, amount)`
- `debitWallet(user_id, amount)`
- `getWalletBalance(user_id)`

### Products
Seller’s products.

Functions:
- `addProduct(seller_id, name, brand, price_entry, price_exit, quantity)`
- `updateProduct(product_id, fields)`
- `importProductsFromExcel(seller_id, file)`

### Transactions
Buyer ↔ Seller deals.

Functions:
- `createTransaction(buyer_id, seller_id, items[], fee)`
- `updateTransactionStatus(transaction_id, status)`
- `getTransaction(transaction_id)`

### Transaction_Items
Line items per transaction.

Functions:
- `addItem(transaction_id, product_id, quantity, price)`
- `getItems(transaction_id)`

### Transaction_Calculations
Stores overall distribution per transaction.

Functions:
- `calculateTransaction(transaction_id)` → computes net profit, seller profit, buyer credit, partner totals, dev/team shares, payout type.
- `getCalculation(transaction_id)`

### Partner_Calculations
Stores per‑partner breakdown.

Functions:
- `calculatePartnerShares(transaction_id, partners[])` → inserts one row per partner with deal_index, base_share, percentage_applied, partner_credit, remaining.
- `getPartnerCalculations(transaction_id)`

### Requests / Support / Suggestions
Communication channels.

Functions:
- `createRequest(user_id, subject, message)`
- `createSupportTicket(user_id, message)`
- `createSuggestion(user_id, message)`

### Feedbacks
Buyer feedback on transactions.

Functions:
- `addFeedback(user_id, transaction_id, rating, message)`
- `getFeedbacks(transaction_id)`

### Logs
Audit trail.

Functions:
- `logAction(user_id, action, details, ip_address)`
- `getLogs(user_id)`

---

## 4. Calculation Rules
- **Net profit** = `profit − fee`
- **Seller profit** = 15% of 45% of net profit
- **Buyer credit** = 25% of 45% of net profit
- **Partners total credit** = 45% of net profit
- **Development shares** = 55% of net profit
  - fixed_development = 25%
  - temporary_ip = 15%
  - temporary_manager = 15%
- **Team shares** = 45% of net profit
  - fixed_team = 20%
  - temporary_head = 10%
  - temporary_selfdev = 10%
  - temporary_consult = 5%
- **Partner credit** = base_share × percentage (percentage depends on deal_index)
- **Remaining** = base_share − partner_credit
- **Payout type** = `"cash"` if buyer is Bazano member, else `"purchase_credit"`

---

## 5. How to Call Columns
- Always reference by `table.column`.
- Example:
  ```sql
  SELECT products.name, products.price_exit
  FROM products
  WHERE seller_id = ?;
  ```
- Use foreign keys for joins:
  ```sql
  SELECT t.id, u.firstname, p.name
  FROM transactions t
  JOIN users u ON t.buyer_id = u.id
  JOIN transaction_items ti ON t.id = ti.transaction_id
  JOIN products p ON ti.product_id = p.id;
  ```

---

## 6. Programmer Guidelines
- Never bypass foreign keys: always use IDs, not text names.
- Always hash passwords before insert.
- Use SQL transactions when inserting a transaction + items + calculations.
- Log everything in `logs`.
- Wallet updates must be atomic: update balance + insert log.
- Excel imports: validate data before inserting.
- Calculations: run once per transaction, enforce uniqueness with constraints.
- Naming: lowercase, underscores, singular column names.
- Multi‑role support: always query `user_roles` to check permissions.

---

## 7. Example Workflow
1. Buyer places order → `createTransaction`
2. Items added → `addItem`
3. Transaction confirmed → `calculateTransaction`
4. Partner shares computed → `calculatePartnerShares`
5. Wallets updated → `creditWallet` for seller, buyer, partners
6. Log entries created → `logAction`
7. Admin queries `transaction_calculations` and `partner_calculations` for reports