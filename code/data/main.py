import sqlite3
from pathlib import Path

# =========================
# Database Path
# =========================
DB_PATH = Path("database.db")

# =========================
# Connection
# =========================
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Enable foreign keys
cursor.execute("PRAGMA foreign_keys = ON;")

# =========================
# USERS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    lastname TEXT NOT NULL,
    phonenumber TEXT UNIQUE,
    password TEXT NOT NULL
);
""")

# =========================
# USER ROLES
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
""")

# =========================
# PROFILES
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    address TEXT,
    avatar TEXT,
    extra_info TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
""")

# =========================
# WALLETS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    balance REAL DEFAULT 0.0,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
""")

# =========================
# PRODUCTS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    brand TEXT,
    name TEXT NOT NULL,
    description TEXT,
    manufacture_date DATE,
    expire_date DATE,
    quantity INTEGER DEFAULT 0,
    price_entry REAL NOT NULL,
    price_exit REAL NOT NULL,
    category TEXT,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
""")

# =========================
# TRANSACTIONS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_code TEXT UNIQUE NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    marketer_id INTEGER,
    transaction_record_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    price_entry REAL,
    price_exit REAL,
    profit REAL,
    offer REAL,
    tax REAL,
    sector TEXT,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (marketer_id) REFERENCES users(id)
);
""")

# =========================
# TRANSACTION ITEMS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
""")

# =========================
# MARKETERS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS marketers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
""")

# =========================
# MARKETER CALCULATIONS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS marketer_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    marketer_id INTEGER NOT NULL,
    deal_index INTEGER,
    base_share REAL,
    percentage_applied REAL,
    marketer_credit REAL,
    remaining REAL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (marketer_id) REFERENCES users(id)
);
""")

# =========================
# TRANSACTION CALCULATIONS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS transaction_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER UNIQUE NOT NULL,
    net_profit REAL,
    seller_profit REAL,
    buyer_credit REAL,
    marketers_credit REAL,
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
""")

# =========================
# REQUESTS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT,
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
""")

# =========================
# SUPPORT
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS support (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
""")

# =========================
# FEEDBACKS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
""")

# =========================
# SUGGESTIONS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
""")

# =========================
# LOGS
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
""")

# =========================
# Finalize
# =========================
conn.commit()
conn.close()

print("SQLite database successfully created.")
