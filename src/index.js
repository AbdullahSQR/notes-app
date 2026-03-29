const express = require('express')
const mysql = require('mysql2')
const session = require('express-session')
const Keycloak = require('keycloak-connect')

const memoryStore = new session.MemoryStore()

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}))

const keycloak = new Keycloak({ store: memoryStore }, {
    realm: 'notes-app',
    'auth-server-url': 'http://keycloak:8080',
    resource: 'notes-app',
    'bearer-only': true
})

app.use(keycloak.middleware())

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
})

db.query(`
    CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note TEXT NOT NULL
    )
`)

app.get('/notes', (req, res) => {
    db.query('SELECT * FROM notes', (err, results) => {
        const notes = results || []
        res.json(results)
    })
})

app.post('/notes', (req, res) => {
    const { note } = req.body
    db.query('INSERT INTO notes (note) VALUES (?)', [note], (err) => {
        res.redirect('/notes')
    })
})

app.listen(3000, () => {
    console.log('App running on port 3000')
})
