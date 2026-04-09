import { useState, useCallback } from 'react';

// 1. EL MOTOR DE SONIDO (Compartido por todas)
let audioCtx = null;

// 2. LA VARIABLE GLOBAL DE MUTE
// Al estar fuera del hook, si un botón la cambia a "true", 
// TODAS las cartas se enteran inmediatamente.
let isGlobalMuted = false; 

export const useAudio = () => {
  // Este estado solo sirve para que tu botón de Mute se pinte correctamente (ícono de encendido/apagado)
  const [isMuted, setIsMuted] = useState(isGlobalMuted);

  const toggleMute = () => {
    isGlobalMuted = !isGlobalMuted; // Cambiamos el jefe global
    setIsMuted(isGlobalMuted);      // Actualizamos la vista del botón
  };

  const playSound = useCallback((type = 'tick', step = 0) => {
    // Si la variable global dice silencio, cancelamos al instante
    if (isGlobalMuted) return; 

    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audioCtx = new AudioContext();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;

    if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580 + (step * 10), now); 
        
        gainNode.gain.setValueAtTime(0.05, now); 
        
        // Lo estiramos a 0.08s para que llene el espacio exacto entre cartas
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08); 
        
        osc.start(now);
        osc.stop(now + 0.08); 
      }else if (type === 'epic') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); 
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.5); 
        gainNode.gain.setValueAtTime(0.2, now);
        
        // El sonido épico dura 1.5s, se desvanecerá suavemente al final
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5); 
        osc.start(now);
        osc.stop(now + 1.5);
      }
    } catch (e) {
      console.log("El navegador bloqueó el audio", e);
    }
  }, []); 

  return { playSound, isMuted, toggleMute };
};