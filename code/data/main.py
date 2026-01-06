import sqlite3
from pathlib import Path

DB_PATH = r"C:\Users\Ammaq\Documents\BAZANO\website\Baza-no\code\data\database.db"

# Ensure directory exists
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# IMPORTANT: enable FK enforcement
cur.execute("PRAGMA foreign_keys = ON;")

schema = """
-- USERS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    phonenumber TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT UNIQUE,
    address TEXT,
    avatar TEXT,
    extra_info TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- WALLETS
CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    balance REAL DEFAULT 0,
    last_update DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    brand TEXT,
    name TEXT NOT NULL,
    description TEXT,
    manufacture_date DATE,
    expire_date DATE,
    quantity INTEGER NOT NULL,
    price_entry REAL NOT NULL,
    price_exit REAL NOT NULL,
    category TEXT,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_code TEXT UNIQUE NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    transaction_record_date DATETIME NOT NULL,
    status TEXT,
    total_price REAL,
    profit REAL,
    fee REAL,
    sector TEXT,
    offer REAL,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- TRANSACTION ITEMS
CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- PARTNERS
CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PARTNER CALCULATIONS
CREATE TABLE IF NOT EXISTS partner_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    partner_id INTEGER NOT NULL,
    deal_index INTEGER,
    base_share REAL,
    percentage_applied REAL,
    partner_credit REAL,
    remaining REAL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- TRANSACTION CALCULATIONS
CREATE TABLE IF NOT EXISTS transaction_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    net_profit REAL,
    seller_profit REAL,
    buyer_credit REAL,
    partners_credit REAL,
    dev_total REAL,
    fixed_development REAL,
    temporary_ip REAL,
    temporary_manager REAL,
    team_total REAL,
    fixed_team REAL,
    temporary_head REAL,
    temporary_selfdev REAL,
    temporary_consult REAL,
    payout_type TEXT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- REQUESTS
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT,
    message TEXT,
    date DATETIME,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SUPPORT
CREATE TABLE IF NOT EXISTS support (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT,
    date DATETIME,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- FEEDBACKS
CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    rating INTEGER,
    message TEXT,
    date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- SUGGESTIONS
CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT,
    date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- LOGS
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    date DATETIME,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
"""

try:
    cur.executescript(schema)
    conn.commit()
    print("Database built successfully.")

except Exception as e:
    conn.rollback()
    raise RuntimeError(f"Database build failed: {e}")

finally:
    conn.close()
