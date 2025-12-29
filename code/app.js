const express = require('express');
const app = express();

app.use(express.json());

// Register routes
app.use('/users', require('./routes/users'));

module.exports = app;