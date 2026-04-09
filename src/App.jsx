import React, { useState, useRef, useEffect } from 'react';
import './index.css';

// --- COMPONENTES IMPORTADOS ---
import { NavBar } from './components/NavBar';
import { StoreSection } from './components/StoreSection';
import { CardCarousel } from './components/CardCarousel';
import { ActionPanel } from './components/ActionPanel';

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
  const PACK_COST = 15.00; 
  
  // Estados Globales
  const [credits, setCredits] = useState(100.00); 
  const [packValue, setPackValue] = useState(0); 
  const [packClaimed, setPackClaimed] = useState(false); 
  const [claimMode, setClaimMode] = useState(null); 
  const [showShippingPrompt, setShowShippingPrompt] = useState(false); 
  const [outOfStockCard, setOutOfStockCard] = useState(null); 
  const [selectedEd, setSelectedEd] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false); 
  const [highlightedCardId, setHighlightedCardId] = useState(null); 
  const [mostExpensiveCardId, setMostExpensiveCardId] = useState(null); 

  // Referencias
  const cardsSectionRef = useRef(null);
  const carouselRef = useRef(null); 
  const buySectionRef = useRef(null); 
  const storeSectionRef = useRef(null); 
  const alertRef = useRef(null); 

  // Efectos de Scroll
  useEffect(() => {
    if (cards.length === 1 && cardsSectionRef.current) {
      setTimeout(() => cardsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    }
  }, [cards]);

  useEffect(() => {
    if (packClaimed && alertRef.current) {
      setTimeout(() => alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [packClaimed]);

  useEffect(() => {
    if (showShippingPrompt && alertRef.current) {
      setTimeout(() => alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
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
        setOutOfStockCard(null);
        setSelectedEd(null); // Opcional: Deselecciona la edición para un reinicio limpio
      }, 500); 
    }, 4000); 
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
              carouselRef.current.scrollTo({ left: carouselRef.current.scrollWidth + 500, behavior: 'smooth' });
            }
          }, 50);

          if (i === fullPack.length - 1) {
            setHighlightedCardId(null);
            let maxPrice = -1;
            let expensiveId = null;
            fullPack.forEach(c => {
              const priceNum = parseFloat(c.prices?.usd || 0);
              if (priceNum > maxPrice) { maxPrice = priceNum; expensiveId = c.id; }
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
    
    const hayFaltaDeStock = Math.random() < 0.30;
    if (hayFaltaDeStock && cards.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * cards.length);
      const cartaAgotada = cards[indiceAleatorio];
      const valorCarta = parseFloat(cartaAgotada.prices?.usd || 0);

      setOutOfStockCard(cartaAgotada); 
      setCredits(prev => prev + valorCarta); 
      setClaimMode('partial'); 
    } else {
      setClaimMode('physical'); 
    }

    setShowShippingPrompt(false);
    setPackClaimed(true);
    setMostExpensiveCardId(null); 
    scrollToStore(); 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      
      <NavBar credits={credits} packCost={PACK_COST} />

      <StoreSection 
        selectedEd={selectedEd} setSelectedEd={setSelectedEd}
        cards={cards} packClaimed={packClaimed}
        isRevealing={isRevealing} loading={loading}
        openBooster={openBooster} credits={credits} packCost={PACK_COST}
        storeRef={storeSectionRef} buyRef={buySectionRef} cardsRef={cardsSectionRef}
      />

      <main ref={cardsSectionRef} className="scroll-mt-32 bg-black/40 backdrop-blur-md py-12 border-t border-white/10 min-h-125 flex flex-col justify-center">
        {cards.length > 0 ? (
          <>
            <CardCarousel 
              cards={cards} carouselRef={carouselRef} 
              highlightedCardId={highlightedCardId} mostExpensiveCardId={mostExpensiveCardId} 
            />

            <ActionPanel 
              packValue={packValue} isRevealing={isRevealing}
              showShippingPrompt={showShippingPrompt} setShowShippingPrompt={setShowShippingPrompt}
              packClaimed={packClaimed} claimMode={claimMode} outOfStockCard={outOfStockCard}
              handleSellPack={handleSellPack} handleClaimPhysical={handleClaimPhysical} confirmShipping={confirmShipping}
              alertRef={alertRef}
            />
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