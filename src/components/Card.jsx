import React from 'react';

// Aceptamos las nuevas props para el resaltado
export const Card = ({ card, isHighlighted, isMostExpensive }) => {
  const { name, rarity, prices, image_uris, set_name } = card;
  const imageUrl = image_uris?.normal || 'https://cards.scryfall.com/image_placeholder.png';
  const priceUsd = prices?.usd ? `$${parseFloat(prices.usd).toFixed(2)}` : 'N/A';

  // Lógica de brillo permanente por rareza (mismo que antes)
  const isUncommon = rarity === 'uncommon';
  const isRareMythic = rarity === 'rare' || rarity === 'mythic';

  // --- LÓGICA DE RESALTADO DINÁMICO (NUEVO) ---
  
  // Resaltado temporal al aparecer (anillo amarillo brillante)
  const highlightedClasses = isHighlighted 
    ? 'ring-8 ring-yellow-400 ring-offset-4 ring-offset-slate-950 scale-105 z-30 shadow-[0_0_60px_rgba(234,179,8,0.4)]'
    : '';

  // Resaltado final permanente para la más cara (anillo verde brillante con gran brillo)
  const expensiveClasses = isMostExpensive
    ? 'ring-8 ring-green-400 ring-offset-4 ring-offset-slate-950 shadow-[0_0_70px_rgba(74,222,128,0.6)] scale-105 z-30'
    : '';

  return (
    <div className={`flex-none w-56 snap-center transition-all duration-300 relative group
      ${isRareMythic ? 'hover:scale-110' : 'hover:scale-105'}
      ${isUncommon ? 'shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}
      ${isRareMythic ? 'shadow-[0_0_35px_rgba(255,215,0,0.15)]' : ''}
      
      /* Aplicamos las clases de resaltado */
      ${highlightedClasses} 
      ${expensiveClasses}
    `}>
      {/* Glow effects based on rarity (mismo que antes) */}
      {isUncommon && <div className="absolute inset-0 bg-white/5 rounded-lg blur-2xl group-hover:bg-white/10 z-0" />}
      {isRareMythic && <div className="absolute inset-0 bg-yellow-500/10 rounded-lg blur-3xl group-hover:bg-yellow-500/20 z-0" />}
      
      {/* Contenido de la carta (subimos el z-index) */}
      <img src={imageUrl} alt={name} className="rounded-lg shadow-2xl border-2 border-gray-700 w-full relative z-10" />
      
      {/* Info panel (subimos el z-index) */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/70 p-2 rounded z-20 backdrop-blur-sm border border-white/10">
        <p className="font-black text-sm uppercase truncate text-yellow-400">{name}</p>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-gray-400 truncate w-32">{set_name}</span>
          <span className="font-bold text-green-400 text-sm">{priceUsd}</span>
        </div>
      </div>
    </div>
  );
};