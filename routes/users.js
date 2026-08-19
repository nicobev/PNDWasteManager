const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { isRole } = require('../middleware/auth');


// User creation route: POST /api/users
// Creates a user account AND an employee record.
// Was combined because realistically, one form
// would be used to create both..

router.post("/",isRole(['Supervisor']),express.json(),async (req, res) => {
    const { firstname, lastname, position, username, password, role } = req.body;
    const client = await db.getClient();

    try{
        await client.query('BEGIN');

        const employeeResult = await client.query(
            'INSERT INTO public.employee (firstname, lastname, position) VALUES ($1, $2, $3) RETURNING *',
            [firstname, lastname, position]
        );
        const employee_id = employeeResult.rows[0].employeeid;

        const hashedPassword = await bcrypt.hash(password, 10);
        let verifiedRole = 'None'; // Default role if not provided or invalid
        if(['Supervisor', 'Employee'].includes(role)){
           verifiedRole = role;
        }

        const accountResult = await client.query(
            'INSERT INTO public.useraccount (username, passwordhash, role, status, creationtimestamp, employeeid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, hashedPassword, verifiedRole, 'Active', new Date(), employee_id]
        );

        await client.query('COMMIT');


        res.status(201).json({ userid: accountResult.rows[0].userid, employeeid: employee_id });

    }catch(err){
        await client.query('ROLLBACK');
        console.error('Error creating user/employee:', err);
        res.status(500).json({ error: 'Internal server error' });
    }finally{
        client.release();
    }
});

module.exports = router;