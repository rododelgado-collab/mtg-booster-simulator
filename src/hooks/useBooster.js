import { useState } from 'react';

export const useBooster = (credits, setCredits, PACK_COST, playSound, carouselRef) => {
  const [cards, setCards] = useState([]);
  const [packValue, setPackValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [highlightedCardId, setHighlightedCardId] = useState(null);
  const [mostExpensiveCardId, setMostExpensiveCardId] = useState(null);

  const openBooster = async (selectedEd) => {
    if (!selectedEd || isRevealing) return;
    
    if (credits < PACK_COST) {
      alert("¡No tienes suficientes créditos!");
      return;
    }

    // Cobramos y reiniciamos estados locales
    setCredits(prev => prev - PACK_COST);
    setLoading(true);
    setCards([]);
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

  const resetBooster = () => {
    setCards([]);
    setPackValue(0);
    setHighlightedCardId(null);
    setMostExpensiveCardId(null);
  };

  return {
    cards, packValue, loading, isRevealing, highlightedCardId, mostExpensiveCardId,
    openBooster, resetBooster
  };
};