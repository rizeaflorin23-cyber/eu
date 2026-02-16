import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [pas, setPas] = useState(1); // Pasul 1: Parola | Pasul 2: SMS
  const [isRegistering, setIsRegistering] = useState(false); // Știe dacă suntem la Login sau Register

  // Câmpuri formulare
  const [nume, setNume] = useState('');
  const [telefon, setTelefon] = useState('');
  const [parola, setParola] = useState('');
  const [codIntrodus, setCodIntrodus] = useState('');
  
  // Stări pentru date și erori
  const [userId, setUserId] = useState(null);
  const [codCorect, setCodCorect] = useState(null);
  const [eroare, setEroare] = useState('');
  const [mesajSucces, setMesajSucces] = useState('');

  // 1. Funcția de LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setEroare(''); setMesajSucces('');

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefon, parola })
      });
      const data = await response.json();

      if (data.success) {
        setUserId(data.userId);
        setCodCorect(data.debugCode);
        setPas(2); // Trecem la SMS
      } else {
        setEroare('Telefon sau parolă incorecte!');
      }
    } catch (err) {
      setEroare('Eroare de conectare la server.');
    }
  };

  // 2. Funcția de CREARE CONT NOU
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setEroare(''); setMesajSucces('');

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nume, telefon, parola })
      });
      const data = await response.json();

      if (data.success) {
        setMesajSucces('Cont creat cu succes! Te poți autentifica acum.');
        setIsRegistering(false); // Îl trimitem înapoi la login
        setParola(''); // Ștergem parola din câmp din motive de securitate
      } else {
        setEroare(data.message || 'Eroare la înregistrare!');
      }
    } catch (err) {
      setEroare('Eroare de conectare la server.');
    }
  };

  // 3. Funcția de VERIFICARE SMS
  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    setEroare('');

    try {
      const response = await fetch('http://localhost:3001/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, codIntrodus, codCorect })
      });
      const data = await response.json();

      if (data.success) {
        // AICI ESTE MODIFICAREA IMPORTANTĂ: Trimitem userId-ul părintelui (App.jsx)
        onLoginSuccess(userId); 
      } else {
        setEroare('Cod SMS incorect!');
      }
    } catch (err) {
      setEroare('Eroare la verificarea codului.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          MyBank
        </h2>

        {/* Afișare mesaje de eroare sau succes */}
        {eroare && <div className="bg-red-100 text-red-600 p-2 rounded-md text-sm mb-4 text-center">{eroare}</div>}
        {mesajSucces && <div className="bg-green-100 text-green-700 p-2 rounded-md text-sm mb-4 text-center">{mesajSucces}</div>}

        {/* --- FORMULAR ÎNREGISTRARE --- */}
        {isRegistering && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nume Complet</label>
              <input type="text" value={nume} onChange={(e) => setNume(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Popescu Ion" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nr. Telefon</label>
              <input type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="0700000000" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parolă</label>
              <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="********" required />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition mt-2">
              Creează Contul
            </button>
            <p className="text-sm text-center text-gray-600 mt-2">
              Ai deja cont? <button type="button" onClick={() => { setIsRegistering(false); setEroare(''); }} className="text-blue-600 font-bold hover:underline">Autentifică-te</button>
            </p>
          </form>
        )}

        {/* --- FORMULAR LOGIN NORMAL (PASUL 1) --- */}
        {!isRegistering && pas === 1 && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nr. Telefon</label>
              <input type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="0700000000" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parolă</label>
              <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="********" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition mt-2">
              Autentificare
            </button>
            <p className="text-sm text-center text-gray-600 mt-2">
              Nu ai cont? <button type="button" onClick={() => { setIsRegistering(true); setEroare(''); setMesajSucces(''); }} className="text-blue-600 font-bold hover:underline">Creează unul nou</button>
            </p>
          </form>
        )}

        {/* --- VERIFICARE SMS (PASUL 2) --- */}
        {!isRegistering && pas === 2 && (
          <form onSubmit={handleSmsSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 text-center mb-2">
              Am trimis un cod de 4 cifre prin SMS la numărul <span className="font-bold">{telefon}</span>.
            </p>
            <p className="text-xs text-green-600 text-center font-bold">Hint: Verifică terminalul serverului pentru cod!</p>
            <div>
              <input type="text" value={codIntrodus} onChange={(e) => setCodIntrodus(e.target.value)} className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono" placeholder="1234" maxLength="4" required />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition shadow-md mt-2">
              Verifică Codul
            </button>
          </form>
        )}
      </div>
    </div>
  );
}