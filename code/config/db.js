const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// point to your database file
const dbPath = path.resolve(__dirname, '../data/database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

module.exports = db;