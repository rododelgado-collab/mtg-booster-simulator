import React from 'react';
import { EDITIONS } from '../data/editions';

export const StoreSection = ({
  selectedEd, setSelectedEd, cards, packClaimed, isRevealing, loading,
  openBooster, credits, packCost, storeRef, buyRef, cardsRef
}) => {
  return (
    <>
      <header ref={storeRef} className="pt-32 pb-10 scroll-mt-32">
        <div className="text-center my-8">
          <h1 className="text-5xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-linear-to-r from-yellow-900 via-yellow-200 to-red-700 drop-shadow-lg">
            El Bazar del Arcano
          </h1>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto italic">
            Cada sobre es un territorio inexplorado. Desentierra artefactos olvidados, descubre tesoros invaluables y comienza tu expedición hacia la carta perfecta.
          </p>
        </div>
        
        <div className="flex overflow-x-auto gap-8 px-10 pb-6 snap-x">
          {EDITIONS.map((ed) => (
            <div 
              key={ed.id}
              onClick={() => {
                if (isRevealing || loading) return;
                if (cards.length > 0 && !packClaimed) {
                  alert("⚠️ ¡Procesa el sobre actual!");
                  cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return;
                }
                setSelectedEd(ed);
                
                setTimeout(() => {
                  buyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

      <div ref={buyRef} className="flex justify-center mb-12 min-h-20 px-5">
        {selectedEd && (
          <button 
            onClick={openBooster}
            disabled={loading || isRevealing}
            className={`font-black w-full sm:w-auto max-w-md sm:max-w-none px-4 sm:px-12 py-4 rounded-full text-base sm:text-2xl transition-all shadow-2xl disabled:scale-100 flex items-center justify-center text-center leading-tight
              ${(cards.length > 0 && !packClaimed) && !isRevealing
                ? 'bg-gray-800 text-green-400 border border-green-500 hover:bg-gray-700' 
                : isRevealing
                  ? 'bg-yellow-600 text-white cursor-wait opacity-80'
                  : credits < packCost 
                    ? 'bg-red-600 text-white opacity-50 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-yellow-400 active:scale-90' 
              }
            `}
          >
            {loading ? "PROCESANDO PAGO..." : isRevealing ? "ABRIENDO SOBRE..." : (cards.length > 0 && !packClaimed) ? `¡SOBRE DE ${selectedEd.name} ABIERTO!` : `COMPRAR SOBRE (-$${packCost.toFixed(2)})`}
          </button>
        )}
      </div>
    </>
  );
};