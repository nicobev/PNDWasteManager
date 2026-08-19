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

const isRole = function(roles){
    return function(req, res, next){
        if(!req.user){
            return res.status(401).json({error: "Unauthorized: User information missing"});
        }else{
            if(roles.includes(req.user.role)){
                next();
            } else {
                return res.status(403).json({error: "Forbidden: You do not have the required role to access this resource."});
            }
        }
    };
}

module.exports = {verifyToken, isRole};