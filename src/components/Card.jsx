import React from 'react';
import { motion } from 'framer-motion';
// Importa tu hook (ajusta la ruta según la estructura de tus carpetas)
import useAudio from '../hooks/useAudio'; 

export const Card = ({ card, isHighlighted, isMostExpensive, index = 0 }) => {
  const price = parseFloat(card.prices?.usd || 0).toFixed(2);
  
  // Extraemos la función para reproducir del hook
  const { playSound } = useAudio(); 

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,       
      y: 100,         
      rotateX: 180,   
      rotateY: 90,    
    },
    visible: { 
      opacity: 1, 
      scale: 1,       
      y: 0,           
      rotateX: 0,     
      rotateY: 0,     
      transition: {
        type: "spring",      
        stiffness: 70,      
        damping: 15,         
        duration: 0.8,
        delay: index * 0.02  
      }
    }
  };

  return (
    <motion.div
      className="flex-none w-48 snap-center cursor-pointer"
      variants={cardVariants}   
      initial="hidden"         
      animate="visible"
      // ¡AQUÍ ESTÁ LA MAGIA!
      // Esto llamará al sonido exactamente cuando el delay de 0.02 * index haya terminado
      onAnimationStart={() => {
        playSound(); 
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -10,
        transition: { duration: 0.2 } 
      }}
    >
      <div 
        className={`relative rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border-4
          ${isHighlighted ? 'border-yellow-400 scale-105 shadow-[0_0_30px_rgba(234,179,8,0.5)]' : 'border-gray-700'}
          ${isMostExpensive ? 'border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : ''}
        `}
      >
        <img 
          src={card.image_uris?.normal} 
          alt={card.name} 
          className="w-full h-auto object-cover" 
          loading="lazy"
        />
        
        <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black/90 to-black/10 p-3 pt-10 pointer-events-none">
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
    </motion.div>
  );
};