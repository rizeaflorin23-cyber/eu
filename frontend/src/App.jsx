import React, { useState } from 'react';
import Login from './Login';
import BankingApp from './BankingApp'; 

export default function App() {
  // Stocăm ID-ul utilizatorului logat (null = nelogat)
  const [userId, setUserId] = useState(null);

  // Dacă NU avem un userId, afișăm ecranul de Login
  if (!userId) {
    return (
      <Login 
        onLoginSuccess={(id) => setUserId(id)} 
      />
    );
  }

  // Dacă AVEM userId, afișăm aplicația bancară și îi trimitem ID-ul
  return <BankingApp userId={userId} />;
}