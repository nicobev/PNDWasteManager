const express = require('express');
const app = express();
const port = 3000;

const db = require('./db');
const logsRouter = require('./routes/logs');
const reportsRouter = require('./routes/reports');

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

// Log routes
app.use('/api/logs', logsRouter);

// Report routes
app.use('/api/reports', reportsRouter);