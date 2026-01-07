# 📘 Bazano Database Documentation

## 1. Overview
This database powers the Bazano e‑commerce and marketer system. It is designed with **MySQL** relational tables, strict foreign keys, and auditability.

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
- `createUser(firstname, lastname, phone, email, password)`
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
- `calculateTransaction(transaction_id)` → computes net profit, seller profit, buyer credit, marketer totals, dev/team shares, payout type.
- `getCalculation(transaction_id)`

### marketer_Calculations
Stores per‑marketer breakdown.

Functions:
- `calculatemarketerShares(transaction_id, marketers[])` → inserts one row per marketer with deal_index, base_share, percentage_applied, marketer_credit, remaining.
- `getmarketerCalculations(transaction_id)`

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
### Marketer 
make a conversation or recommend buyers to buy product(s)
transactions/marketer

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
- **marketers total credit** = 45% of net profit
- **Development shares** = 55% of net profit
  - fixed_development = 25%
  - temporary_ip = 15%
  - temporary_manager = 15%
- **Team shares** = 45% of net profit
  - fixed_team = 20%
  - temporary_head = 10%
  - temporary_selfdev = 10%
  - temporary_consult = 5%
- **marketer credit** = base_share × percentage (percentage depends on deal_index)
- **Remaining** = base_share − marketer_credit
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
4. marketer shares computed → `calculatemarketerShares`
5. Wallets updated → `creditWallet` for seller, buyer, marketers
6. Log entries created → `logAction`
7. Admin queries `transaction_calculations` and `marketer_calculations` for reports

--- 
## Diagram
users
  • id (INTEGER)
  • firstname (TEXT)
  • email (TEXT)
  • lastname (TEXT)
  • phonenumber (TEXT)
  • password (TEXT)

sqlite_sequence
  • name ()
  • seq ()

user_roles
  • id (INTEGER)
  • user_id (INTEGER)
  • role (TEXT)
  ↳ FK: user_id → users.id

profiles
  • id (INTEGER)
  • user_id (INTEGER)
  • address (TEXT)
  • avatar (TEXT)
  • extra_info (TEXT)
  ↳ FK: user_id → users.id

wallets
  • id (INTEGER)
  • user_id (INTEGER)
  • balance (REAL)
  • last_update (DATETIME)
  ↳ FK: user_id → users.id

products
  • id (INTEGER)
  • seller_id (INTEGER)
  • brand (TEXT)
  • name (TEXT)
  • description (TEXT)
  • manufacture_date (DATE)
  • expire_date (DATE)
  • quantity (INTEGER)
  • price_entry (REAL)
  • price_exit (REAL)
  • category (TEXT)
  ↳ FK: seller_id → users.id

transactions
  • id (INTEGER)
  • transaction_code (TEXT)
  • buyer_id (INTEGER)
  • seller_id (INTEGER)
  • marketer_id
  • transaction_record_date (DATETIME)
  • date (DATETIME)
  • status (TEXT)
  • price_entry (REAL)
  • price_exit (REAL)
  • profit (REAL)
  • offer (REAL)
  • tax (REAL)
  • sector (TEXT)
  ↳ FK: seller_id → users.id
  ↳ FK: buyer_id → users.id
  ↳ FK: marketer_id → users.id

transaction_items
  • id (INTEGER)
  • transaction_id (INTEGER)
  • product_id (INTEGER)
  • quantity (INTEGER)
  • price (REAL)
  ↳ FK: product_id → products.id
  ↳ FK: transaction_id → transactions.id

marketers
  • id (INTEGER)
  • user_id (INTEGER)
  • details (TEXT)
  ↳ FK: user_id → users.id

marketer_calculations
  • id (INTEGER)
  • transaction_id (INTEGER)
  • marketer_id (INTEGER)
  • deal_index (INTEGER)
  • base_share (REAL)
  • percentage_applied (REAL)
  • marketer_credit (REAL)
  • remaining (REAL)
  ↳ FK: marketer_id → users.id
  ↳ FK: transaction_id → transactions.id

transaction_calculations
  • id (INTEGER)
  • transaction_id (INTEGER)
  • net_profit (REAL)
  • seller_profit (REAL)
  • buyer_credit (REAL)
  • marketers_credit (REAL)
  • dev_total (REAL)
  • fixed_development (REAL)
  • temporary_ip (REAL)
  • temporary_manager (REAL)
  • team_total (REAL)
  • fixed_team (REAL)
  • temporary_head (REAL)
  • temporary_selfdev (REAL)
  • temporary_consult (REAL)
  • payout_type (TEXT)
  ↳ FK: transaction_id → transactions.id

requests
  • id (INTEGER)
  • user_id (INTEGER)
  • subject (TEXT)
  • message (TEXT)
  • date (DATETIME)
  • status (TEXT)
  ↳ FK: user_id → users.id

support
  • id (INTEGER)
  • user_id (INTEGER)
  • message (TEXT)
  • date (DATETIME)
  • status (TEXT)
  ↳ FK: user_id → users.id

feedbacks
  • id (INTEGER)
  • user_id (INTEGER)
  • transaction_id (INTEGER)
  • rating (INTEGER)
  • message (TEXT)
  • date (DATETIME)
  ↳ FK: transaction_id → transactions.id
  ↳ FK: user_id → users.id

suggestions
  • id (INTEGER)
  • user_id (INTEGER)
  • message (TEXT)
  • date (DATETIME)
  ↳ FK: user_id → users.id

logs
  • id (INTEGER)
  • user_id (INTEGER)
  • action (TEXT)
  • details (TEXT)
  • date (DATETIME)
  • ip_address (TEXT)
  ↳ FK: user_id → users.id
