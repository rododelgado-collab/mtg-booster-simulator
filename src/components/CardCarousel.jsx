import React from 'react';
import { Card } from './Card';

export const CardCarousel = ({ cards, carouselRef, highlightedCardId, mostExpensiveCardId }) => {
  return (
    <div ref={carouselRef} className="flex overflow-x-auto gap-4 px-10 pb-6 snap-x scroll-smooth">
      {cards.map((card, i) => (
        <Card 
          key={`${card.id}-${i}`} 
          card={card} 
          isHighlighted={card.id === highlightedCardId} 
          isMostExpensive={card.id === mostExpensiveCardId} 
        />
      ))}
    </div>
  );
};