const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({message:"Access Denied: No Auth Token Provided."});
    }

    try{
        const decodedPayload = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decodedPayload;

        next();
    }catch(err){
        return res.status(401).json({error: "Invalid or Expired Token"});
    }
}

const isSupervisor = (req,res,next) => {
    if (req.user?.role !== 'supervisor') {
        return res.status(403).json({ error: 'Supervisor access required' });
    }
    next();
}

module.exports = {verifyToken, isSupervisor};