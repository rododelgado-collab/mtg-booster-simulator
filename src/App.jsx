import React, { useState, useRef, useEffect } from 'react';
import './index.css';

// --- COMPONENTES IMPORTADOS ---
import { NavBar } from './components/NavBar';
import { StoreSection } from './components/StoreSection';
import { CardCarousel } from './components/CardCarousel';
import { ActionPanel } from './components/ActionPanel';

// --- HOOKS IMPORTADOS ---
import { useAudio } from './hooks/useAudio';
import { useBooster } from './hooks/useBooster';

function App() {
  const PACK_COST = 15.00; 
  
  // 1. ESTADOS GLOBALES (Con LocalStorage para los créditos)
  const [credits, setCredits] = useState(() => {
    const savedCredits = localStorage.getItem('pw_credits');
    return savedCredits !== null ? parseFloat(savedCredits) : 100.00;
  });
  const [selectedEd, setSelectedEd] = useState(null);
  
  // 2. ESTADOS DE FLUJO DE RECLAMO
  const [packClaimed, setPackClaimed] = useState(false); 
  const [claimMode, setClaimMode] = useState(null); 
  const [showShippingPrompt, setShowShippingPrompt] = useState(false); 
  const [outOfStockCard, setOutOfStockCard] = useState(null); 

  // 3. REFERENCIAS PARA SCROLL AUTOMÁTICO
  const cardsSectionRef = useRef(null);
  const carouselRef = useRef(null); 
  const buySectionRef = useRef(null); 
  const storeSectionRef = useRef(null); 
  const alertRef = useRef(null); 

  // 4. CUSTOM HOOKS EN ACCIÓN
  const { playSound, isMuted, toggleMute } = useAudio();
  const { 
    cards, packValue, loading, isRevealing, highlightedCardId, mostExpensiveCardId, 
    openBooster, resetBooster 
  } = useBooster(credits, setCredits, PACK_COST, playSound, carouselRef);

  // 5. EFECTO: GUARDAR CRÉDITOS EN LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('pw_credits', credits.toString());
  }, [credits]);

  // 6. EFECTOS DE SCROLL AUTOMÁTICOS
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

  // 7. FUNCIONES DE LÓGICA DE NEGOCIO
  const scrollToStore = () => {
    setTimeout(() => {
      storeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        resetBooster(); 
        setPackClaimed(false);
        setClaimMode(null);
        setShowShippingPrompt(false);
        setOutOfStockCard(null);
        setSelectedEd(null); 
      }, 500); 
    }, 4000); 
  };

  const handleOpenBooster = () => {
    if (cards.length > 0 && !packClaimed) {
      alert("⚠️ ¡Procesa el sobre actual antes de comprar uno nuevo!");
      cardsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    openBooster(selectedEd);
  };

  const handleSellPack = () => {
    setCredits(prev => prev + packValue);
    setClaimMode('sold');
    setPackClaimed(true);
    scrollToStore(); 
  };

  const confirmShipping = (type) => {
    if (type === 'new') {
      const address = window.prompt("Por favor, ingresa la nueva dirección de envío:");
      if (!address) return; 
    }
    
    // 30% de probabilidad de que una carta no esté en stock
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
    scrollToStore(); 
  };

  // Opcional: Función por si luego quieres poner un botón de reiniciar en el NavBar
  const resetProgress = () => {
    if (window.confirm("¿Seguro que quieres reiniciar tus créditos a $100?")) {
      setCredits(100.00);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      
      <NavBar 
        credits={credits} 
        packCost={PACK_COST} 
        isMuted={isMuted}
        toggleMute={toggleMute}
        resetProgress={resetProgress} // Descomenta si lo agregas al NavBar
      />
      
      <StoreSection 
        selectedEd={selectedEd} setSelectedEd={setSelectedEd}
        cards={cards} packClaimed={packClaimed}
        isRevealing={isRevealing} loading={loading}
        openBooster={handleOpenBooster} credits={credits} packCost={PACK_COST}
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
              handleSellPack={handleSellPack} handleClaimPhysical={() => setShowShippingPrompt(true)} 
              confirmShipping={confirmShipping} alertRef={alertRef}
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