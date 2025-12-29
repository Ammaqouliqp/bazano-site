const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Serve static files from the project root (where products.html is)
app.use(express.static(path.join(__dirname, '..')));

// Database path
const dbPath = path.join(__dirname, 'data', 'database.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Cannot connect to database:', err.message);
  } else {
    console.log('Connected to database successfully.');
  }
});

// API: Get all products
app.get('/api/products', (req, res) => {
  const query = `
    SELECT id, brand, name, description, price_exit, category, quantity 
    FROM products 
    ORDER BY id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    rows.forEach(row => {
      row.price_exit_formatted = Number(row.price_exit).toLocaleString('fa-IR') + ' تومان';
      row.full_title = row.brand ? `${row.brand} ${row.name}` : row.name;
      row.image = `assets/img/products/product-img-${row.id}.jpg`;
    });

    res.json(rows);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`🌐 Open your site: http://localhost:${PORT}/products.html`);
  console.log(`🔍 Test API: http://localhost:${PORT}/api/products\n`);
});