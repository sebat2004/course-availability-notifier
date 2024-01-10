const express = require('express')
const cors = require('cors')
const app = express()
const pgp = require('pg-promise')(/* options */)
const env = require('dotenv').config().parsed
app.use(express.json())

const connection = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    max: 30 // use up to 30 connections
}
const db = pgp(connection)

app.use(cors())

console.log("Incoming Request!");

app.get('/api', (req, res) => {
    console.log("Hello World!");
    res.send('Hello World!');
})

app.get('/api/users', (req, res) => {
    console.log("Users requested!!");
    res.send('Users!');
})

app.post('/api/users', (req, res) => {
    console.log("User added!!");
    console.log(req.body)
    res.send('Added User!');
})

app.get('/api/waitlists', (req, res) => {
    console.log("Waitlist requested!!");
    res.send('Waitlist!');
})

app.post('/api/waitlists', (req, res) => {
    db.one('INSERT INTO waitlists(requestor, crn, srcdb, groups, matched) VALUES($1, $2, $3, $4, $5) RETURNING id', [req.body.requestor, req.body.crn, req.body.srcdb, req.body.group, req.body.matched])
        .then(data => {
            console.log('DATA:', data.id)
            res.send('Added Waitlist!');
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send(error);
        })
    
})

const port = env.PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

