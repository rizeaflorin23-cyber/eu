import React, { useState, useEffect } from 'react';
import { Home, Send, CreditCard, Settings, User, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, LogOut, Snowflake, Moon, Globe, MessageCircle, FileText, ChevronRight, Activity } from 'lucide-react';

export default function BankingApp({ userId }) {
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState({ nume: '', sold: 0, is_frozen: false });
  const [transactions, setTransactions] = useState([]);
  
  // Stare pentru Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // Stări Plăți
  const [telefonDestinatar, setTelefonDestinatar] = useState('');
  const [sumaPlata, setSumaPlata] = useState('');
  const [detaliiPlata, setDetaliiPlata] = useState('');
  const [categorie, setCategorie] = useState('Transfer');
  const [mesaj, setMesaj] = useState('');

  // Stări Card
  const [showCard, setShowCard] = useState(false);
  const [cardDetails] = useState({ 
    number: "4532 " + Math.floor(1000+Math.random()*9000) + " " + Math.floor(1000+Math.random()*9000) + " " + Math.floor(1000+Math.random()*9000),
    cvv: Math.floor(100+Math.random()*900),
    exp: "12/28"
  });

  // Stări Setări
  const [parolaVeche, setParolaVeche] = useState('');
  const [parolaNoua, setParolaNoua] = useState('');
  const [showPassForm, setShowPassForm] = useState(false);

  const refreshData = async () => {
    try {
      const resU = await fetch(`http://localhost:3001/api/user/${userId}`);
      const dataU = await resU.json();
      if (dataU.success) setUserData(dataU.user);

      const resT = await fetch(`http://localhost:3001/api/transactions/${userId}`);
      const dataT = await resT.json();
      if (dataT.success) setTransactions(dataT.transactions || []);
    } catch (err) {
      console.error("Eroare la refresh data:", err);
    }
  };

  useEffect(() => { refreshData(); }, [userId]);

  const handleFreezeCard = async () => {
    const newStatus = userData.is_frozen ? 0 : 1;
    const res = await fetch('http://localhost:3001/api/user/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, freezeStatus: newStatus })
    });
    if (res.ok) refreshData();
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: userId, telefonDestinatar, suma: sumaPlata, detalii: detaliiPlata, categorie })
    });
    const data = await res.json();
    if (data.success) {
      setMesaj("✅ Transfer realizat cu succes!"); setSumaPlata(''); setTelefonDestinatar(''); refreshData();
    } else {
      setMesaj("❌ " + data.message);
    }
  };

  const handleChangePassword = async () => {
    const res = await fetch('http://localhost:3001/api/user/change-password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId, parolaVeche, parolaNoua })
    });
    const data = await res.json();
    alert(data.message);
    if(data.success) { setShowPassForm(false); setParolaVeche(''); setParolaNoua(''); }
  };

  // Clase dinamice globale pentru Dark Mode
  const bgMain = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  const bgCard = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm';
  const bgInput = darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-gray-50 text-gray-900 border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Componentă pentru butoanele de meniu
  const NavItem = ({ id, icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); setMesaj(''); }}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2 md:p-4 rounded-xl transition-all md:w-full 
        ${activeTab === id 
          ? (darkMode ? 'bg-gray-700 text-blue-400 font-bold' : 'bg-blue-50 text-blue-600 font-bold') 
          : (darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100')}`}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-bold">{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col md:flex-row h-screen w-full font-sans overflow-hidden transition-colors duration-300 ${bgMain}`}>
      
      {/* Banner Card Înghețat */}
      {userData.is_frozen && (
        <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs text-center py-2 z-50 font-black uppercase tracking-widest shadow-md">
          Cardul tău este înghețat temporar. Deblochează-l din secțiunea Carduri pentru a face plăți.
        </div>
      )}

      {/* --- SIDEBAR PENTRU DESKTOP / BOTTOM BAR PENTRU MOBIL --- */}
      <nav className={`fixed bottom-0 md:relative w-full md:w-72 flex-shrink-0 border-t md:border-t-0 md:border-r z-40 flex md:flex-col p-2 md:p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        
        {/* Logo (Apare doar pe PC) */}
        <div className="hidden md:flex items-center gap-3 mb-10 px-2 mt-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30">M</div>
          <span className="text-2xl font-black tracking-tight">MyBank</span>
        </div>

        {/* Butoane Navigare */}
        <div className="flex md:flex-col justify-around md:justify-start w-full gap-2">
          <NavItem id="home" icon={<Home size={24}/>} label="Acasă" />
          <NavItem id="plati" icon={<Send size={24}/>} label="Plăți Noi" />
          <NavItem id="cards" icon={<CreditCard size={24}/>} label="Carduri" />
          <NavItem id="settings" icon={<Settings size={24}/>} label="Setări" />
        </div>

        {/* User Mini-Profil (Apare doar pe PC jos în Sidebar) */}
        <div className={`hidden md:flex mt-auto items-center gap-3 p-4 rounded-2xl border ${bgCard}`}>
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            {userData.nume ? userData.nume.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{userData.nume}</p>
            <p className={`text-xs truncate ${textMuted}`}>Cont Principal</p>
          </div>
        </div>
      </nav>

      {/* --- CONȚINUTUL PRINCIPAL (Se întinde pe tot ecranul rămas) --- */}
      <div className={`flex-1 overflow-y-auto pb-24 md:pb-0 p-6 md:p-10 ${userData.is_frozen ? 'mt-8' : ''}`}>
        <div className="max-w-6xl mx-auto h-full">

          {/* === PAGINA ACASĂ (Desktop Layout = 2 Coloane) === */}
          {activeTab === 'home' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black">Dashboard</h2>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 border shadow-sm'}`}>
                      {new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Coloana Stângă: Sold și Statistici */}
                  <div className="lg:col-span-5 space-y-8">
                      <div className={`p-10 rounded-[2rem] border ${bgCard} text-center flex flex-col justify-center items-center min-h-[300px]`}>
                        <p className={`text-sm uppercase font-bold tracking-widest mb-4 ${textMuted}`}>Sold Disponibil</p>
                        <h1 className={`text-6xl font-black transition-opacity ${userData.is_frozen ? 'opacity-50' : 'opacity-100'}`}>
                          {Number(userData.sold).toLocaleString()} <span className="text-3xl text-blue-500">RON</span>
                        </h1>
                      </div>

                      <div className={`p-8 rounded-[2rem] border ${bgCard} flex justify-between`}>
                          <div>
                              <p className={`text-xs uppercase font-bold mb-1 ${textMuted}`}>Încasări lună</p>
                              <p className="text-2xl text-green-500 font-black">+2.400 RON</p>
                          </div>
                          <div className="text-right">
                              <p className={`text-xs uppercase font-bold mb-1 ${textMuted}`}>Cheltuieli</p>
                              <p className="text-2xl text-red-500 font-black">-840 RON</p>
                          </div>
                      </div>
                  </div>

                  {/* Coloana Dreaptă: Tranzacții */}
                  <div className="lg:col-span-7">
                      <div className={`p-8 rounded-[2rem] border ${bgCard} h-full`}>
                          <div className="flex justify-between items-center mb-8">
                              <h3 className="text-xl font-bold flex items-center gap-2"><Activity size={24} className="text-blue-500"/> Istoric Tranzacții</h3>
                          </div>
                          
                          <div className="space-y-4">
                            {transactions.length > 0 ? transactions.map(t => (
                              <div key={t.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all hover:scale-[1.01] ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl ${t.sender_id === userId ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                                    {t.sender_id === userId ? <ArrowUpRight size={20}/> : <ArrowDownLeft size={20}/>}
                                  </div>
                                  <div>
                                    <p className="font-bold">{t.sender_id === userId ? t.nume_destinatar : t.nume_expeditor}</p>
                                    <p className={`text-xs font-medium ${textMuted}`}>{t.categorie || 'General'} • {t.detalii}</p>
                                  </div>
                                </div>
                                <p className={`font-black text-lg ${t.sender_id === userId ? (darkMode ? 'text-gray-100' : 'text-gray-900') : 'text-green-500'}`}>
                                  {t.sender_id === userId ? '-' : '+'}{t.suma} RON
                                </p>
                              </div>
                            )) : <p className={`text-center py-10 ${textMuted}`}>Nu există tranzacții recente.</p>}
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* === PAGINA PLĂȚI === */}
          {activeTab === 'plati' && (
            <div className="animate-in fade-in duration-300 max-w-2xl mx-auto mt-10">
              <h2 className="text-4xl font-black mb-2">Inițiază Transfer</h2>
              <p className={`mb-10 ${textMuted}`}>Trimite bani rapid către prieteni sau plătește facturi direct din contul tău.</p>
              
              <div className={`p-8 md:p-12 rounded-[2rem] border ${bgCard}`}>
                <form onSubmit={handleTransfer} className="space-y-6">
                  {mesaj && <div className={`p-4 rounded-xl text-center font-bold text-sm ${mesaj.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{mesaj}</div>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={`text-xs font-bold uppercase ml-1 mb-2 block ${textMuted}`}>Telefon Destinatar</label>
                      <input type="text" placeholder="Ex: 0722 123 456" value={telefonDestinatar} onChange={e=>setTelefonDestinatar(e.target.value)} className={`w-full p-4 rounded-2xl outline-none border focus:ring-2 focus:ring-blue-500 transition-all ${bgInput}`} required />
                    </div>
                    
                    <div>
                      <label className={`text-xs font-bold uppercase ml-1 mb-2 block ${textMuted}`}>Sumă (RON)</label>
                      <input type="number" placeholder="0.00" value={sumaPlata} onChange={e=>setSumaPlata(e.target.value)} className={`w-full p-4 rounded-2xl outline-none border focus:ring-2 focus:ring-blue-500 transition-all text-2xl font-black text-blue-600 ${bgInput}`} required />
                    </div>

                    <div>
                      <label className={`text-xs font-bold uppercase ml-1 mb-2 block ${textMuted}`}>Categorie</label>
                      <select value={categorie} onChange={e=>setCategorie(e.target.value)} className={`w-full p-4 rounded-2xl outline-none border focus:ring-2 focus:ring-blue-500 h-[64px] ${bgInput}`}>
                          <option value="Transfer">Transfer Prieteni</option>
                          <option value="Utilități">Plată Factură</option>
                          <option value="Mâncare">Restaurante / Food</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={`text-xs font-bold uppercase ml-1 mb-2 block ${textMuted}`}>Detalii Plată</label>
                      <input type="text" placeholder="Ex: Cadou, Factură Enel..." value={detaliiPlata} onChange={e=>setDetaliiPlata(e.target.value)} className={`w-full p-4 rounded-2xl outline-none border focus:ring-2 focus:ring-blue-500 transition-all ${bgInput}`} required />
                    </div>
                  </div>

                  <button disabled={userData.is_frozen} className={`w-full p-5 mt-4 rounded-2xl font-black text-white shadow-xl transition-all ${userData.is_frozen ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}>
                    {userData.is_frozen ? 'Operațiune Blocată (Card Înghețat)' : 'Confirmă și Trimite Banii'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* === PAGINA CARDURI === */}
          {activeTab === 'cards' && (
            <div className="animate-in fade-in duration-300 max-w-xl mx-auto mt-10">
              <h2 className="text-4xl font-black mb-10 text-center">Cardul Meu Virtual</h2>
              
              <div className="perspective-1000">
                <div className={`relative p-10 rounded-[2rem] text-white shadow-2xl transition-all duration-700 transform hover:scale-105 ${userData.is_frozen ? 'bg-gray-400 grayscale' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900'}`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  
                  <div className="flex justify-between items-start mb-16 relative z-10">
                      <span className="text-3xl font-black italic tracking-tighter">MyBank</span>
                      <button onClick={()=>setShowCard(!showCard)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
                        {showCard ? <EyeOff size={24}/> : <Eye size={24}/>}
                      </button>
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Număr Card</p>
                    <p className="font-mono text-3xl tracking-widest mb-10 text-shadow-sm">
                        {showCard ? cardDetails.number : "**** **** **** " + cardDetails.number.slice(-4)}
                    </p>
                  </div>

                  <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Titular Card</p>
                        <p className="font-bold tracking-widest text-lg">{userData.nume.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Valabilitate</p>
                        <p className="font-bold tracking-widest text-lg">{cardDetails.exp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">CVV</p>
                        <p className="font-bold tracking-widest text-lg">{showCard ? cardDetails.cvv : '***'}</p>
                      </div>
                  </div>
                </div>
              </div>

              <div className={`mt-12 p-8 rounded-[2rem] border ${bgCard}`}>
                <h3 className="font-bold mb-4">Setări Securitate Card</h3>
                <p className={`text-sm mb-6 ${textMuted}`}>Înghețarea cardului va bloca temporar absolut toate plățile și transferurile din cont.</p>
                <button onClick={handleFreezeCard} className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl font-black transition-all border-2 ${userData.is_frozen ? 'border-green-500 text-green-500 hover:bg-green-50/10' : 'border-blue-600 text-blue-600 hover:bg-blue-50/10'}`}>
                  <Snowflake size={24} className={userData.is_frozen ? 'animate-pulse' : ''}/> 
                  {userData.is_frozen ? 'Deblochează Cardul' : 'Îngheață Cardul'}
                </button>
              </div>
            </div>
          )}

          {/* === PAGINA SETĂRI === */}
          {activeTab === 'settings' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto mt-10">
              <h2 className="text-4xl font-black mb-10">Setări Profil</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {/* Grupul SECURITATE */}
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ml-1 ${textMuted}`}>Securitate Cont</h3>
                  <div className={`${bgCard} rounded-[2rem] p-2 space-y-1 border mb-8`}>
                    <button onClick={() => setShowPassForm(!showPassForm)} className={`w-full flex items-center justify-between p-4 hover:bg-black/5 rounded-2xl transition-all`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                          <Settings size={20} />
                        </div>
                        <span className="font-bold">Schimbă Parola</span>
                      </div>
                      <ChevronRight size={20} className={textMuted} />
                    </button>

                    {showPassForm && (
                      <div className={`p-6 rounded-2xl mx-2 mb-2 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <input type="password" placeholder="Parola curentă" value={parolaVeche} onChange={(e) => setParolaVeche(e.target.value)} className={`w-full mb-3 p-4 rounded-xl outline-none border focus:border-blue-500 ${bgInput}`}/>
                        <input type="password" placeholder="Parola nouă" value={parolaNoua} onChange={(e) => setParolaNoua(e.target.value)} className={`w-full mb-4 p-4 rounded-xl outline-none border focus:border-blue-500 ${bgInput}`}/>
                        <button onClick={handleChangePassword} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-blue-700 transition">Actualizează Parola</button>
                      </div>
                    )}
                  </div>

                  {/* Grupul SUPORT */}
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ml-1 ${textMuted}`}>Suport & Ajutor</h3>
                  <div className={`${bgCard} rounded-[2rem] p-2 space-y-1 border mb-8`}>
                      <button className="w-full flex items-center justify-between p-4 hover:bg-black/5 rounded-2xl transition-all">
                          <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                  <MessageCircle size={20} />
                              </div>
                              <span className="font-bold">Chat Live Support</span>
                          </div>
                          <ArrowUpRight size={18} className={textMuted} />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 hover:bg-black/5 rounded-2xl transition-all">
                          <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                  <FileText size={20} />
                              </div>
                              <span className="font-bold">Termeni și Condiții</span>
                          </div>
                      </button>
                  </div>
                </div>

                <div>
                  {/* Grupul PREFERINȚE */}
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ml-1 ${textMuted}`}>Preferințe Aplicație</h3>
                  <div className={`${bgCard} rounded-[2rem] p-2 space-y-1 border mb-8`}>
                      <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                  <Moon size={20} />
                              </div>
                              <span className="font-bold">Mod Întunecat (Dark Mode)</span>
                          </div>
                          <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                      </div>

                      <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                  <Globe size={20} />
                              </div>
                              <span className="font-bold">Limbă</span>
                          </div>
                          <div className={`flex items-center gap-2 ${textMuted}`}>
                              <span className="font-bold">Română</span>
                              <ChevronRight size={18}/>
                          </div>
                      </div>
                  </div>

                  {/* Deconectare */}
                  <button onClick={() => window.location.reload()} className="w-full mt-10 flex items-center justify-center gap-3 p-5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-[2rem] border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition active:scale-95">
                    <LogOut size={24} />
                    <span className="font-black text-lg">Deconectare Cont</span>
                  </button>
                  
                  <p className="text-center text-sm text-gray-400 font-mono opacity-50 mt-8">
                      MyBank Desktop Web App v1.5.0<br/>Proiect Licență 2024
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}