import Cards from "./Cards";
import "./CardsPack.css";
export default function CardsPack({
  cards,
  flippedCards,
  selectedCards,
  onCardClicked,
}) {
  return (
    <div className="cards-container">
      {cards.map((card) => (
        <Cards
          card={card}
          key={card.id}
          onCardClicked={() => onCardClicked(card.id)}
          isFlipped={
            flippedCards.includes(card.id) || selectedCards.includes(card.id)
          }
        />
      ))}
    </div>
  );
}
