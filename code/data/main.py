import sqlite3

DB_PATH = "database.db"

def add_images_column():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if the column already exists
    cursor.execute("PRAGMA table_info(products)")
    columns = [col[1] for col in cursor.fetchall()]

    if "images" not in columns:
        cursor.execute("""
            ALTER TABLE products
            ADD COLUMN images TEXT
        """)
        conn.commit()
        print("Column 'images' added successfully.")
    else:
        print("Column 'images' already exists.")

    conn.close()

if __name__ == "__main__":
    add_images_column()
