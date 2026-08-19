const express = require('express');
const app = express();
const port = 3000;

const db = require('./db');
const proxy = require('./proxy')
const middleware =  require('./middleware/auth');


// Test database connection
async function testDbConnection() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
  } catch (err) {
    // If the database connection fails, try to start the proxy server and then test the connection again
    console.error('Database connection failed:', err);
    console.log('Attempting to start the proxy server...');
    // routes DB requests through iPhone ethernet when on work wifi that blocks direct Postgres connections
    try {
      await proxy.connectToProxy();
      console.log('Proxy server started successfully. Retesting database connection...');
      const result = await db.query('SELECT NOW()');
      console.log('Database connection successful:', result.rows[0]);
    } catch (proxyErr) {
      console.error('Failed to start proxy server or connect to database:', proxyErr);
    }
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


// Auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth',authRouter);

app.use(middleware.verifyToken); // Apply authentication middleware to all routes below
// DO NOT MOVE THIS ABOVE THE AUTH ROUTES, OTHERWISE LOGIN WILL FAIL.

// Log routes
const logsRouter = require('./routes/logs');
app.use('/api/logs', logsRouter);

// Report routes
const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);

// User routes
const userRouter = require('./routes/users');
app.use('/api/users', userRouter);