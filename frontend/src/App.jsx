import React, { useState } from 'react';
import Login from './Login';
import BankingApp from './BankingApp'; 

export default function App() {
  // Stare care ne spune dacă utilizatorul s-a logat cu succes
  const [esteLogat, setEsteLogat] = useState(false);

  // Dacă NU este logat, afișăm ecranul de Login
  if (!esteLogat) {
    return <Login onLoginSuccess={() => setEsteLogat(true)} />;
  }

  // Dacă ESTE logat, afișăm aplicația bancară efectivă
  return <BankingApp />;
}