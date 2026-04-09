import React from 'react';

export const NavBar = ({ credits, packCost, isMuted, toggleMute, resetProgress }) => {
  return (
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

      <div className="flex items-center gap-4">
        {/* BOTÓN DE REINICIAR (NUEVO) */}
        {resetProgress && (
          <button
            onClick={resetProgress}
            className="w-10 h-10 rounded-full bg-red-900/50 border border-red-700 flex items-center justify-center text-lg hover:bg-red-700 transition-colors shadow-inner active:scale-95"
            title="Reiniciar créditos"
          >
            🔄
          </button>
        )}

        {/* BOTÓN DE MUTE */}
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xl hover:bg-gray-700 transition-colors shadow-inner active:scale-95"
          title={isMuted ? "Activar Sonido" : "Silenciar"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        {/* CRÉDITOS */}
        <div className={`px-5 py-2 rounded-full border-2 transition-all flex items-center gap-2 font-mono text-lg shadow-inner
          ${credits < packCost ? 'bg-red-950 border-red-500 text-red-400' : 'bg-black border-yellow-500/50 text-yellow-400'}`}
        >
          <span>💰</span>
          <span className="font-bold">${credits.toFixed(2)}</span>
        </div>
      </div>
    </nav>
  );
};