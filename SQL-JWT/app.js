require('dotenv').config();
const express = require('express');
const { EXPRESS_PORT } = process.env;
const db = require('./config/database');
const jwt = require('jsonwebtoken');
global.db = db;
const { check } = require('./model/model');
check();

const app = express();
app.use(express.json());
app.use(express.static('public'));


// app.get('/login', (req, res) => {
//     res.send('Hello World');
// });

app.get('/register', (req, res) => {
    if(!req.body.name || !req.body.lastname || !req.body.email || !req.body.password) {
        res.status(400).send('Invalid Request');
    }
    res.send('Hello World');
});
app.listen(EXPRESS_PORT, () => {
    console.log(`Server is running on port ${EXPRESS_PORT}`);
});


