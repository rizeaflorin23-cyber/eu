const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// === MIDDLEWARE ===
app.use(cors());
app.use(bodyParser.json());

// === CONEXIUNE LA BAZA DE DATE ===
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

// ================= RUTE API =================

// --- RUTA 1: LOGIN (Pasul 1 - Verificare user/parolă) ---
app.post('/api/login', (req, res) => {
    const { telefon, parola } = req.body;

    const sql = 'SELECT * FROM users WHERE telefon = ? AND password_hash = ?';
    db.query(sql, [telefon, parola], (err, result) => {
        if (err) return res.status(500).send(err);
        
        if (result.length > 0) {
            const user = result[0];
            
            // Generăm un cod aleator de 4 cifre
            const codSMS = Math.floor(1000 + Math.random() * 9000);
            
            // AICI SIMULĂM TRIMITEREA SMS-ULUI
            console.log(`=========================================`);
            console.log(`📩 SMS PENTRU ${user.nume}: CODUL ESTE ${codSMS}`);
            console.log(`=========================================`);

            // Trimitem codul înapoi la frontend doar pentru test
            res.json({ success: true, message: 'Cod trimis!', userId: user.id, debugCode: codSMS }); 
        } else {
            res.status(401).json({ success: false, message: 'Date incorecte!' });
        }
    });
});

// --- RUTA 2: VERIFICARE 2FA (Pasul 2 - Verificare cod SMS) ---
app.post('/api/verify', (req, res) => {
    const { userId, codIntrodus, codCorect } = req.body;
    
    if (codIntrodus == codCorect) {
        res.json({ success: true, token: 'token-secret-de-acces' });
    } else {
        res.status(400).json({ success: false, message: 'Cod incorect!' });
    }
});

// --- RUTA 3: ÎNREGISTRARE CONT NOU ---
app.post('/api/register', (req, res) => {
    const { nume, telefon, parola } = req.body;

    // 1. Verificăm dacă numărul există deja
    const checkSql = 'SELECT * FROM users WHERE telefon = ?';
    db.query(checkSql, [telefon], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Eroare la baza de date' });
        
        if (result.length > 0) {
            return res.status(400).json({ success: false, message: 'Acest număr de telefon este deja înregistrat!' });
        }

        // 2. Dacă nu există, inserăm utilizatorul nou cu 100 RON bonus
        const insertSql = 'INSERT INTO users (nume, telefon, password_hash, sold) VALUES (?, ?, ?, ?)';
        db.query(insertSql, [nume, telefon, parola, 100.00], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Eroare la crearea contului' });
            res.json({ success: true, message: 'Cont creat cu succes!' });
        });
    });
});

// --- RUTA 4: PRELUARE DATE UTILIZATOR (Acasă) ---
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT nume, sold FROM users WHERE id = ?';
    
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });
        
        if (result.length > 0) {
            res.json({ success: true, user: result[0] });
        } else {
            res.status(404).json({ success: false, message: 'Utilizator negăsit' });
        }
    });
});

// --- RUTA 5: TRANSFER DE BANI ---
app.post('/api/transfer', (req, res) => {
    const { senderId, telefonDestinatar, suma } = req.body;

    db.query('SELECT id FROM users WHERE telefon = ?', [telefonDestinatar], (err, users) => {
        if (err) return res.status(500).json({ error: 'Eroare la căutarea utilizatorului' });
        
        if (users.length === 0) {
            return res.status(404).send('Nu exista destinatarul');
        }

        const receiverId = users[0].id;

        db.query('UPDATE users SET sold = sold - ? WHERE id = ?', [suma, senderId]);
        db.query('UPDATE users SET sold = sold + ? WHERE id = ?', [suma, receiverId]);
        db.query('INSERT INTO transactions (sender_id, receiver_id, suma) VALUES (?, ?, ?)', [senderId, receiverId, suma]);
        
        res.json({ success: true });
    });
});

// --- RUTA 6: ISTORIC TRANZACȚII ---
app.get('/api/transactions/:userId', (req, res) => {
    const userId = req.params.userId;

    db.query(
        'SELECT * FROM transactions WHERE sender_id = ? OR receiver_id = ?', 
        [userId, userId], 
        (err, resu) => {
            if (err) return res.status(500).json({ error: 'Eroare la preluarea tranzacțiilor' });
            res.json({ success: true, transactions: resu });
        }
    );
});

// === PORNIRE SERVER ===
// Asigură-te că app.listen este apelat o singură dată, la finalul fișierului!
app.listen(3001, () => {
    console.log('🚀 Serverul rulează pe portul 3001');
});