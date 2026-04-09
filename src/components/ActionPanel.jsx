import React from 'react';

export const ActionPanel = ({
  packValue, isRevealing, showShippingPrompt, setShowShippingPrompt, 
  packClaimed, claimMode, outOfStockCard,
  handleSellPack, handleClaimPhysical, confirmShipping, alertRef
}) => {
  return (
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
        <div className="w-full max-w-lg">
          {claimMode === 'sold' && (
            <div className="bg-green-500/10 border-2 border-green-500/50 rounded-xl px-10 py-6 text-center mt-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <div className="text-4xl mb-2 animate-bounce-short">✅</div>
              <p className="text-green-400 font-black text-xl tracking-widest uppercase">¡SOBRE PROCESADO!</p>
              <p className="text-green-200/70 font-medium mt-1 italic">
                Tus créditos han sido actualizados. <br/>
                <span className="text-xs uppercase font-bold tracking-tighter opacity-50">Volviendo a la tienda en 3s...</span>
              </p>
            </div>
          )}

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

          {claimMode === 'partial' && outOfStockCard && (
            <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl px-6 py-6 text-center mt-4 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              <div className="text-4xl mb-2 animate-bounce-short">⚠️</div>
              <p className="text-orange-400 font-black text-xl tracking-widest uppercase">¡ENVÍO PARCIAL!</p>
              <p className="text-orange-200/80 font-medium mt-2">
                La carta <span className="font-bold text-white">"{outOfStockCard.name}"</span> estaba agotada.
              </p>
              <p className="text-orange-200/80 font-medium mt-1 italic">
                Ha sido vendida por <span className="text-green-400 font-bold">${parseFloat(outOfStockCard.prices?.usd || 0).toFixed(2)}</span>. El resto va en camino.
              </p>
              <p className="text-xs uppercase font-bold tracking-tighter opacity-50 text-orange-200/70 mt-3">
                Volviendo a la tienda en 4s...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};