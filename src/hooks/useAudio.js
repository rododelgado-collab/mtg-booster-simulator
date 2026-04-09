import { useState, useCallback } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const playSound = useCallback((type, step = 0) => {
    // Si está en mute, salimos de la función sin reproducir nada
    if (isMuted) return; 

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
  }, [isMuted]); // Agregamos isMuted a las dependencias

  return { playSound, isMuted, toggleMute };
};
