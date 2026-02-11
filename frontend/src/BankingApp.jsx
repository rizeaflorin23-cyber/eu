import React, { useState, useEffect } from 'react';
import { Home, Send, CreditCard, Settings, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function BankingApp({ userId }) {
  // --- State-uri ---
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState({ nume: '', sold: 0 });
  const [transactions, setTransactions] = useState([]);
  const [destinatar, setDestinatar] = useState('');
  const [sumaPlata, setSumaPlata] = useState('');
  const [mesaj, setMesaj] = useState('');

  // --- Funcții de preluare date ---
  const refreshData = async () => {
    // Am adăugat backticks (`) aici pentru ca ${userId} să funcționeze corect
    const resU = await fetch(`http://localhost:3001/api/user/${userId}`);
    const dataU = await resU.json();
    if (dataU.success) setUserData(dataU.user);

    const resT = await fetch(`http://localhost:3001/api/transactions/${userId}`);
    const dataT = await resT.json();
    if (dataT.success) setTransactions(dataT.transactions || []);
  };

  useEffect(() => { 
    refreshData(); 
  }, [userId]);

  // --- Funcții de acțiune ---
  const handleTransfer = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        senderId: userId, 
        telefonDestinatar: destinatar, 
        suma: sumaPlata 
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      setMesaj("Transfer reusit!"); 
      setSumaPlata(''); 
      setDestinatar(''); 
      refreshData();
    } else { 
      setMesaj("Eroare la transfer"); 
    }
  };

  // --- Randare Componentă ---
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x">
      {/* Zona principală de conținut */}
      <div className="flex-1 overflow-y-auto pb-24 p-8 text-gray-900">
        
        {activeTab === 'home' ? (
          <div>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold">Salut, {userData.nume}</h2>
              <User className="text-gray-400" />
            </div>
            
            <div className="text-center py-10 border-b">
              <p className="text-gray-400 text-sm">Sold disponibil</p>
              <h1 className="text-5xl font-black">{Number(userData.sold).toFixed(2)} RON</h1>
            </div>
            
            <h3 className="font-bold mt-10 mb-6 text-gray-900">Activitate</h3>
            <div className="space-y-4">
              {transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    {t.sender_id == userId ? <ArrowUpRight className="text-red-500"/> : <ArrowDownLeft className="text-green-500"/>}
                    <p className="font-bold text-sm">
                      {t.sender_id == userId ? 'Trimis' : 'Primit'}
                    </p>
                  </div>
                  <p className="font-black">
                    {t.sender_id == userId ? '-' : '+'}{t.suma} RON
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'plati' ? (
          <div className="pt-10">
            <h2 className="text-3xl font-black mb-8 text-gray-900">Trimite bani</h2>
            <form onSubmit={handleTransfer} className="space-y-6">
              {mesaj && <p className="text-center font-bold text-blue-600">{mesaj}</p>}
              
              <input 
                type="text" 
                placeholder="Telefon Destinatar" 
                value={destinatar} 
                onChange={e => setDestinatar(e.target.value)} 
                className="w-full p-4 bg-gray-100 rounded-2xl outline-none" 
                required 
              />
              
              <input 
                type="number" 
                placeholder="Suma" 
                value={sumaPlata} 
                onChange={e => setSumaPlata(e.target.value)} 
                className="w-full p-4 bg-gray-100 rounded-2xl outline-none text-2xl" 
                required 
              />
              
              <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl">
                Trimite Acum
              </button>
            </form>
          </div>
        ) : (
          <p className="pt-20 text-center text-gray-400">Sectiune in lucru...</p>
        )}
      </div>

      {/* Bara de navigație de jos */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-around py-5">
        <button 
          onClick={() => { setActiveTab('home'); setMesaj(''); }} 
          className={activeTab === 'home' ? 'text-blue-600' : 'text-gray-300'}
        >
          <Home/>
        </button>
        <button 
          onClick={() => { setActiveTab('plati'); setMesaj(''); }} 
          className={activeTab === 'plati' ? 'text-blue-600' : 'text-gray-300'}
        >
          <Send/>
        </button>
        <button 
          onClick={() => setActiveTab('cards')} 
          className={activeTab === 'cards' ? 'text-blue-600' : 'text-gray-300'}
        >
          <CreditCard/>
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={activeTab === 'settings' ? 'text-blue-600' : 'text-gray-300'}
        >
          <Settings/>
        </button>
      </nav>
    </div>
  );
}