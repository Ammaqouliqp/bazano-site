const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all users
router.get('/', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST create a new user
router.post('/', (req, res) => {
  const { firstname, lastname, phonenumber, password } = req.body;
  db.run(
    'INSERT INTO users (firstname, lastname, phonenumber, password) VALUES (?, ?, ?, ?)',
    [firstname, lastname, phonenumber, password],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'User created successfully', id: this.lastID });
      }
    }
  );
});

module.exports = router;