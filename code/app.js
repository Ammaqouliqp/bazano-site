const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'data/database.db'));
const PORT = 3000;
const JWT_SECRET = 'your_secret_key'; // CHANGE IN PRODUCTION!
const SALT_ROUNDS = 10;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

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
  db.run('INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)', [userId, action, details, ip || 'unknown']);
};

// ==================== API ROUTES ====================

// User info
app.get('/api/users/me', authenticate, (req, res) => {
  db.get('SELECT firstname, lastname, phonenumber, email FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'کاربر یافت نشد' });
    res.json(row);
  });
});

app.get('/api/wallets/me', authenticate, (req, res) => {
  db.get('SELECT balance FROM wallets WHERE user_id = ?', [req.user.id], (err, row) => {
    if (err || !row) return res.json({ balance: 0 });
    res.json(row);
  });
});

// OTP Store
const otpStore = {};

// Send OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: 'شناسه لازم است' });

  const normalized = identifier.trim();

  db.get('SELECT id FROM users WHERE phonenumber = ?', [normalized], (err, user) => {
    if (err) return res.status(500).json({ error: 'خطا در سرور' });

    const testCode = '123456';

    otpStore[normalized] = {
      code: testCode,
      exists: !!user,
      userId: user ? user.id : null
    };

    console.log(`OTP for ${normalized}: ${testCode} (exists: ${!!user})`);

    res.json({ message: 'کد ارسال شد', testCode });
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { identifier, code } = req.body;
  if (!identifier || !code) return res.status(400).json({ error: 'اطلاعات ناقص' });

  const normalized = identifier.trim();
  const stored = otpStore[normalized];

  if (!stored || stored.code !== code) {
    return res.status(400).json({ error: 'کد اشتباه یا منقضی شده' });
  }

  if (stored.exists) {
    const token = jwt.sign({ id: stored.userId }, JWT_SECRET, { expiresIn: '24h' });
    delete otpStore[normalized];
    res.json({ token, action: 'login' });
  } else {
    delete otpStore[normalized];
    res.json({ action: 'register', identifier: normalized });
  }
});

// Register - all users are buyers
app.post('/api/register', async (req, res) => {
  const { firstname, lastname, phonenumber, email, password } = req.body;

  if (!firstname || !lastname || !phonenumber || !password) {
    return res.status(400).json({ error: 'اطلاعات ضروری ناقص است' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (firstname, lastname, phonenumber, email, password) VALUES (?, ?, ?, ?, ?)',
      [firstname, lastname, phonenumber, email || null, hashed],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'این شماره تلفن قبلاً ثبت شده' });
          }
          return res.status(500).json({ error: 'خطا در ثبت نام' });
        }

        const userId = this.lastID;

        // All users are buyers
        db.run('INSERT INTO user_roles (user_id, role) VALUES (?, ?)', [userId, 'buyer']);
        db.run('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [userId]);

        const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'خطا در سرور' });
  }
});

// Password login
app.post('/api/login', (req, res) => {
  const { phonenumber, password } = req.body;
  db.get('SELECT * FROM users WHERE phonenumber = ?', [phonenumber], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'اطلاعات اشتباه' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    logAction(user.id, 'login', `Login from ${req.ip}`, req.ip);
    res.json({ token });
  });
});

// Products (public view, seller manage)
app.get('/api/products', (req, res) => {
  let query = 'SELECT * FROM products';
  let params = [];
  if (req.query.seller === 'true' && req.user) {
    query += ' WHERE seller_id = ?';
    params.push(req.user.id);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});
// Single product by ID
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'محصول یافت نشد' });
    res.json(row);
  });
});
// Transactions
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
    res.json(rows || []);
  });
});

// Requests - buyer sees own
app.get('/api/requests', authenticate, (req, res) => {
  if (req.query.buyer === 'true') {
    db.all('SELECT * FROM requests WHERE user_id = ?', [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(rows || []);
    });
  } else {
    checkRole(['support', 'admin'])(req, res, () => {
      db.all('SELECT * FROM requests', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
      });
    });
  }
});

// Logs (admin only)
app.get('/api/logs', authenticate, checkRole(['admin']), (req, res) => {
  db.all('SELECT * FROM logs ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// ==================== STATIC FILES LAST ====================
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});