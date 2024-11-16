import { useReducer, useEffect, useState } from "react";
import "./App.css";
import CardsPack from "./components/CardsPack";

function createCards(cardsAmount) {
  const cardsArray = [];
  for (let i = 1; i <= cardsAmount; i++) {
    cardsArray.push({
      id: i,
      imgSrc: `./dist/images/card${i}.png`,
    });
    cardsArray.push({
      id: cardsAmount + i,
      imgSrc: `./dist/images/card${i}.png`,
    });
  }
  return cardsArray;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function reducer(state, action) {
  switch (action.type) {
    case "game-starts":
      const resetPlayers = state.playersArray.map((player) => ({
        ...player,
        score: 0, // Resetting the score to 0
      }));
      return {
        ...state,
        isGameStarted: !state.isGameStarted,
        isGameFinished: false,
        playersArray: resetPlayers,
        playerTurn: 0,
      };
    case "initialize-cards":
      const shuffledCards = shuffleArray(createCards(state.cardsAmount));
      return {
        ...state,
        cards: shuffledCards,
        flippedCards: [],
        selectedCards: [],
        isGameFinished: false,
      };

    case "set-cards-amount":
      return { ...state, cardsAmount: action.payload };

    case "set-players-amount":
      const playersCount = parseInt(action.payload, 10);
      const newPlayersArray = Array.from(
        { length: playersCount },
        (_, index) => ({
          name: "",
          score: 0,
          playerTurn: index + 1, // Player turn based on their position in the array
        })
      );
      return {
        ...state,
        playersAmount: playersCount,
        playersArray: newPlayersArray,
      };

    case "flip-card":
      if (state.disableCardsClicks) {
        return state;
      }
      const newSelectedCards = [...state.selectedCards, action.payload];
      let disableClicks = state.selectedCards.length + 1 === 2;

      return {
        ...state,
        selectedCards: newSelectedCards,
        disableCardsClicks: disableClicks,
      };

    case "check-match":
      console.log("Checking match:", state.selectedCards);
      const [firstCard, secondCard] = state.selectedCards;
      let newState = { ...state, selectedCards: [] }; // Clear selectedCards

      if (Math.abs(firstCard - secondCard) === state.cardsAmount) {
        console.log("Match found", { firstCard, secondCard });
        newState.flippedCards = [...state.flippedCards, firstCard, secondCard];
        console.log(
          "Score before:",
          newState.playersArray[state.playerTurn].score
        );
        newState.playersArray[state.playerTurn].score += 0.5;
        console.log(
          "Score after:",
          newState.playersArray[state.playerTurn].score
        );
      } else {
        console.log("No match", { firstCard, secondCard });
        if (newState.playerTurn + 1 === newState.playersAmount) {
          newState.playerTurn = 0;
        } else {
          newState.playerTurn++;
        }
      }
      state.disableCardsClicks = false;

      return newState;

    case "check-if-game-is-finished":
      if (state.flippedCards === state.cardsAmount * 2) {
        newState.isGameFinished = true;
      }

    case "end-game":
      // Clone the playersArray from the state and sort it by score in descending order.
      const sortedPlayers = [...state.playersArray].sort(
        (a, b) => b.score - a.score
      );

      return {
        ...state,
        playersLeaderboard: sortedPlayers, // Update playersLeaderboard with the sorted array.
        isGameFinished: true,
        isGameStarted: false,
      };

    case "set-players-array":
      //creating a new array with the updated player
      const updatedArray = state.playersArray.map((player, index) => {
        if (index === action.index) {
          return { ...player, name: action.payload };
        }
        return player;
      });
      return {
        ...state,
        playersArray: updatedArray,
      };

    default:
      throw new Error("Unknown action in reducer");
  }
}

function App() {
  const initialState = {
    isGameStarted: false,
    cardsAmount: 0,
    cards: [],
    flippedCards: [],
    selectedCards: [],
    isGameFinished: false,
    playersAmount: 1,
    playersArray: [{ name: "", score: 0, playerTurn: null }],
    playerTurn: 0, //indicates which players is playing
    playersLeaderboard: [],
    disableCardsClicks: false, //disabling the functionality of cards being clicked after we already choosed 2 cards
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const [time, setTime] = useState(0);
  // const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let timer;
    if (state.isGameStarted) {
      setTime(0); // איפוס הזמן בתחילת המשחק
      timer = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [state.isGameStarted]);

  useEffect(() => {
    // Checking if all pairs have been revealed
    if (
      state.cards.length != 0 &&
      state.flippedCards.length === state.cards.length
    ) {
      console.log("Game finished");
      dispatch({ type: "end-game" });
    }
  }, [state.flippedCards.length, state.cards.length, dispatch]);

  useEffect(() => {
    if (state.isGameStarted) {
      dispatch({ type: "initialize-cards" });
    }
  }, [state.cardsAmount, state.isGameStarted]);

  const handleCardsAmountChange = (event) => {
    const amount = parseInt(event.target.value, 10);
    if (!isNaN(amount)) {
      dispatch({ type: "set-cards-amount", payload: amount });
    }
  };  

  function handleCardClicked(id) {
    dispatch({ type: "flip-card", payload: id });

    if (state.selectedCards.length === 1) {
      setTimeout(() => {
        dispatch({ type: "check-match" });
      }, 500);
    }
  }

  function handlePlayersAmount(event) {
    dispatch({ type: "set-players-amount", payload: event.target.value });
  }

  function handlePlayersArray(index, event) {
    dispatch({
      type: "set-players-array",
      payload: event.target.value,
      index: index,
    });
  }

  return (
    <>
      {!state.isGameStarted && (
        <div className="opening-container">
          <div className="players-cards-input-container">
            <div className="input-players-amount-container">
              <div className="players-text-input-container">
                <p className="input-players-amount-text">
                  Choose players amount:
                </p>
                <input
                  className="input-players-amount"
                  placeholder="Choose players amount"
                  type="number"
                  min="1"
                  max="4"
                  value={state.playersAmount}
                  onChange={handlePlayersAmount}
                />
              </div>
            </div>

            <div className="cards-amount-container">
              <p className="cards-amount-text">Cards amount:</p>
              <input
                className="input-cards-amount"
                placeholder="Choose cards amount"
                type="number"
                min="3"
                max="30"
                value={state.cardsAmount}
                onChange={handleCardsAmountChange}
              />
            </div>
          </div>
          <div className="input-names-container">
            {state.playersArray.map((player, index) => (
              <input
                className="input-players-map"
                key={index}
                type="text"
                placeholder={`Player ${index + 1}`}
                value={player.name}
                onChange={(event) => handlePlayersArray(index, event)}
              />
            ))}
          </div>
          <button
            className={state.isGameStarted ? "btn-start-active" : "btn-start"}
            onClick={() => dispatch({ type: "game-starts" })}
          >
            {state.isGameStarted ? "Close Game" : "Start Game"}
          </button>
        </div>
      )}
      {state.isGameFinished && (
        <div>
          <h2>Game Over!</h2>
          <div>
            {state.playersLeaderboard.map((player, index) => (
              <p key={index}>{`${player.name}: ${player.score} points`}</p>
            ))}
          </div>
        </div>
      )}

      {state.isGameStarted && (
        <>
          <div className="names-timer-container">
            <div className="timer-container">
              <div className="timer">
                <strong>Time</strong>: {time}
              </div>
            </div>
            <div className="players-active">
              {state.playersArray
                .map((player) => `${player.name}: ${player.score}`)
                .join(", ")}
            </div>
          </div>
          <ul className="card-container">
            <CardsPack
              cards={state.cards}
              flippedCards={state.flippedCards}
              onCardClicked={handleCardClicked}
              selectedCards={state.selectedCards}
            />
          </ul>
        </>
      )}
    </>
  );
}

export default App;
