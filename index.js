const SUITS = ["♠", "♣", "♥", "♦"];
const VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
  }

  get color() {
    return ["♠", "♣"].includes(this.suit) ? "black" : "red";
  }
}

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;
let timeoutID;

document.getElementById("deal-button").addEventListener("click", dealCards);
document.getElementById("hit-button").addEventListener("click", playerHit);
document.getElementById("stand-button").addEventListener("click", playerStand);
document
  .getElementById("restart-button")
  .addEventListener("click", function () {
    clearTimeout(timeoutID); // Clear the timeout
    restartGame(); // Manually restart the game
  });

function createDeck() {
  deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push(new Card(value, suit));
    }
  }
  deck = deck.sort(() => Math.random() - 0.5); // Shuffle
}

function createCardElement(card, isHidden = false) {
//   const cardDiv = document.createElement("div");
//   cardDiv.className = `card${isHidden ? " hidden" : ""}`;

//   cardDiv.innerHTML = `
//                 <div class="card-inner">
//                     <div class="card-front">
//                         <div class="card-value ${card.color}">${card.value}</div>
//                         <div class="card-suit ${card.color}">${card.suit}</div>
//                         <div class="card-value ${card.color}" style="transform: rotate(180deg)">${card.value}</div>
//                     </div>
//                     <div class="card-back"></div>
//                 </div>
//             `;

//   return cardDiv;

const cardDiv = document.createElement("div");
cardDiv.className = `card${isHidden ? " hidden" : ""}`;

// Convert card suit and value to lowercase format for image file naming
const suitName = card.suit.toLowerCase().replace('♠', 'spades')
                                       .replace('♣', 'clubs')
                                       .replace('♥', 'hearts')
                                       .replace('♦', 'diamonds');
const valueName = card.value === "A" ? "ace" :
                  card.value === "K" ? "king" :
                  card.value === "Q" ? "queen" :
                  card.value === "J" ? "jack" :
                  card.value;

// Path to the image in the cards folder
const imagePath = `cards/${valueName}_of_${suitName}.png`;

cardDiv.innerHTML = `
    <div class="card-inner">
        <div class="card-front">
            <img src="${imagePath}" alt="${card.value} of ${card.suit}" class="card-image">
        </div>
        <div class="card-back"></div>
    </div>
`;

return cardDiv;
}

function dealCards() {
  createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  gameActive = true;

  // Clear previous cards
  document.getElementById("dealer-cards").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";

  // Reset dealer's score
  document.getElementById("dealer-score").innerText = "";

  // Deal dealer's cards (second card hidden)
  dealerHand.forEach((card, index) => {
    const cardElement = createCardElement(card, index === 1);
    document.getElementById("dealer-cards").appendChild(cardElement);
  });

  // Deal player's cards (all visible)
  playerHand.forEach((card) => {
    const cardElement = createCardElement(card, false);
    document.getElementById("player-cards").appendChild(cardElement);
  });

  updateScores(); // Display initial scores
  toggleButtons(true);
  checkGameState();
}

function playerHit() {
  if (!gameActive) return;
  const newCard = deck.pop();
  playerHand.push(newCard);
  const cardElement = createCardElement(newCard, false);
  document.getElementById("player-cards").appendChild(cardElement);

  updateScores();
  checkGameState(); // Check if the game has ended (busted or won)
}

function playerStand() {
  if (!gameActive) return;
  gameActive = false;

  // Reveal dealer's hidden card
  const hiddenCard = document.querySelector(".card.hidden");
  if (hiddenCard) {
    hiddenCard.classList.remove("hidden");
  }

  // Dealer draws cards until they reach 17 or higher
  while (getHandValue(dealerHand) < 17) {
    const newCard = deck.pop();
    dealerHand.push(newCard);
    const cardElement = createCardElement(newCard, false);
    document.getElementById("dealer-cards").appendChild(cardElement);
  }

  updateScores(true);
  checkGameState();
}

function updateScores(showDealerScore = false) {
  const playerScore = getHandValue(playerHand);
  document.getElementById(
    "player-score"
  ).innerText = `Your Score: ${playerScore}`;

  if (showDealerScore) {
    const dealerScore = getHandValue(dealerHand);
    document.getElementById(
      "dealer-score"
    ).innerText = `Dealer Score: ${dealerScore}`;
  }
}

function getHandValue(hand) {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === "A") {
      value += 11;
      aces += 1;
    } else if (["K", "Q", "J"].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
}

function checkGameState() {
  const playerScore = getHandValue(playerHand);
  const dealerScore = getHandValue(dealerHand);
  const resultElement = document.getElementById("result");

  if (playerScore > 21) {
    resultElement.innerText = "Bust! You lose.";
    resultElement.className = "result lose";
    gameActive = false;
    document.getElementById("deal-button").style.display = "none"; // Hide Deal button
    document.getElementById("hit-button").style.display = "none"; // Hide Hit button
    document.getElementById("stand-button").style.display = "none"; // Hide Stand button
    document.getElementById("restart-button").style.display = "inline-block"; // Show New Game button

    // Reset the game after 3 seconds
    timeoutID = setTimeout(() => {
      restartGame();
    }, 7000); // Reset after 3 seconds
  } else if (playerScore == 21) {
    resultElement.innerText = "It's a BlackJack!";
    resultElement.className = "result win";
    toggleButtons(false);
    // Disable the "Deal" button and show the "New Game" button
    document.getElementById("deal-button").style.display = "none"; // Hide Deal button
    document.getElementById("restart-button").style.display = "inline-block"; // Show New Game button

    // Reset game after 3 seconds
    timeoutID = setTimeout(() => {
      restartGame();
    }, 7000); // 7000ms = 3 seconds
  } else if (!gameActive) {
    if (dealerScore > 21) {
      resultElement.innerText = "Dealer busts! You win!";
      resultElement.className = "result win";
    } else if (playerScore > dealerScore) {
      resultElement.innerText = "You win!";
      resultElement.className = "result win";
    } else if (playerScore === dealerScore) {
      resultElement.innerText = "Push! It's a tie!";
      resultElement.className = "result";
    } else {
      resultElement.innerText = "Dealer wins!";
      resultElement.className = "result lose";
    }
    toggleButtons(false);
    // Disable the "Deal" button and show the "New Game" button
    document.getElementById("deal-button").style.display = "none"; // Hide Deal button
    document.getElementById("restart-button").style.display = "inline-block"; // Show New Game button

    // Reset game after 3 seconds
    timeoutID = setTimeout(() => {
      restartGame();
    }, 7000); // 7000ms = 3 seconds
  }
}

function toggleButtons(enable) {
  document.getElementById("hit-button").style.display = enable
    ? "inline-block"
    : "none";
  document.getElementById("stand-button").style.display = enable
    ? "inline-block"
    : "none";
  document.getElementById("deal-button").style.display = enable
    ? "none"
    : "inline-block";
}

function restartGame() {
  clearTimeout(timeoutID);
  // Clear card areas
  document.getElementById("dealer-cards").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";

  // Reset dealer's score
  document.getElementById("dealer-score").innerText = "";

  // Clear scores and result
  document.getElementById("player-score").innerText = "";
  document.getElementById("result").innerText = "";
  document.getElementById("result").className = "result";

  // Reset game state
  toggleButtons(false);
  gameActive = false;

  // Reset action buttons
  document.getElementById("deal-button").style.display = "inline-block";
  document.getElementById("restart-button").style.display = "none";
}