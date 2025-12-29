const express = require('express');
const app = express();
const path = require('path');
const productsRouter = require('./routes/products'); // if separate

app.use(express.static(path.join(__dirname, '..'))); // Serve static frontend files from root

app.use('/api/products', productsRouter); // Mount products API

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));