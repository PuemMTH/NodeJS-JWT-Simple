require('dotenv').config();
const express = require('express');
const { EXPRESS_PORT } = process.env;
const db = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const auth = require('./middleware/auth');

global.db = db;
const { check } = require('./model/model');
check();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'));

// app.use(function(req, res, next) {
//     res.header(
//         "Access-Control-Allow-Headers",
//         "x-access-token, Origin, Content-Type, Accept"
//     );
//     next();
// });

app.get('/welcome', auth, (req, res) => {
    res.json({
        message: 'Welcome to the API',
        user: req.user
    })
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({
            message: 'Please provide email and password',
            success: false,
            body: req.body
        });
    }

    if(email && password){
        (async () => {
            // const user = db.query(`SELECT * FROM jwt_users WHERE email = '${email}'`);
            // decpassword = await bcrypt.compare(password, password);
            const user = db.query(`SELECT * FROM jwt_users WHERE email = ?`, [email], async (err, result) => {
                if(result.length == 0){
                    res.status(401).json({
                        message: 'Invalid email or password'
                    })
                }
                if(result.length > 0){
                    decpassword = await bcrypt.compare(password, result[0].password);
                    if(decpassword == true){
                        // console.assert(decpassword == true);
                         const token = jwt.sign(
                            {
                                first_name: result[0].first_name,
                                last_name: result[0].last_name,
                                email: result[0].email
                            },
                            process.env.TOKEN_KEY,
                            {
                                expiresIn: '2h'
                            }
                        )
                        db.query(`UPDATE jwt_users SET token = ? WHERE email = ?`, [token, email], (err, result) => {
                            if(err){
                                res.status(500).json({
                                    message: 'Internal server error'
                                })
                            }
                            if(result){
                                res.setHeader('x-access-token', token);
                                res.redirect(`/welcome&token=${token}`);
                            }
                        });
                    }else{
                        res.status(401).json({
                            message: 'Invalid email or password'
                        })
                    }
                }
            });

        })();
    }
});

app.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    if(!first_name || !last_name || !email || !password) {
        res.status(400).send('Invalid Request');
    }

    await db.query('SELECT * FROM `jwt_users` WHERE `email` = ?', [email], function(err, result) {
        // if (err) throw err;
        if(result.length > 0) {
            res.status(400).json({
                message: 'User already exists',
                data: []
            });
        }
        if(result.length == 0) {
            bcrypt.hash(password, 10, async (err, hash) => {
                if(err) {
                    res.status(500).json({
                        message: 'Error hashing password',
                        data: [{
                            msg : err
                        }]
                    });
                }
                if(!err) {
                    const token = jwt.sign(
                        {
                            first_name,
                            last_name,
                            email
                        },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: '2h'
                        }
                    );
                    db.query('INSERT INTO `jwt_users` (`first_name`, `last_name`, `email`, `password`, `token`) VALUES (?, ?, ?, ?, ?)', 
                            [first_name, last_name, email, hash, token], function(err, result) {
                        if (err) throw err;
                        res.status(200).json({
                            message: 'User created successfully',
                            data: [{
                                first_name,
                                last_name,
                                email,
                                token
                            }]
                        });
                    });
                }
            });
        }
    });
    

    // await db.query('INSERT INTO `jwt_users` (`first_name`, `last_name`, `email`, `password`) VALUES (?, ?, ?, ?)', [first_name, last_name, email.toLowerCase() , encryptpw], function(err, result) {
    //     // if (err) throw err;
    //     res.status(200).json({
    //         message: 'User registered successfully',
    //         data: result
    //     })
    //     res.end();
    // });

});

app.listen(EXPRESS_PORT, () => {
    console.log(`Server is running on port ${EXPRESS_PORT}`);
});


