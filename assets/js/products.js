router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { seller_id, brand, name, description, manufacture_date, expire_date,
          quantity, price_entry, price_exit, category } = req.body;
  db.run(
    `INSERT INTO products 
     (seller_id, brand, name, description, manufacture_date, expire_date, quantity, price_entry, price_exit, category) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [seller_id, brand, name, description, manufacture_date, expire_date, quantity, price_entry, price_exit, category],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product created successfully', id: this.lastID });
    }
  );
});