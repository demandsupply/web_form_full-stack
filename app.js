const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
const nodemailer = require('nodemailer');
const { text } = require('body-parser');
const {body, validationResult } = require('express-validator');


const port = 3000;
const server = express();


// usa il middleware "express.json()" per interpretare correttamente i JSON ricevuti
server.use(express.json())

// usa il middleware "express.static" per servire i file statici dalla cartella specificata
server.use(express.static(path.join(__dirname, 'public')));

// crea db per salvataggio dati form
db.run("CREATE TABLE IF NOT EXISTS data (nome TEXT, cognome TEXT, indirizzo TEXT, cf TEXT, nascita TEXT, provincia TEXT, comune TEXT, cellulare TEXT, email TEXT)")

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.post('/submit',
    (req, res) => {
    const formData = req.body;
    console.log("dati ricevuti: ", formData)

    // inserisci i dati del form nel db
    db.serialize(() => {
        const stmt = db.prepare(
            "INSERT INTO data VALUES ($nome, $cognome, $indirizzo, $cf, $nascita, $provincia, $comune, $cellulare, $email)",
            {
                $nome: formData.nome,
                $cognome: formData.cognome,
                $indirizzo: formData.indirizzo,
                $cf: formData.cf,
                $nascita: formData.nascita,
                $provincia: formData.provincia,
                $comune: formData.comune,
                $cellulare: formData.cellulare,
                $email: formData.email,
            }
        );
        stmt.run()
        stmt.finalize()
    })

});


// avvia server
server.listen(port, (err) => {
    if (err) {
        console.error('errore ', err)
        process.exit();
    }
    console.log("Server in ascolto su porta " + port + "!");
})
