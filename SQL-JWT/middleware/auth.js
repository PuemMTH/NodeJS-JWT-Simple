var bodyParser = require('body-parser')
const config = process.env;
const jwt = require('jsonwebtoken');
const db = require('../config/database');

verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    
    try {
        const decoded = await jwt.verify(token, config.TOKEN_KEY);
        if(decoded.exp < Date.now()){
            return res.status(401).json({ 
                msg: 'Token has expired',
                // DateNow: Date.now(),
                DateNowFormat: (new Date().getTime() + 1) / 1000,
                exp: decoded.exp
            });
        }
        
        const jwt_users = await decoded;
        req.user = jwt_users;
        // next();
        const q =  await db.query(`SELECT * FROM jwt_users WHERE email = ? LIMIT 1`, [decoded.email]);
        console.log(q);
        for(let i = 0; i < q.length; i++){
            if(q[i].email == decoded.email){
                next();
            }
        }

        // if(q.length == 0){
        //     return res.status(401).json({ msg: 'Invalid token' });
        // }else{
        //     console.log("Success");
        //     // next();
        // }
        // .then(result => {
        //     if (result.length == 0) {
        //         return res.status(401).json({ msg: 'Invalid token' });
        //     }
        //     const jwt_users = decoded;
        //     req.user = jwt_users;
        //     return next();
        // });
    } catch (err) {
        res.status(401).json({ 
                msg: 'Token is not valid'
            });
    }
    return next();
}

module.exports = verifyToken;