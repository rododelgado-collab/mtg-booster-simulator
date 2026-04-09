import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';
import { checkAndRegisterSound } from '../utils/cardSounds';
import confetti from 'canvas-confetti';

export const Card = ({ card, isHighlighted, isMostExpensive, index = 0 }) => {
  const { playSound } = useAudio();
  const hasPlayedLocally = useRef(false);
  const price = parseFloat(card.prices?.usd || 0).toFixed(2);

  // Forzamos el uso de motion para evitar avisos del linter
  const MotionComponent = motion.div;

 useEffect(() => {
    // 1. PRIMER SEGURO: Si esta instancia ya sonó, abortamos.
    if (hasPlayedLocally.current) return;

    // 2. SEGUNDO SEGURO (Pre-registro): 
    // Marcamos el índice como "reservado" para sonar.
    if (checkAndRegisterSound(index)) {
      
      const appearanceDelay = (index * 80) + 300; 

      const timer = setTimeout(() => {
        // TERCER SEGURO: Doble check antes de ejecutar el sonido
        // Por si acaso otro componente se coló en el milisegundo.
        if (hasPlayedLocally.current) return;
        
        hasPlayedLocally.current = true;
        
        if (isMostExpensive) {
          playSound('epic');
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4ade80', '#fbbf24', '#ffffff']
          });
        } else {
          playSound('tick', index);
        }
      }, appearanceDelay);

      return () => clearTimeout(timer);
    }
    
  }, [index, isMostExpensive, playSound]);
    
    // NOTA: Quitamos card.id de aquí para que el efecto sea estable 
    // aunque los datos de la carta se actualicen ligeramente.

  const cardVariants = {
    hidden: { opacity: 0, scale: 0, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 20, 
        delay: index * 0.08 
      }
    }
  };

  return (
    <MotionComponent
      className="flex-none w-48 snap-center cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.1, 
        y: -15, 
        zIndex: 50,
        transition: { duration: 0.2 }
      }}
      // Resplandor verde persistente para la carta más cara
      style={isMostExpensive ? {
        filter: "drop-shadow(0px 0px 12px rgba(74, 222, 128, 0.7))",
      } : {}}
    >
      <div className={`relative rounded-lg shadow-2xl overflow-hidden transition-all duration-500 border-4
        ${isHighlighted ? 'border-yellow-400 scale-105 shadow-[0_0_30px_rgba(234,179,8,0.5)]' : 'border-gray-700'}
        ${isMostExpensive ? 'border-green-400' : ''}`}
      >
        {/* Etiqueta distintiva para el Top Price */}
        {isMostExpensive && (
          <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-black px-2 py-1 z-10 rounded-bl-lg animate-pulse">
            TOP PRICE
          </div>
        )}

        <img 
          src={card.image_uris?.normal} 
          alt={card.name} 
          className="w-full h-auto object-cover" 
          loading="lazy"
        />
        
        {/* Información de la carta con degradado para legibilidad */}
        <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black via-black/90 to-transparent p-3 pt-10 pointer-events-none">
          <p className="font-black text-xs uppercase tracking-wider truncate text-white drop-shadow-md">
            {card.name}
          </p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[10px] text-gray-400 font-medium truncate">
              {card.set_name}
            </p>
            <p className={`font-mono font-bold text-sm drop-shadow-md
              ${isMostExpensive ? 'text-green-400' : 'text-yellow-400'}
            `}>
              ${price}
            </p>
          </div>
        </div>
      </div>
    </MotionComponent>
  );
};