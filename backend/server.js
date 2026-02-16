const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'mihaiviteazu29510812$',
    database: 'banca_app'
});

db.connect(err => {
    if (err) throw err;
    console.log('✅ Conectat la baza de date MySQL!');
});

app.post('/api/login', (req, res) => {
    const { telefon, parola } = req.body;
    db.query('SELECT * FROM users WHERE telefon = ? AND password_hash = ?', [telefon, parola], (err, result) => {
        if (result.length > 0) {
            const codSMS = Math.floor(1000 + Math.random() * 9000);
            console.log(`📩 SMS LOGIN: ${codSMS}`);
            res.json({ success: true, userId: result[0].id, debugCode: codSMS });
        } else {
            res.status(401).json({ success: false, message: 'Date incorecte!' });
        }
    });
});

// === RUTA VERIFICARE 2FA (SMS) ===
app.post('/api/verify', (req, res) => {
    const { userId, codIntrodus, codCorect } = req.body;
    
    if (codIntrodus == codCorect) {
        res.json({ success: true, token: 'token-secret-de-acces' });
    } else {
        res.status(400).json({ success: false, message: 'Cod incorect!' });
    }
});

app.post('/api/register', (req, res) => {
    const { nume, telefon, parola } = req.body;
    db.query('SELECT * FROM users WHERE telefon = ?', [telefon], (err, result) => {
        if (result.length > 0) return res.status(400).json({ success: false, message: 'Telefon existent!' });
        db.query('INSERT INTO users (nume, telefon, password_hash, sold) VALUES (?, ?, ?, ?)', [nume, telefon, parola, 100.00], () => {
            res.json({ success: true, message: 'Cont creat!' });
        });
    });
});

app.get('/api/user/:id', (req, res) => {
    db.query('SELECT nume, sold FROM users WHERE id = ?', [req.params.id], (err, result) => {
        if (result.length > 0) res.json({ success: true, user: result[0] });
        else res.status(404).json({ success: false });
    });
});

app.post('/api/transfer', (req, res) => {
    const { senderId, telefonDestinatar, suma, detalii } = req.body;
    const sumaNum = parseFloat(suma);

    db.query('SELECT id FROM users WHERE telefon = ?', [telefonDestinatar], (err, users) => {
        if (users.length === 0) return res.status(404).json({ success: false, message: 'Destinatar inexistent!' });
        const receiverId = users[0].id;

        db.query('SELECT sold FROM users WHERE id = ?', [senderId], (err, results) => {
            if (results[0].sold < sumaNum) return res.status(400).json({ success: false, message: 'Fonduri insuficiente!' });

            db.query('UPDATE users SET sold = sold - ? WHERE id = ?', [sumaNum, senderId], () => {
                db.query('UPDATE users SET sold = sold + ? WHERE id = ?', [sumaNum, receiverId], () => {
                    db.query('INSERT INTO transactions (sender_id, receiver_id, suma, detalii) VALUES (?, ?, ?, ?)', [senderId, receiverId, sumaNum, detalii || 'Transfer bani'], () => {
                        res.json({ success: true });
                    });
                });
            });
        });
    });
});

app.get('/api/transactions/:userId', (req, res) => {
    const sql = `SELECT t.*, u_rec.nume as nume_destinatar, u_sen.nume as nume_expeditor 
                 FROM transactions t JOIN users u_rec ON t.receiver_id = u_rec.id 
                 JOIN users u_sen ON t.sender_id = u_sen.id 
                 WHERE t.sender_id = ? OR t.receiver_id = ? ORDER BY t.data_tranzactie DESC LIMIT 15`;
    db.query(sql, [req.params.userId, req.params.userId], (err, results) => {
        res.json({ success: true, transactions: results });
    });
});

app.listen(3001, () => console.log('🚀 Server ON pe portul 3001'));

// === RUTA: SCHIMBARE PAROLĂ ===
app.post('/api/user/change-password', (req, res) => {
    const { userId, parolaVeche, parolaNoua } = req.body;

    // 1. Verificăm dacă parola veche corespunde utilizatorului
    db.query('SELECT password_hash FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Eroare server' });
        
        if (results[0].password_hash !== parolaVeche) {
            return res.json({ success: false, message: 'Parola actuală este incorectă!' });
        }

        // 2. Actualizăm cu parola nouă
        db.query('UPDATE users SET password_hash = ? WHERE id = ?', [parolaNoua, userId], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Eroare la actualizare' });
            res.json({ success: true, message: 'Parola a fost schimbată cu succes!' });
        });
    });
});