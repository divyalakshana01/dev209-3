let cards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;
let timerInterval = null;
let seconds= 0;


const board = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-count');
const timerDisplay = document.getElementById('timer');

// Expanded colors for 8x8 grid
const colors =['#e74c3c', '#2ecc71','#3498db', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e', 
    '#7f8c8d', '#d35400', '#c0392b', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', 
    '#f39c12', '#bdc3c7', '#4834d4', '#be2edd', '#eb4d4b', '#6ab04c', '#ff7979', '#f0932b',
    '#22a6b3', '#130f40', '#95afc0', '#535c68', '#009432', '#0652DD', '#ED4C67', '#B53471'];

const initGame = () => {
    const size = parseInt(document.getElementById('difficulty').value);
    const totalPairs = (size*size)/ 2;

    board.style.setProperty('--size', size);    

    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    //Dynamic height adjustment
    
    board.innerHTML = '';

    flippedCards = [];
    moves = 0;
    matches = 0;
    seconds = 0;
    moveDisplay.textContent = moves;
    timerDisplay.textContent = seconds;
    clearInterval(timerInterval);
    startTimer();

    const gameColors = [...colors.slice(0, totalPairs), ...colors.slice(0, totalPairs)];

    const shuffled = gameColors.sort(() => Math.random()- 0.5);

    shuffled.forEach(color => {
        const card = createCard(color);
        board.appendChild(card);
    });
};

const createCard = (color) => {
    const card =  document.createElement('div');
    card.classList.add('card');
    card.dataset.color = color;

    card.innerHTML = `
                <div class="card-face card-front">?</div>
                <div class="card-back card-face" style="background-color: ${color}"></div>
            `;

            // Point 3  (Event handling)
            card.addEventListener('click', () => handleCardClick(card));
            return card;
};

// Sounds set up

const flipSound = new Audio('flip.mp3');
const matchSound = new Audio('match.mp3');
const mismatchSound = new Audio('mismatch.mp3');

const handleCardClick = (card) => {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {

        flipSound.play();
        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            moveDisplay.textContent = moves;
            checkMatch();
        }
    }
};

const checkMatch = () => {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.color === card2.dataset.color;

    if (isMatch) {
        setTimeout(() => matchSound.play(), 300);
        matches++;
        flippedCards = [];
        const size = parseInt(document.getElementById('difficulty').value);
        if (matches === (size * size) / 2) {
            clearInterval(timerInterval);
            setTimeout(() => alert(`Game Over! Score: ${moves} moves in ${seconds}s`), 500);
        }
     } else{
            setTimeout(() => {
                mismatchSound.play();

                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    };

    const startTimer = () => {
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.textContent = seconds;
        }, 1000);
    };

    // Point 2 (DOM Manipulation): Direct event handling
    document.getElementById('start-btn').onclick = initGame;

    initGame();


