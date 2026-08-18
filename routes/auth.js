const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// hashing function
async function hashPassword(plainPassword){
    try{
        return await bcrypt.hash(plainPassword,10);
    }catch(err){
        console.log("Error hashing password: ",err)
        throw(err);
    }
}

// POST api/auth/login/
router.post('/login', express.json(), async (req,res) => {
    const {username,password} = req.body;

    try{
        const passwordresult = await db.query(`
           SELECT passwordhash,role,userid
           FROM useraccount
           WHERE username = $1`,[username]
        );

        if (passwordresult.rows.length === 0){
            return res.status(404).json({ error: "User not found."});
        }

        const hashedpassword = passwordresult.rows[0].passwordhash;
        const isMatch = bcrypt.compare(password,hashedpassword);

        if( isMatch ){
            const payload = {
                userid  : passwordresult.rows[0].userid,
                role    : passwordresult.rows[0].role
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: '1h' });
            res.json({ token:token });
        }else{
            console.log("Invalid password.")
            return res.status(401).json({ error: "Invalid Credentials."});
        }

    }catch(err){
        console.log("Error logging in: ", err);
        res.status(500).json({ error: "Internal Server Error"});
    }
});

module.exports = router;