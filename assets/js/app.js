const express = require('express');
const productsRouter = require('./routes/products');
const app = express();

app.use(express.json());

// Register routes
app.use('/users', require('./routes/users'));
app.use('/products', productsRouter);

module.exports = app;   