import React, { useState, useRef, useEffect } from 'react';
import { EDITIONS } from './data/editions';
import { Card } from './components/Card';
import './index.css';

function App() {
  // --- ESTADOS DEL JUEGO (ECONOMÍA Y PERFIL) ---
  const [credits, setCredits] = useState(100.00); // Empezamos con $100 dólares
  const PACK_COST = 15.00; // Precio por sobre
  const [packValue, setPackValue] = useState(0); // Valor de las cartas que salieron
  const [packClaimed, setPackClaimed] = useState(false); // Para no cobrar el mismo sobre dos veces

  // --- ESTADOS DE LA APP ---
  const [selectedEd, setSelectedEd] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const cardsSectionRef = useRef(null);

  // Deslizamiento suave
  useEffect(() => {
    if (cards.length > 0 && cardsSectionRef.current) {
      setTimeout(() => {
        cardsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [cards]);

  const openBooster = async () => {
    if (!selectedEd) return;
    
    // Validar si hay dinero suficiente
    if (credits < PACK_COST) {
      alert("¡No tienes suficientes créditos! Vende las cartas de tus sobres anteriores para continuar.");
      return;
    }

    // Cobrar el sobre y resetear estados
    setCredits(prev => prev - PACK_COST);
    setLoading(true);
    setCards([]);
    setPackClaimed(false);
    setPackValue(0);

    const queries = [
      { q: `s:${selectedEd.id} t:basic`, n: 1 },
      { q: `s:${selectedEd.id} r:c -t:basic`, n: 9 },
      { q: `s:${selectedEd.id} r:u`, n: 4 },
      { q: `s:${selectedEd.id} r:r`, n: 1 }
    ];

    try {
      let pack = [];
      for (const query of queries) {
        const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query.q)}&order=random`);
        const data = await res.json();
        if (data.data) {
          const selection = data.data.slice(0, query.n);
          pack = [...pack, ...selection];
        }
      }
      setCards(pack);

      // Calcular el valor total del sobre en dólares
      const totalUsd = pack.reduce((acc, card) => {
        const price = parseFloat(card.prices?.usd || 0);
        return acc + price;
      }, 0);
      setPackValue(totalUsd);

    } catch (err) {
      console.error(err);
      alert("Error al invocar las cartas...");
      // Si hay error, le devolvemos el dinero al usuario
      setCredits(prev => prev + PACK_COST);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de decisión
  const handleSellPack = () => {
    setCredits(prev => prev + packValue);
    setPackClaimed(true);
  };

  const handleClaimPhysical = () => {
    alert("¡Pedido procesado! Las cartas están siendo preparadas para su envío a tu domicilio. 🚚📦");
    setPackClaimed(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      
      {/* 1. BARRA DE NAVEGACIÓN / PERFIL */}
      <nav className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center font-bold border-2 border-white/20">
            PW {/* Planeswalker */}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-gray-400 leading-none">Iniciado como</p>
            <p className="font-bold">Mago de Élite</p>
          </div>
        </div>

        <div className={`px-5 py-2 rounded-full border-2 transition-all flex items-center gap-2 font-mono text-lg
          ${credits < PACK_COST ? 'bg-red-950 border-red-500 text-red-400' : 'bg-black border-yellow-500/50 text-yellow-400'}`}
        >
          <span>💰</span>
          <span className="font-bold">${credits.toFixed(2)}</span>
        </div>
      </nav>

      <header className="py-10">
        <h1 className="text-center text-4xl font-black mb-10 tracking-widest text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-red-600">
          MERCADO DE EDICIONES
        </h1>
        
        {/* 2. CARRUSEL DE EDICIONES */}
        <div className="flex overflow-x-auto gap-8 px-10 pb-6 snap-x">
          {EDITIONS.map((ed) => (
            <div 
              key={ed.id}
              onClick={() => {
                setSelectedEd(ed);
                setCards([]); // Limpiamos cartas al cambiar de edición
              }}
              className={`flex-none w-56 snap-center cursor-pointer transition-all duration-300 transform
                ${selectedEd?.id === ed.id ? 'scale-110 opacity-100 ring-4 ring-yellow-500 rounded-lg' : 'opacity-50 grayscale hover:grayscale-0'}
              `}
            >
              <img src={ed.cover} className="rounded-lg shadow-2xl border-2 border-gray-700 w-full h-80 object-cover" alt={ed.name} />
              <p className="text-center mt-4 font-black text-lg uppercase">{ed.name}</p>
            </div>
          ))}
        </div>
      </header>

      {/* 3. BOTÓN ABRIR SOBRE (CON PRECIO) */}
      <div className="flex justify-center mb-12 h-20">
        {selectedEd && (
          <button 
            onClick={openBooster}
            disabled={loading}
            className={`font-black px-12 py-4 rounded-full text-2xl transition-all shadow-2xl disabled:bg-gray-800 disabled:text-gray-500 disabled:scale-100
              ${cards.length > 0 
                ? 'bg-gray-800 text-green-400 border border-green-500' // Estado: Abierto
                : credits < PACK_COST 
                  ? 'bg-red-600 text-white opacity-50 cursor-not-allowed' // Estado: Sin dinero
                  : 'bg-white text-black hover:bg-yellow-400 active:scale-90' // Estado: Normal
              }
            `}
          >
            {loading 
              ? "PROCESANDO PAGO..." 
              : cards.length > 0 
                ? `¡SOBRE DE ${selectedEd.name} ABIERTO!`
                : `COMPRAR SOBRE (-$${PACK_COST.toFixed(2)})`
            }
          </button>
        )}
      </div>

      {/* 4. CARRUSEL DE CARTAS Y TOMA DE DECISIONES */}
      <main ref={cardsSectionRef} className="bg-black/40 backdrop-blur-md py-12 border-t border-white/10 min-h-125 flex flex-col justify-center">
        {cards.length > 0 ? (
          <>
            {/* Las cartas */}
            <div className="flex overflow-x-auto gap-4 px-10 pb-6 snap-x">
              {cards.map((card, i) => (
                <Card key={`${card.id}-${i}`} card={card} />
              ))}
            </div>

            {/* Menú de decisiones */}
            <div className="mt-8 px-10 flex flex-col items-center">
              <h3 className="text-xl text-gray-300 mb-6 font-mono border-b border-gray-700 pb-2">
                Valor estimado del sobre: <span className="text-green-400 font-bold">${packValue.toFixed(2)}</span>
              </h3>
              
              {!packClaimed ? (
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={handleSellPack}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span>💸</span> Vender Cartas (+${packValue.toFixed(2)})
                  </button>
                  <button 
                    onClick={handleClaimPhysical}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span>📦</span> Reclamar Físicas (Envío)
                  </button>
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg px-8 py-4 text-center">
                  <p className="text-gray-400 font-bold tracking-widest uppercase">Has procesado este sobre</p>
                  <p className="text-sm text-gray-500 mt-1">Selecciona una edición arriba para comprar uno nuevo.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center opacity-50 text-xl font-bold tracking-widest">
            {loading ? "Confirmando transacción..." : "El sobre está cerrado. Compra una edición arriba."}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;