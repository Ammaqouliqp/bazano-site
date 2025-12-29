import sqlite3

# List of SQL create table statements in the correct order to satisfy foreign key constraints
sql_statements = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        phonenumber VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,   -- store hashed password
        role ENUM('manager','admin','seller','buyer','support','marketer') NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(150),
        address TEXT,
        avatar VARCHAR(255),
        extra_info TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        balance DECIMAL(12,2) DEFAULT 0,
        last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        brand VARCHAR(100),
        name VARCHAR(150) NOT NULL,
        description TEXT,
        manufacture_date DATE,
        expire_date DATE,
        quantity INT DEFAULT 0,
        price_entry DECIMAL(12,2),
        price_exit DECIMAL(12,2),
        category VARCHAR(100),
        FOREIGN KEY (seller_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_code VARCHAR(50) UNIQUE NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        transaction_record_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending','confirmed','shipped','closed') DEFAULT 'pending',
        total_price DECIMAL(12,2),
        profit DECIMAL(12,2),
        fee DECIMAL(12,2),
        sector VARCHAR(100),
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS transaction_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        details TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS partner_shares (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        partner_id INT NOT NULL,
        percentage DECIMAL(5,2),
        amount DECIMAL(12,2),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id),
        FOREIGN KEY (partner_id) REFERENCES partners(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subject VARCHAR(150),
        message TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('open','closed') DEFAULT 'open',
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS support (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('open','closed') DEFAULT 'open',
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        transaction_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        message TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(100),
        details TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """
]

# Connect to SQLite database (creates it if it doesn't exist)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Execute each SQL statement
for sql in sql_statements:
    cursor.execute(sql)

# Commit changes and close connection
conn.commit()
conn.close()

print("Database schema created successfully.")