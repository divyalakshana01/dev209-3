let cards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;
let timerInterval = null;
let seconds= 0;


const board = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-count');
const timerDisplay = document.getElementById('timer');
const globalMoveDisplay = document.getElementById('total-move-count');
// Added newly
const selectdifficulty = document.getElementById('difficulty');
// Expanded colors for 8x8 grid
const colors =['#e74c3c', '#2ecc71','#3498db', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e', 
    '#7f8c8d', '#d35400', '#c0392b', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', 
    '#f39c12', '#bdc3c7', '#4834d4', '#be2edd', '#eb4d4b', '#6ab04c', '#ff7979', '#f0932b',
    '#22a6b3', '#130f40', '#95afc0', '#535c68', '#009432', '#0652DD', '#ED4C67', '#B53471'];

// Logic for Saving
const saveState = () => {
    const cardData = Array.from(document.querySelectorAll('.card')).map(card => ({
        color: card.dataset.color,
        isFlipped: card.classList.contains('flipped'),
    }));

    const state = {
        moves,
        seconds,
        difficulty: selectdifficulty.value,
        cards: cardData,
        matches
    };
    sessionStorage.setItem('memoryGameState', JSON.stringify(state));
};

const updateGlobalMoves = () => {
    // Save to local storage shared across all tabs
    let total = parseInt(localStorage.getItem('globalTotalMoves')) || 0;
    total++;
    localStorage.setItem('globalTotalMoves', total);
    globalMoveDisplay.textContent = total;
};

// Listen for changes in other tabs to update the Global Counter in real-time
window.addEventListener('storage', (e) => {
    if(e.key === 'globalTotalMoves') {
        globalMoveDisplay.textContent = e.newValue;
    }
});

// Game Logic
const initGame = (isRefresh = false) => {
    const savedData = sessionStorage.getItem('memoryGameState');

    // if its refresh and we are to store data, store it
    if(isRefresh && savedData){
        const data = JSON.parse(savedData);
        moves = data.moves;
        seconds = data.seconds;
        matches = data.matches;
        selectdifficulty.value = data.difficulty;

        rebuildBoard(data.cards, data.difficulty);
    }
    else {
        sessionStorage.removeItem('memoryGameState');
        const size = parseInt(selectdifficulty.value);
        const totalPairs = (size*size) / 2;

        moves = 0;
        matches = 0;
        seconds = 0;

        const gameColors = [...colors.slice(0, totalPairs), ...colors.slice(0, totalPairs)];
        const shuffled = gameColors.sort(() => Math.random()- 0.5);

        buildBoard(shuffled, size);
    }

    // Update display
    moveDisplay.textContent = moves;
    timerDisplay.textContent = seconds;
    globalMoveDisplay.textContent = localStorage.getItem('globalTotalMoves') || 0;

    clearInterval(timerInterval);
    startTimer();
};

const buildBoard = (colorList, size) => {
    board.innerHTML = '';
    board.style.setProperty('--size', size);
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    colorList.forEach(color => {
        const card = createCard(color, false);
        board.appendChild(card);    
    });
};

const rebuildBoard = (cardArray, size) => {
    board.innerHTML = '';
    board.style.setProperty('--size', size);
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    cardArray.forEach(data => {
        const card = createCard(data.color, data.isFlipped);
        board.appendChild(card);
    });
};


    /***const initGame = () => {
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
};***/

const createCard = (color, isFlipped = false) => {
    const card =  document.createElement('div');
    card.classList.add('card');
    if (isFlipped) card.classList.add('flipped');
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

        saveState();

        if (flippedCards.length === 2) {
            moves++;
            moveDisplay.textContent = moves;
            updateGlobalMoves(); // Increment across tabs
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
        saveState();

        const size = parseInt(selectdifficulty.value);
        if (matches === (size * size) / 2) {
            clearInterval(timerInterval);
            sessionStorage.removeItem('memoryGameState');
            setTimeout(() => alert(`Game Over! Score: ${moves} moves in ${seconds}s`), 500);
        }
     } else{
            setTimeout(() => {
                mismatchSound.play();

                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                saveState();
            }, 1000);
        }
    };

    const startTimer = () => {
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.textContent = seconds;
            saveState();
        }, 1000);
    };

    // Point 2 (DOM Manipulation): Direct event handling
    document.getElementById('start-btn').onclick = () => initGame(false);

    initGame(true);


