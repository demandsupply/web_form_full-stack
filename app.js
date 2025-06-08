const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
const nodemailer = require('nodemailer');
const { text } = require('body-parser');
const {body, validationResult } = require('express-validator');

require('dotenv').config();

const port = 3000;
const server = express();


// usa il middleware "express.json()" per interpretare correttamente i JSON ricevuti
server.use(express.json())

// usa il middleware "express.static" per servire i file statici dalla cartella specificata
server.use(express.static(path.join(__dirname, 'public')));

// crea db per salvataggio dati form
db.run("CREATE TABLE IF NOT EXISTS data (nome TEXT, cognome TEXT, indirizzo TEXT, cf TEXT, nascita TEXT, provincia TEXT, comune TEXT, cellulare TEXT, email TEXT)")

// gestione mail
// configurazione nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.post('/submit',

    // crea validazione lato backend
    [
        body("nome").matches(/^[a-zA-Zàèéìòù' ]{2,30}$/),
        body("cognome").matches(/^[a-zA-Zàèéìòù' ]{2,30}$/),
        body("nascita")
        .isISO8601()
        .custom((value) => {
            const today = new Date().toISOString().split("T")[0];
            if (value > today) throw new Error("Data futura non valida");

            const nascita = new Date(value);
            const oggi = new Date();
            const anni = oggi.getFullYear() - nascita.getFullYear();
            const m = oggi.getMonth() - nascita.getMonth();
            const maggiorenne =
            anni > 18 ||
            (anni === 18 &&
                (m > 0 || (m === 0 && oggi.getDate() >= nascita.getDate())));
            if (!maggiorenne) throw new Error("Utente minorenne");
            return true;
        }),
        body("cellulare").matches(/^\d{10}$/),
        body("indirizzo").matches(/^[\w\s.,àèéìòù-]{5,50}$/),
        body("cf").matches(/^[A-Z]{6}[0-9]{2}[A-EHLMPR-T][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i),
        body("email").isEmail(),
        body("provincia").notEmpty(),
        body("comune").notEmpty(),
    ],
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("errori di validazione:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

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

    // crea dati e contenuto delle mail da inviare 
    const mailToSystem = {
        from: 'giovanni.zol.24@stud.itsaltoadriatico.it',
        to: 'giovanni.zol.24@stud.itsaltoadriatico.it',
        subject: 'Nuovo form ricevuto',
        text: `
            Ciao sistema, è appena stato compilato un nuovo form.
            
            Ecco i dati inseriti:

            Nome: ${formData.nome}
            Cognome: ${formData.cognome}
            Indirizzo: ${formData.indirizzo}
            CF: ${formData.cf}
            Nascita: ${formData.nascita}
            Provincia: ${formData.provincia}
            Comune: ${formData.comune}
            Cellulare: ${formData.cellulare}
            Email: ${formData.email}

        `
    };

    const mailToUser = {
        from: 'giovanni.zol.24@stud.itsaltoadriatico.it',
        to: formData.email,
        subject: 'Nuovo form inviato',
        text: `
            Ciao ${formData.nome}, questa è una mail di notifica per avvisarti che la compilazione del form è andata a buon fine.
            
            Ecco un riassunto dei dati inseriti:

            Nome: ${formData.nome}
            Cognome: ${formData.cognome}
            Indirizzo: ${formData.indirizzo}
            CF: ${formData.cf}
            Nascita: ${formData.nascita}
            Provincia: ${formData.provincia}
            Comune: ${formData.comune}
            Cellulare: ${formData.cellulare}
            Email: ${formData.email}

            Questi dati sono stati inseriti nel nostro database. 
            Grazie per aver compilato il form!
        `
    };

    // invio delle mail
    transporter.sendMail(mailToSystem, (error, info) => {
        if (error) {
            console.error("errore nell'invio della mail ", error);
            return res.status(500).json({ message: "mail non inviata al sistema"});
        }

        console.log("mail inviata al sistema ", info.response);

        transporter.sendMail(mailToUser, (error2, info2) => {
            if (error2) {
                console.error("errore nell'invio della mail ", error2);
                return res.status(500).json({ message: "mail non inviata all'utente"});
            }

        console.log("mail inviata all'utente ", info2.response);
        return res.status(200).json({ message: "mail inviata al sistema e all'utente con successo"});
        });
    });
    

});


// avvia server
server.listen(port, (err) => {
    if (err) {
        console.error('errore ', err)
        process.exit();
    }
    console.log("Server in ascolto su porta " + port + "!");
})
