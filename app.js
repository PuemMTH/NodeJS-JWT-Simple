require('dotenv').config();
require('./config/database').connect();

const express = require('express');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({
            message: 'Please provide email and password'
        });
    }

    const user = await User.findOne({ email });

    if(user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({
            id: user._id,
            email
        }, process.env.TOKEN_KEY, {
            expiresIn: '2h'
        });

        user.token = token;

        return res.status(200).json({
            message: 'Login successful',
            user
        });
    }

    return res.status(401).json({
        message: 'Invalid email or password'
    });

});

app.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const user = new User({
        first_name,
        last_name,
        email,
        password
    });

    if(!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            message: 'Please fill all the fields'
        });
    }

    const checkoldUser = await User.findOne({ email });
    if(checkoldUser) {
        return res.status(400).json({
            message: 'User already exists'
        });
    }

    // encrypt password
    encryptpw = await bcrypt.hash(password, 10);

    // create user in database 
    const users = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(),
        password: encryptpw
    })

    const token = jwt.sign(
        {userId: users._id, email: users.email},
        process.env.TOKEN_KEY,
        {expiresIn: '2h'}
    );

    users.token = token;
    
    res.status(201).json(users);
});

app.get('/welcome', auth, async (req, res) => {
    // const users = await User.find({});
    const user = await User.findOne({
        // finds the user with the token
        // token: req.headers.authorization.split(' ')[1]
    })
    res.status(200).json(user);
});


module.exports = app;