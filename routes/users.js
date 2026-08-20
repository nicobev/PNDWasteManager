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

// PUT /api/users/password 
// Updates the password for a user account. Requires the user to be authenticated and have the appropriate role.
// per Fig. 5, Supervisor-only RBA for resetting *others*, but any user can change their own password.
// So, we check if the user is a Supervisor or if they are changing their own password.

router.put("/password",express.json(),async (req, res) => {
    const { newpassword, userid:targetedUserId } = req.body;
    const requestedUserId = targetedUserId ?? req.user?.userid;

    const isSelf = requestedUserId === req.user?.userid;
    const isSupervisor = req.user?.role === 'Supervisor';
    try{
        if(!isSelf && !isSupervisor){
            return res.status(403).json({ error: "You can only reset your own password unless you are a Supervisor." });
        }

        if (!newpassword || newpassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters." });
        }

        const hashedPassword = await bcrypt.hash(newpassword, 10);

        const result = await db.query(
            'UPDATE public.useraccount SET passwordhash = $1 WHERE userid = $2',
            [hashedPassword,requestedUserId]
        );

        res.status(200).json({ message: "Password updated successfully." });
    }catch(err){
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }


});

module.exports = router;