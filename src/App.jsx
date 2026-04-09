import React, { useState, useRef, useEffect } from 'react';
import { EDITIONS } from './data/editions';
import { Card } from './components/Card';
import './index.css';

// --- SINTETIZADOR DE EFECTOS DE SONIDO ---
const playSound = (type, step = 0) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + (step * 40), ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime); 
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); 
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'epic') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5); 
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); 
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    }
  } catch (e) {
    console.log("El navegador bloqueó el audio", e);
  }
};

function App() {
  const [credits, setCredits] = useState(100.00); 
  const PACK_COST = 15.00; 
  const [packValue, setPackValue] = useState(0); 
  
  const [packClaimed, setPackClaimed] = useState(false); 
  const [claimMode, setClaimMode] = useState(null); 
  const [showShippingPrompt, setShowShippingPrompt] = useState(false); 
  const [outOfStockCard, setOutOfStockCard] = useState(null); // NUEVO: Guarda la carta agotada

  const [selectedEd, setSelectedEd] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false); 

  const [highlightedCardId, setHighlightedCardId] = useState(null); 
  const [mostExpensiveCardId, setMostExpensiveCardId] = useState(null); 

  const cardsSectionRef = useRef(null);
  const carouselRef = useRef(null); 
  const buySectionRef = useRef(null); 
  const storeSectionRef = useRef(null); 
  const alertRef = useRef(null); 

  useEffect(() => {
    if (cards.length === 1 && cardsSectionRef.current) {
      setTimeout(() => {
        cardsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [cards]);

  useEffect(() => {
    if (packClaimed && alertRef.current) {
      setTimeout(() => {
        alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [packClaimed]);

  useEffect(() => {
    if (showShippingPrompt && alertRef.current) {
      setTimeout(() => {
        alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showShippingPrompt]);

  const scrollToStore = () => {
    setTimeout(() => {
      storeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      setTimeout(() => {
        setCards([]);
        setPackValue(0);
        setPackClaimed(false);
        setClaimMode(null);
        setShowShippingPrompt(false);
        setOutOfStockCard(null); // Limpiamos la carta agotada
      }, 500); 
      
    }, 4000); // Subimos el tiempo a 4 segundos para que lean bien si hubo falta de stock
  };

  const openBooster = async () => {
    if (!selectedEd || isRevealing) return;
    if (cards.length > 0 && !packClaimed) {
      alert("⚠️ ¡Procesa el sobre actual antes de comprar uno nuevo!");
      cardsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (credits < PACK_COST) {
      alert("¡No tienes suficientes créditos!");
      return;
    }

    setCredits(prev => prev - PACK_COST);
    setLoading(true);
    setCards([]);
    setPackClaimed(false);
    setClaimMode(null);
    setShowShippingPrompt(false);
    setOutOfStockCard(null);
    setPackValue(0);
    setHighlightedCardId(null); 
    setMostExpensiveCardId(null);

    const queries = [
      { q: `s:${selectedEd.id} t:basic`, n: 1 },
      { q: `s:${selectedEd.id} r:c -t:basic`, n: 9 },
      { q: `s:${selectedEd.id} r:u`, n: 4 },
      { q: `s:${selectedEd.id} r:r`, n: 1 }
    ];

    try {
      let fullPack = [];
      for (const query of queries) {
        const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query.q)}&order=random`);
        const data = await res.json();
        if (data.data) fullPack = [...fullPack, ...data.data.slice(0, query.n)];
      }

      setLoading(false);
      setIsRevealing(true); 

      let currentRevealed = [];
      let runningValue = 0;

      fullPack.forEach((card, i) => {
        setTimeout(() => {
          currentRevealed = [...currentRevealed, card];
          setCards(currentRevealed);
          setHighlightedCardId(card.id);
          playSound('tick', i);

          const price = parseFloat(card.prices?.usd || 0);
          runningValue += price;
          setPackValue(runningValue);

          setTimeout(() => {
            if (carouselRef.current) {
              carouselRef.current.scrollTo({
                left: carouselRef.current.scrollWidth + 500, 
                behavior: 'smooth'
              });
            }
          }, 50);

          if (i === fullPack.length - 1) {
            setHighlightedCardId(null);
            let maxPrice = -1;
            let expensiveId = null;
            fullPack.forEach(c => {
              const priceNum = parseFloat(c.prices?.usd || 0);
              if (priceNum > maxPrice) {
                maxPrice = priceNum;
                expensiveId = c.id;
              }
            });
            setMostExpensiveCardId(expensiveId);
            setIsRevealing(false);
            setTimeout(() => playSound('epic'), 200); 
          }
        }, i * 450); 
      });

    } catch (err) {
      console.error(err);
      setCredits(prev => prev + PACK_COST);
      setLoading(false);
    }
  };

  const handleSellPack = () => {
    setCredits(prev => prev + packValue);
    setClaimMode('sold');
    setPackClaimed(true);
    setMostExpensiveCardId(null); 
    scrollToStore(); 
  };

  const handleClaimPhysical = () => {
    setShowShippingPrompt(true);
  };

  const confirmShipping = (type) => {
    if (type === 'new') {
      const address = window.prompt("Por favor, ingresa la nueva dirección de envío:");
      if (!address) return; 
    }
    
    // --- NUEVO: MECÁNICA DE FALTA DE STOCK ---
    // Genera un número del 0 al 1. Si es menor a 0.30, hay un 30% de probabilidad de fallo.
    // Si quieres que pase más seguido, sube el 0.30 (ej. 0.80 para probarlo rápido).
    const hayFaltaDeStock = Math.random() < 0.30;

    if (hayFaltaDeStock && cards.length > 0) {
      // Elegimos una carta al azar del sobre
      const indiceAleatorio = Math.floor(Math.random() * cards.length);
      const cartaAgotada = cards[indiceAleatorio];
      const valorCarta = parseFloat(cartaAgotada.prices?.usd || 0);

      setOutOfStockCard(cartaAgotada); // Guardamos qué carta fue
      setCredits(prev => prev + valorCarta); // Te sumamos los créditos obligatoriamente
      setClaimMode('partial'); // Nuevo modo de alerta (Naranja)
    } else {
      setClaimMode('physical'); // Envío normal (Azul)
    }

    setShowShippingPrompt(false);
    setPackClaimed(true);
    setMostExpensiveCardId(null); 
    scrollToStore(); 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      
      <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center font-bold border-2 border-white/20 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            PW
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-gray-400 leading-none">Iniciado como</p>
            <p className="font-bold">Mago de Élite</p>
          </div>
        </div>

        <div className={`px-5 py-2 rounded-full border-2 transition-all flex items-center gap-2 font-mono text-lg shadow-inner
          ${credits < PACK_COST ? 'bg-red-950 border-red-500 text-red-400' : 'bg-black border-yellow-500/50 text-yellow-400'}`}
        >
          <span>💰</span>
          <span className="font-bold">${credits.toFixed(2)}</span>
        </div>
      </nav>

      <header ref={storeSectionRef} className="pt-32 pb-10 scroll-mt-32">
        <h1 className="text-center text-4xl font-black mb-10 tracking-widest text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-red-600 drop-shadow-sm">
          MERCADO DE EDICIONES
        </h1>
        
        <div className="flex overflow-x-auto gap-8 px-10 pb-6 snap-x">
          {EDITIONS.map((ed) => (
            <div 
              key={ed.id}
              onClick={() => {
                if (isRevealing || loading) return;
                if (cards.length > 0 && !packClaimed) {
                  alert("⚠️ ¡Procesa el sobre actual!");
                  cardsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return;
                }
                setSelectedEd(ed);
                setCards([]);
                setMostExpensiveCardId(null);
                
                setTimeout(() => {
                  buySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}
              className={`flex-none w-56 snap-center cursor-pointer transition-all duration-300 transform
                ${selectedEd?.id === ed.id ? 'scale-110 opacity-100 ring-4 ring-yellow-500 rounded-lg shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'opacity-50 grayscale hover:grayscale-0 hover:scale-105'}
              `}
            >
              <img src={ed.cover} className="rounded-lg shadow-2xl border-2 border-gray-700 w-full h-80 object-cover" alt={ed.name} />
              <p className="text-center mt-4 font-black text-lg uppercase tracking-wider">{ed.name}</p>
            </div>
          ))}
        </div>
      </header>

      <div ref={buySectionRef} className="flex justify-center mb-12 min-h-20 px-5">
        {selectedEd && (
          <button 
            onClick={openBooster}
            disabled={loading || isRevealing}
            className={`font-black w-full sm:w-auto max-w-md sm:max-w-none px-4 sm:px-12 py-4 rounded-full text-base sm:text-2xl transition-all shadow-2xl disabled:scale-100 flex items-center justify-center text-center leading-tight
              ${(cards.length > 0 && !packClaimed) && !isRevealing
                ? 'bg-gray-800 text-green-400 border border-green-500 hover:bg-gray-700' 
                : isRevealing
                  ? 'bg-yellow-600 text-white cursor-wait opacity-80'
                  : credits < PACK_COST 
                    ? 'bg-red-600 text-white opacity-50 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-yellow-400 active:scale-90' 
              }
            `}
          >
            {loading ? "PROCESANDO PAGO..." : isRevealing ? "ABRIENDO SOBRE..." : (cards.length > 0 && !packClaimed) ? `¡SOBRE DE ${selectedEd.name} ABIERTO!` : `COMPRAR SOBRE (-$${PACK_COST.toFixed(2)})`}
          </button>
        )}
      </div>

      <main ref={cardsSectionRef} className="scroll-mt-32 bg-black/40 backdrop-blur-md py-12 border-t border-white/10 min-h-125 flex flex-col justify-center">
        {cards.length > 0 ? (
          <>
            <div ref={carouselRef} className="flex overflow-x-auto gap-4 px-10 pb-6 snap-x scroll-smooth">
              {cards.map((card, i) => (
                <Card key={`${card.id}-${i}`} card={card} isHighlighted={card.id === highlightedCardId} isMostExpensive={card.id === mostExpensiveCardId} />
              ))}
            </div>

            <div ref={alertRef} className="mt-8 px-10 flex flex-col items-center">
              <h3 className="text-xl text-gray-300 mb-6 font-mono border-b border-gray-700 pb-2">
                Valor del sobre: <span className="text-green-400 font-bold">${packValue.toFixed(2)}</span>
              </h3>
              
              {isRevealing ? (
                <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-8 py-3 rounded-full font-bold animate-pulse tracking-widest uppercase">
                  ✨ Revelando Misticismo... ✨
                </div>
              ) : showShippingPrompt ? (
                <div className="bg-blue-900/40 border-2 border-blue-500/50 rounded-xl px-8 py-6 text-center shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full max-w-lg animate-fade-in">
                  <div className="text-4xl mb-3">🚚</div>
                  <h4 className="text-2xl font-black text-blue-400 mb-2 tracking-wide uppercase">Confirmar Envío</h4>
                  <p className="text-blue-100/80 mb-6 font-medium">¿A dónde enviamos tus cartas físicas?</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button onClick={() => confirmShipping('saved')} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                      <span>🏠</span> Dirección Guardada
                    </button>
                    <button onClick={() => confirmShipping('new')} className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                      <span>📍</span> Otra Dirección
                    </button>
                  </div>
                  <button onClick={() => setShowShippingPrompt(false)} className="mt-4 text-gray-400 hover:text-white underline text-sm transition-colors">
                    Cancelar
                  </button>
                </div>
              ) : !packClaimed ? (
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={handleSellPack} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-green-900/50">
                    <span>💸</span> Vender (+${packValue.toFixed(2)})
                  </button>
                  <button onClick={handleClaimPhysical} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-900/50">
                    <span>📦</span> Reclamar Físicas
                  </button>
                </div>
              ) : (
                /* --- ALERTAS DE PROCESAMIENTO REESTRUCTURADAS --- */
                <div className="w-full max-w-lg">
                  {/* ALERTA DE VENTA COMPLETA (VERDE) */}
                  {claimMode === 'sold' && (
                    <div className="bg-green-500/10 border-2 border-green-500/50 rounded-xl px-10 py-6 text-center mt-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <div className="text-4xl mb-2 animate-bounce-short">✅</div>
                      <p className="text-green-400 font-black text-xl tracking-widest uppercase">¡SOBRE PROCESADO!</p>
                      <p className="text-green-200/70 font-medium mt-1 italic">
                        Tus créditos han sido actualizados. <br/>
                        <span className="text-xs uppercase font-bold tracking-tighter opacity-50">Volviendo a la tienda en 4s...</span>
                      </p>
                    </div>
                  )}

                  {/* ALERTA DE ENVÍO COMPLETO (AZUL) */}
                  {claimMode === 'physical' && (
                    <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-xl px-10 py-6 text-center mt-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                      <div className="text-4xl mb-2 animate-bounce-short">📦</div>
                      <p className="text-blue-400 font-black text-xl tracking-widest uppercase">¡PEDIDO PROCESADO!</p>
                      <p className="text-blue-200/70 font-medium mt-1 italic">
                        Tus cartas van en camino a tu dirección. <br/>
                        <span className="text-xs uppercase font-bold tracking-tighter opacity-50">Volviendo a la tienda en 4s...</span>
                      </p>
                    </div>
                  )}

                  {/* ALERTA DE ENVÍO PARCIAL POR FALTA DE STOCK (NARANJA) */}
                  {claimMode === 'partial' && outOfStockCard && (
                    <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl px-6 py-6 text-center mt-4 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                      <div className="text-4xl mb-2 animate-bounce-short">⚠️</div>
                      <p className="text-orange-400 font-black text-xl tracking-widest uppercase">¡ENVÍO PARCIAL!</p>
                      <p className="text-orange-200/80 font-medium mt-2">
                        La carta <span className="font-bold text-white">"{outOfStockCard.name}"</span> estaba agotada en nuestro almacén.
                      </p>
                      <p className="text-orange-200/80 font-medium mt-1 italic">
                        Ha sido vendida automáticamente por <span className="text-green-400 font-bold">${parseFloat(outOfStockCard.prices?.usd || 0).toFixed(2)}</span>. El resto de cartas van en camino.
                      </p>
                      <p className="text-xs uppercase font-bold tracking-tighter opacity-50 text-orange-200/70 mt-3">
                        Volviendo a la tienda en 4s...
                      </p>
                    </div>
                  )}
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