const express = require('express');
const app = express();
const port = 3000;

const db = require('./db');

// Test database connection
async function testDbConnection() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

// test GET route
app.get('/', (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  testDbConnection();
});

// GET /api/logs route to fetch logs from the database and returns them as JSON
app.get('/api/logs', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM foodwastelog');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});