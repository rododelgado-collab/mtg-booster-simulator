export const Card = ({ card }) => {
  const isUncommon = card.rarity === 'uncommon';
  const isRare = card.rarity === 'rare' || card.rarity === 'mythic';

  return (
    <div className={`flex-none w-64 p-2 transition-all duration-500 hover:scale-110
      ${isUncommon ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}
      ${isRare ? 'drop-shadow-[0_0_15px_rgba(255,215,0,0.9)]' : ''}
    `}>
      <img 
        src={card.image_uris?.normal} 
        alt={card.name} 
        className="rounded-[4%] w-full shadow-2xl"
      />
      <div className="mt-3 text-center bg-black/60 p-2 rounded-lg backdrop-blur-sm">
        <p className="font-bold text-sm truncate">{card.name}</p>
        <p className="text-yellow-400 font-mono text-lg">
          {card.prices.usd ? `$${card.prices.usd}` : 'Priceless'}
        </p>
      </div>
    </div>
  );
};