const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '../data/products.json');

// Simple JSON DB (create this file if not exists)
router.get('/', (req, res) => {
  fs.readFile(productsFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read products' });
    res.json(JSON.parse(data));
  });
});

module.exports = router;