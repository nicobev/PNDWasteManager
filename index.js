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

// POST /api/logs route to insert a new log into the database
app.post('/api/logs', express.json(), async (req, res) => {
    const { ingredient_id, quantity, user_id } = req.body;
    
    try {
      const ingredient_result = await db.query('SELECT costperunit FROM public.ingredient WHERE ingredientid = $1', [ingredient_id]);
      const employee_id = await getEmployeeId(user_id);

      if (employee_id === null) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      if (ingredient_result.rows.length === 0) {
        return res.status(404).json({ error: 'Ingredient not found' });
      }

      
      const cost_per_unit = ingredient_result.rows[0].costperunit;

      const result = await db.query(
            'INSERT INTO public.foodwastelog (entrytimestamp, modificationflag, wasteweight, wastevalue, ingredientid, employeeid, userid, lastmodifiedtimestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, NULL) RETURNING *',
            [new Date(), false, quantity, cost_per_unit * quantity, ingredient_id, employee_id, user_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting log:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/logs/:id route to update an existing log in the database
app.put('/api/logs/:id', express.json(), async (req, res) => {
    const logId = req.params.id;
    let { ingredient_id, quantity, user_id } = req.body;

    // Record user_id for later, will setup a more robust logging system in the future
    // ^^^ Meaning to log who edits the log, and who created the log, when each edit
    // was made, and what was changed. This will be useful for auditing purposes in the future.
    // but for now, user_id is just gonna be used for authentication and authorization purposes
    // later.

    try {
      const existing_log_result = await db.query('SELECT ingredientid,wasteweight FROM public.foodwastelog WHERE logid = $1', [logId]);
      if (existing_log_result.rows.length === 0) {
        return res.status(404).json({ error: 'Log not found' });
      }

      const employee_id = await getEmployeeId(user_id);
      if (employee_id === null) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      // employee_id is intentionally unused for now,
      // is kept to ensure that the user_id provided is
      // valid and corresponds to an employee in the system.
      // In the future, this can be used for logging who made
      // the changes to the log.

      // If ingredient_id is not provided, fetch the existing ingredient_id from the log
      if (ingredient_id === undefined) {
        ingredient_id = existing_log_result.rows[0].ingredientid;
      }
      const ingredient_result = await db.query('SELECT costperunit FROM public.ingredient WHERE ingredientid = $1', [ingredient_id]);


      const cost_per_unit = ingredient_result.rows[0].costperunit;
      
      // If the quantity is not provided, assume it is the same as the existing quantity in the log
      if (quantity === undefined) {
        quantity = existing_log_result.rows[0].wasteweight;
      }

      const result = await db.query(
          'UPDATE public.foodwastelog SET modificationflag = $1, wasteweight = $2, wastevalue = $3, ingredientid = $4, lastmodifiedtimestamp = $5 WHERE logid = $6 RETURNING *',
          [true, quantity, cost_per_unit * quantity, ingredient_id, new Date(), logId]
      );

      res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating log:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

});

// DELETE /api/logs/:id route to delete a log from the database
app.delete('/api/logs/:id', async (req, res) => {
    const logId = req.params.id;

    try {
        const result = await db.query('DELETE FROM public.foodwastelog WHERE logid = $1 RETURNING *', [logId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.status(200).json({ message: 'Log deleted successfully' });
    } catch (err) {
        console.error('Error deleting log:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to bulk insert rows into any table
async function bulkInsert(table, columns, rows) {
  if (rows.length === 0) return; // No rows to insert

  // Placeholder groups
  const placeholders = rows.map((_, rowIndex) => {
    const startIndex = rowIndex * columns.length + 1;
    const rowPlaceholders = columns.map((_, colIndex) => `$${startIndex + colIndex}`);
    return `(${rowPlaceholders.join(', ')})`;
  }).join(', ');

  // Flatten the rows values into a single array for parameterized query
  const values = rows.flatMap(row => columns.map(col => row[col]));
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
  
  try {
    await db.query(query, values);
  } catch (err) {
    console.error(`Error bulk inserting into ${table}:`, err);
    throw err; // Rethrow the error to be handled by the caller
  }
}

// Helper function to get employee_id from user_id
async function getEmployeeId(user_id) {
  try {
    const employee_result = await db.query('SELECT employeeid FROM public.useraccount WHERE userid = $1', [user_id]);
    return employee_result.rows.length > 0 ? employee_result.rows[0].employeeid : null;
  }catch (err) {
    console.error(`Error fetching employee ID for user ${user_id}:`, err);
    return null; // Return null if there's an error fetching the employee ID
  }
}


// POST api/reports route to generate a report of food waste logs within a specified date range
app.post('/api/reports', express.json(), async (req, res) => {
  const { report_type, trend_type, start_date, end_date, category, user_id } = req.body;
  try{
    const employee_id = await getEmployeeId(user_id);
    if (employee_id === null) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Build the query based on the report_type
    let query = `
      SELECT fl.logid, fl.ingredientid, fl.wasteweight, fl.wastevalue
      FROM foodwastelog fl
      JOIN ingredient i ON fl.ingredientid = i.ingredientid
      WHERE 1=1
    `;
    let params = [];

    // Daily, Timed, and Trend reports are handled differently based on the report_type
    if (report_type === 'Daily'){
      query += ' AND DATE(fl.entrytimestamp) = CURRENT_DATE';
    }

    if (report_type === 'Timed') {
      query += ` AND fl.entrytimestamp BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(start_date, end_date);
    }

    if (report_type === 'Trend') {
      let rangeStart;
      const rangeEnd = new Date();
      if (trend_type === 'Yearly') rangeStart = new Date(new Date().setFullYear(rangeEnd.getFullYear() - 1));
      if (trend_type === 'Monthly') rangeStart = new Date(new Date().setMonth(rangeEnd.getMonth() - 1));
      if (trend_type === 'Weekly') rangeStart = new Date(new Date().setDate(rangeEnd.getDate() - 7));

      query += ` AND fl.entrytimestamp BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(rangeStart, rangeEnd);
    }

    // If a category is provided, filter by category on top of the existing query
    if (category) {
      query += ` AND i.category = $${params.length + 1}`;
      params.push(category);
    }


    const logs_result = await db.query(query, params);
    if (logs_result.rows.length === 0) {
      return res.status(404).json({ error: 'No logs found for the specified criteria' });
    }

    // Calculate total waste weight and value
    const total_waste_weight = logs_result.rows.reduce((sum, log) => sum + parseFloat(log.wasteweight), 0);
    const total_waste_value = logs_result.rows.reduce((sum, log) => sum + parseFloat(log.wastevalue), 0);

    // Insert the report into the reports table
    const report_result = await db.query(
      `INSERT INTO foodwastereport (reporttype, creationtimestamp, totalweight, totalvalue, employeeid)
      VALUES ($1, $2, $3, $4, $5) RETURNING reportid`,
      [report_type, new Date(), total_waste_weight, total_waste_value, employee_id]
    );
    const reportId = report_result.rows[0].reportid;

    await bulkInsert('foodwastereportdetail',
      ['reportid', 'logid', 'ingredientid', 'wasteweight', 'wastevalue'],
      logs_result.rows.map(log => ({
        reportid: reportId,
        logid: log.logid,
        ingredientid: log.ingredientid,
        wasteweight: log.wasteweight,
        wastevalue: log.wastevalue
      }))
    );

    res.status(201).json({ reportid: reportId, totalweight: total_waste_weight, totalvalue: total_waste_value });
  }catch (err) {
    console.error('Error generating report:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/:id/summary to fetch a summary of a specific report by its ID
app.get('/api/reports/:id/summary', async (req, res) => {
  const reportId = req.params.id;
  try {
    const report_summary_result = await db.query(
      `SELECT reportid, reporttype, creationtimestamp, totalweight, totalvalue
       FROM foodwastereport
       WHERE reportid = $1`,
      [reportId]
    );

    if (report_summary_result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(200).json(report_summary_result.rows[0]);
  } catch (err) {
    console.error('Error fetching report summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/:id/details to fetch detailed logs of a specific report by its ID
app.get('/api/reports/:id/details', async (req, res) => {
  const reportId = req.params.id;
  try {
    const report_details_result = await db.query(
      `SELECT frd.logid, frd.ingredientid, frd.wasteweight, frd.wastevalue
       FROM foodwastereportdetail frd
       WHERE frd.reportid = $1`,
      [reportId]
    );
    if (report_details_result.rows.length === 0) {
      return res.status(404).json({ error: 'No details found for this report' });
    }
    res.status(200).json(report_details_result.rows);
  }catch(err) {
    console.error('Error fetching report details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});