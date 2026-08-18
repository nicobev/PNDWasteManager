const express = require('express');
const router = express.Router();
const db = require('../db');

const { getEmployeeId,bulkInsert } = require('../utils/helpers');


// POST api/reports route to generate a report of food waste logs within a specified date range
router.post('/',isSupervisor, express.json(), async (req, res) => {
  const { report_type, trend_type, start_date, end_date, category } = req.body;
  try{
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User information missing' });
    }
    const user_id = user.userid;

    const employee_id = await getEmployeeId(db, user_id);
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

    await bulkInsert(db, 'foodwastereportdetail',
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
router.get('/:id/summary', async (req, res) => {
  const reportId = req.params.id;
  try {
    // include order by parameter later, for now just order by creationtimestamp
    const report_summary_result = await db.query(
      `SELECT reportid, reporttype, creationtimestamp, totalweight, totalvalue
       FROM foodwastereport
       WHERE reportid = $1
       ORDER BY creationtimestamp DESC`,
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
router.get('/:id/details', async (req, res) => {
  const reportId = req.params.id;
  try {
    // include order by parameter later, for now just order by logid
    const report_details_result = await db.query(
      `SELECT frd.ingredientid, i.ingredientname, i.category,
              SUM(frd.wasteweight) AS total_weight,
              SUM(frd.wastevalue) AS total_value
       FROM foodwastereportdetail frd
       JOIN ingredient i ON frd.ingredientid = i.ingredientid
       WHERE frd.reportid = $1
       GROUP BY frd.ingredientid, i.ingredientname, i.category
       ORDER BY total_weight DESC`,
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

module.exports = router;