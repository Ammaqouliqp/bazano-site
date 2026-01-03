const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const xlsx = require('xlsx'); // For Excel import

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'data/database.db'));
const PORT = 3000;
const JWT_SECRET = 'your_secret_key'; // Change in production
const SALT_ROUNDS = 10;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data if needed
app.use(cors());
app.use(express.static(path.join(__dirname, '..'))); // Serve from root

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const checkRole = (roles) => (req, res, next) => {
  db.get('SELECT role FROM user_roles WHERE user_id = ?', [req.user.id], (err, row) => {
    if (err || !row || !roles.includes(row.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  });
};

// Log action
const logAction = (userId, action, details, ip) => {
  db.run('INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)', [userId, action, details, ip]);
};

// Auth endpoints
app.post('/api/register', async (req, res) => {
  const { firstname, lastname, phonenumber, password, role } = req.body;
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  db.run('INSERT INTO users (firstname, lastname, phonenumber, password) VALUES (?, ?, ?, ?)', [firstname, lastname, phonenumber, hashed], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const userId = this.lastID;
    db.run('INSERT INTO user_roles (user_id, role) VALUES (?, ?)', [userId, role || 'buyer'], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.run('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [userId]); // Init wallet
      db.run('INSERT INTO profiles (user_id) VALUES (?)', [userId]); // Init profile
      logAction(userId, 'register', `New user: ${phonenumber}`, req.ip);
      res.json({ id: userId });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { phonenumber, password } = req.body;
  db.get('SELECT * FROM users WHERE phonenumber = ?', [phonenumber], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, phonenumber: user.phonenumber }, JWT_SECRET, { expiresIn: '1h' });
    logAction(user.id, 'login', `Login from ${req.ip}`, req.ip);
    res.json({ token });
  });
});

// User endpoints
app.get('/api/users/me', authenticate, (req, res) => {
  db.get('SELECT u.*, r.role FROM users u JOIN user_roles r ON u.id = r.user_id WHERE u.id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.get('/api/users', authenticate, checkRole(['admin']), (req, res) => {
  db.all('SELECT u.*, r.role FROM users u JOIN user_roles r ON u.id = r.user_id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/users/:id', authenticate, checkRole(['admin']), (req, res) => {
  const { firstname, lastname, phonenumber } = req.body;
  db.run('UPDATE users SET firstname = ?, lastname = ?, phonenumber = ? WHERE id = ?', [firstname, lastname, phonenumber, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAction(req.user.id, 'update_user', `User ID: ${req.params.id}`, req.ip);
    res.json({ success: true });
  });
});

// Profile endpoints
app.get('/api/profiles/me', authenticate, (req, res) => {
  db.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.put('/api/profiles/me', authenticate, (req, res) => {
  const { email, address, avatar, extra_info } = req.body;
  db.run('UPDATE profiles SET email = ?, address = ?, avatar = ?, extra_info = ? WHERE user_id = ?', [email, address, avatar, extra_info, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAction(req.user.id, 'update_profile', '', req.ip);
    res.json({ success: true });
  });
});

// Wallet endpoints
app.get('/api/wallets/me', authenticate, (req, res) => {
  db.get('SELECT * FROM wallets WHERE user_id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.post('/api/wallets/credit', authenticate, checkRole(['admin', 'seller']), (req, res) => {
  const { user_id, amount } = req.body;
  db.run('UPDATE wallets SET balance = balance + ?, last_update = CURRENT_TIMESTAMP WHERE user_id = ?', [amount, user_id || req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAction(req.user.id, 'credit_wallet', `Amount: ${amount} to user ${user_id || req.user.id}`, req.ip);
    res.json({ success: true });
  });
});

app.post('/api/wallets/debit', authenticate, checkRole(['admin', 'buyer']), (req, res) => {
  const { amount } = req.body;
  db.run('UPDATE wallets SET balance = balance - ?, last_update = CURRENT_TIMESTAMP WHERE user_id = ? AND balance >= ?', [amount, req.user.id, amount], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAction(req.user.id, 'debit_wallet', `Amount: ${amount}`, req.ip);
    res.json({ success: true });
  });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  let query = 'SELECT * FROM products';
  let params = [];
  if (req.query.seller === 'true' && req.user) {
    query += ' WHERE seller_id = ?';
    params.push(req.user.id);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', authenticate, checkRole(['seller', 'admin']), (req, res) => {
  const { brand, name, description, manufacture_date, expire_date, quantity, price_entry, price_exit, category } = req.body;
  db.run('INSERT INTO products (seller_id, brand, name, description, manufacture_date, expire_date, quantity, price_entry, price_exit, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, brand, name, description, manufacture_date, expire_date, quantity, price_entry, price_exit, category], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction(req.user.id, 'add_product', `Product ID: ${this.lastID}`, req.ip);
      res.json({ id: this.lastID });
    });
});

app.put('/api/products/:id', authenticate, checkRole(['seller', 'admin']), (req, res) => {
  const { brand, name, description, manufacture_date, expire_date, quantity, price_entry, price_exit, category } = req.body;
  db.run('UPDATE products SET brand = ?, name = ?, description = ?, manufacture_date = ?, expire_date = ?, quantity = ?, price_entry = ?, price_exit = ?, category = ? WHERE id = ? AND seller_id = ?',
    [brand, name, description, manufacture_date, expire_date, quantity, price_entry, price_exit, category, req.params.id, req.user.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      logAction(req.user.id, 'update_product', `Product ID: ${req.params.id}`, req.ip);
      res.json({ success: true });
    });
});

app.delete('/api/products/:id', authenticate, checkRole(['seller', 'admin']), (req, res) => {
  db.run('DELETE FROM products WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAction(req.user.id, 'delete_product', `Product ID: ${req.params.id}`, req.ip);
    res.json({ success: true });
  });
});

app.post('/api/products/import', authenticate, checkRole(['seller', 'admin']), (req, res) => {
  // Assume file upload via multer or form; for simplicity, assume req.body.excelData as base64 or parse from file
  // Example: const workbook = xlsx.read(req.body.file, { type: 'base64' });
  // Then loop sheets/rows to insert products
  // Placeholder:
  res.json({ success: true, message: 'Excel import not fully implemented; add multer for file upload' });
});

// Transactions endpoints
app.get('/api/transactions', authenticate, (req, res) => {
  let query = 'SELECT * FROM transactions WHERE ';
  let params = [];
  if (req.query.buyer === 'true') {
    query += 'buyer_id = ?';
    params.push(req.user.id);
  } else if (req.query.seller === 'true') {
    query += 'seller_id = ?';
    params.push(req.user.id);
  } else {
    return res.status(400).json({ error: 'Invalid query' });
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transactions', authenticate, checkRole(['buyer']), (req, res) => {
  const { seller_id, items, total_price, profit, fee, sector, buyer_is_member } = req.body; // items: [{product_id, quantity, price}]
  const transactionCode = `TX-${Date.now()}`;
  db.run('INSERT INTO transactions (transaction_code, buyer_id, seller_id, total_price, profit, fee, sector, buyer_is_member) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [transactionCode, req.user.id, seller_id, total_price, profit, fee, sector, buyer_is_member ? 1 : 0], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const txId = this.lastID;
      items.forEach(item => {
        db.run('INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [txId, item.product_id, item.quantity, item.price]);
        // Update product quantity
        db.run('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
      });
      calculateTransaction(txId, req.user.id, seller_id, profit, fee, buyer_is_member); // Calculate
      logAction(req.user.id, 'create_transaction', `TX ID: ${txId}`, req.ip);
      res.json({ id: txId });
    });
});

// Internal calculation function
function calculateTransaction(txId, buyerId, sellerId, profit, fee, buyerIsMember) {
  const netProfit = profit - fee;
  const partnersCredit = netProfit * 0.45;
  const sellerProfit = partnersCredit * 0.15; // Example splits from doc
  const buyerCredit = partnersCredit * 0.25;
  const devTotal = netProfit * 0.55;
  const fixedDevelopment = devTotal * 0.25;
  const temporaryIp = devTotal * 0.15;
  const temporaryManager = devTotal * 0.15;
  const teamTotal = netProfit * 0.45;
  const fixedTeam = teamTotal * 0.20;
  const temporaryHead = teamTotal * 0.10;
  const temporarySelfdev = teamTotal * 0.10;
  const temporaryConsult = teamTotal * 0.05;
  const payoutType = buyerIsMember ? 'cash' : 'purchase_credit';

  db.run(`INSERT INTO transaction_calculations (transaction_id, net_profit, seller_profit, buyer_credit, partners_credit, dev_total, fixed_development, temporary_ip, temporary_manager, team_total, fixed_team, temporary_head, temporary_selfdev, temporary_consult, payout_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [txId, netProfit, sellerProfit, buyerCredit, partnersCredit, devTotal, fixedDevelopment, temporaryIp, temporaryManager, teamTotal, fixedTeam, temporaryHead, temporarySelfdev, temporaryConsult, payoutType], (err) => {
      if (err) console.error(err);
      // Credit wallets (example)
      db.run('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [sellerProfit, sellerId]);
      db.run('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [buyerCredit, buyerId]);
    });

  // Partner calculations (if partners exist; expand with query for partners)
  db.all('SELECT * FROM partners WHERE user_id = ?', [sellerId], (err, partners) => {
    if (err || !partners.length) return;
    let remaining = partnersCredit;
    partners.forEach((partner, index) => {
      const baseShare = remaining / (partners.length - index); // Example logic
      const percentageApplied = 0.10; // From doc example
      const partnerCredit = baseShare * percentageApplied;
      remaining -= partnerCredit;
      db.run('INSERT INTO partner_calculations (transaction_id, partner_id, deal_index, base_share, percentage_applied, partner_credit, remaining) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [txId, partner.id, index + 1, baseShare, percentageApplied, partnerCredit, remaining]);
      db.run('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [partnerCredit, partner.user_id]);
    });
  });
}

app.put('/api/transactions/:id/status', authenticate, checkRole(['seller', 'admin']), (req, res) => {
  const { status } = req.body;
  db.run('UPDATE transactions SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAction(req.user.id, 'update_transaction_status', `TX ID: ${req.params.id} to ${status}`, req.ip);
    res.json({ success: true });
  });
});

// Partners endpoints
app.post('/api/partners', authenticate, checkRole(['seller', 'admin']), (req, res) => {
  const { user_id, details } = req.body;
  db.run('INSERT INTO partners (user_id, details) VALUES (?, ?)', [user_id, details], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Requests, Support, Feedbacks, Suggestions endpoints (similar pattern)
app.post('/api/requests', authenticate, (req, res) => {
  const { subject, message } = req.body;
  db.run('INSERT INTO requests (user_id, subject, message) VALUES (?, ?, ?)', [req.user.id, subject, message], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/api/requests', authenticate, checkRole(['support', 'admin']), (req, res) => {
  db.all('SELECT * FROM requests', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add similar for /api/support, /api/feedbacks, /api/suggestions

// Logs endpoints (admin only)
app.get('/api/logs', authenticate, checkRole(['admin']), (req, res) => {
  db.all('SELECT * FROM logs ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Messaging/Support Chat (simple placeholder; expand with WebSockets for real-time)
app.post('/api/messages', authenticate, (req, res) => {
  const { to_user_id, message } = req.body;
  // Store in support or new messages table
  db.run('INSERT INTO support (user_id, message) VALUES (?, ?)', [to_user_id, message], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/messages', authenticate, (req, res) => {
  db.all('SELECT * FROM support WHERE user_id = ? OR status = "open"', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
