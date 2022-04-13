var bodyParser = require('body-parser')
const config = process.env;
const jwt = require('jsonwebtoken');
const db = require('../config/database');

verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    
    try {
        const decoded = await jwt.verify(token, config.TOKEN_KEY);
        // await db.query(`SELECT * FROM jwt_users WHERE email = ?`, [decoded.email], async (err, result) => {
        //     if (err) throw err;
        //     if (result.length == 0) {
        //         return res.status(401).json({ msg: 'Invalid token' });
        //     }
        //     const jwt_users = await decoded;
        //     req.user = jwt_users;
        //     next();
        // });
        db.query(`SELECT * FROM jwt_users WHERE email = ?`, [decoded.email])
        .then(result => {
            if (result.length == 0) {
                return res.status(401).json({ msg: 'Invalid token' });
            }
            const jwt_users = decoded;
            req.user = jwt_users;
            return next();
        });
        
    } catch (err) {
        res.status(401).json({ 
                msg: 'Token is not valid'
            });
    }
    return next();
}

module.exports = verifyToken;