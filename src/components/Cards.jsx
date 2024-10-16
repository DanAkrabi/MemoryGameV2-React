import "./Cards.css";
export default function Cards({ card, onCardClicked, isFlipped }) {
  // return (
  //   <li className="card-item" onClick={onCardClicked}>
  //     <img
  //       src={isFlipped ? card.imgSrc : "/images/backwards.png"}
  //       alt={`Card ${card.id}`}
  //       className={isFlipped ? "card-image-front" : "card-image-back"}
  //     />
  //   </li>
  // );
  return (
    <li
      className={`card-item ${isFlipped ? "" : "flipped"}`}
      onClick={
        isFlipped
          ? () => {
              return;
            }
          : onCardClicked
      }
    >
      <img
        src={card.imgSrc}
        alt={`Card ${card.id}`}
        className="card-image card-image-front"
      />
      <img
        src="/images/backwards.png"
        alt="Card back"
        className="card-image card-image-back"
      />
    </li>
  );
}
