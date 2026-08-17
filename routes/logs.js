const express = require('express');
const router = express.Router();
const db = require('../db');

const { validateQuantity } = require('../utils/validation');
const { getEmployeeId } = require('../utils/helpers');

// GET /api/logs route to fetch logs from the database and returns them as JSON
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM foodwastelog');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/logs route to insert a new log into the database
router.post('/', express.json(), async (req, res) => {
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

      const quantityCheck = validateQuantity(quantity);
      if (!quantityCheck.valid) {
        return res.status(400).json({ error: quantityCheck.error });
      }

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
router.put('/:id', express.json(), async (req, res) => {
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
      if (ingredient_result.rows.length === 0) {
        return res.status(404).json({ error: 'Ingredient not found' });
      }

      const cost_per_unit = ingredient_result.rows[0].costperunit;
      
      // If the quantity is not provided, assume it is the same as the existing quantity in the log
      if (quantity === undefined) {
        quantity = existing_log_result.rows[0].wasteweight;
      }

      const quantityCheck = validateQuantity(quantity);
      if (!quantityCheck.valid) {
        return res.status(400).json({ error: quantityCheck.error });
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
router.delete('/:id', async (req, res) => {
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
// ^...Should this exist?
// Arguably, no, but it is useful for testing purposes, and can be removed later if needed.

module.exports = router;