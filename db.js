const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => {
      const p = new Pool({
        connectionString: process.env.DATABASE_URL
      });
      return p.connect();
    },
    pool
}