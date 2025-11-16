const socket = io();

let currentGameId = null;
let playerIndex = null;
let playerSymbol = null;
let isGameReady = false;

const gameSetup = document.getElementById('gameSetup');
const gameArea = document.getElementById('gameArea');
const gameIdInput = document.getElementById('gameIdInput');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameIdDisplay = document.getElementById('gameId');
const playerInfo = document.getElementById('playerInfo');
const gameStatus = document.getElementById('gameStatus');
const gameBoard = document.getElementById('gameBoard');
const resetBtn = document.getElementById('resetBtn');
const newGameBtn = document.getElementById('newGameBtn');

function generateGameId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function showGameArea() {
    gameSetup.classList.add('hidden');
    gameArea.classList.remove('hidden');
}

function showGameSetup() {
    gameSetup.classList.remove('hidden');
    gameArea.classList.add('hidden');
}

function updateGameBoard(board) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const value = board[index];
        cell.textContent = value || '';
        
        if (value === 'X') {
            cell.classList.add('winner-x');
        } else if (value === 'O') {
            cell.classList.add('winner-o');
        } else {
            cell.classList.remove('winner-x', 'winner-o');
        }
        
        cell.classList.remove('disabled');
        if (value !== null || !isGameReady) {
            cell.classList.add('disabled');
        }
    });
}

function updateGameStatus(gameState) {
    if (gameState.gameOver) {
        if (gameState.winner === 'tie') {
            gameStatus.textContent = "It's a tie!";
            gameStatus.className = 'game-status tie';
        } else {
            const winnerSymbol = gameState.winner === 0 ? 'X' : 'O';
            const isWinner = gameState.winner === playerIndex;
            gameStatus.textContent = isWinner ? 'You Won! 🎉' : `Player ${winnerSymbol} Wins!`;
            gameStatus.className = `game-status ${winnerSymbol === 'X' ? 'winner-x' : 'winner-o'}`;
        }
        resetBtn.classList.remove('hidden');
    } else {
        const isMyTurn = gameState.currentPlayer === playerIndex;
        const currentSymbol = gameState.currentPlayer === 0 ? 'X' : 'O';
        gameStatus.textContent = isMyTurn ? 'Your turn!' : `Player ${currentSymbol}'s turn`;
        gameStatus.className = 'game-status';
        resetBtn.classList.add('hidden');
    }
}

joinGameBtn.addEventListener('click', () => {
    const gameId = gameIdInput.value.trim() || generateGameId();
    currentGameId = gameId;
    socket.emit('joinGame', gameId);
});

gameIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinGameBtn.click();
    }
});

gameBoard.addEventListener('click', (e) => {
    if (e.target.classList.contains('cell') && !e.target.classList.contains('disabled')) {
        const position = parseInt(e.target.dataset.index);
        socket.emit('makeMove', { gameId: currentGameId, position });
    }
});

resetBtn.addEventListener('click', () => {
    socket.emit('resetGame', currentGameId);
});

newGameBtn.addEventListener('click', () => {
    currentGameId = null;
    playerIndex = null;
    playerSymbol = null;
    isGameReady = false;
    gameIdInput.value = '';
    showGameSetup();
});

socket.on('playerAssigned', (data) => {
    playerIndex = data.playerIndex;
    playerSymbol = data.symbol;
    
    gameIdDisplay.textContent = `Game ID: ${currentGameId}`;
    playerInfo.textContent = `You are Player ${playerSymbol}`;
    
    showGameArea();
});

socket.on('gameState', (gameState) => {
    updateGameBoard(gameState.board);
    
    if (gameState.players.length === 2) {
        isGameReady = true;
        updateGameStatus(gameState);
    } else {
        gameStatus.textContent = 'Waiting for another player to join...';
        gameStatus.className = 'game-status';
        isGameReady = false;
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.add('disabled'));
    }
});

socket.on('gameReady', () => {
    isGameReady = true;
    gameStatus.textContent = 'Game started! Player X goes first.';
    gameStatus.className = 'game-status';
});

socket.on('gameFull', () => {
    alert('This game is full. Please try a different Game ID.');
});

socket.on('playerDisconnected', (disconnectedPlayerIndex) => {
    isGameReady = false;
    gameStatus.textContent = 'Other player disconnected. Waiting for reconnection...';
    gameStatus.className = 'game-status';
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.add('disabled'));
});

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    gameStatus.textContent = 'Connection lost. Trying to reconnect...';
    gameStatus.className = 'game-status';
});