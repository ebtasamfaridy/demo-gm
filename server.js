const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let games = {};

class Game {
    constructor(gameId) {
        this.gameId = gameId;
        this.players = [];
        this.board = Array(9).fill(null);
        this.currentPlayer = 0;
        this.gameOver = false;
        this.winner = null;
    }

    addPlayer(playerId) {
        if (this.players.length < 2) {
            this.players.push(playerId);
            return this.players.length - 1;
        }
        return -1;
    }

    makeMove(playerIndex, position) {
        if (this.gameOver || this.board[position] !== null || this.currentPlayer !== playerIndex) {
            return false;
        }

        this.board[position] = playerIndex === 0 ? 'X' : 'O';
        
        if (this.checkWinner()) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
        } else if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            this.winner = 'tie';
        } else {
            this.currentPlayer = 1 - this.currentPlayer;
        }

        return true;
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        const currentSymbol = this.currentPlayer === 0 ? 'X' : 'O';
        return winPatterns.some(pattern => 
            pattern.every(index => this.board[index] === currentSymbol)
        );
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 0;
        this.gameOver = false;
        this.winner = null;
    }
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGame', (gameId) => {
        if (!games[gameId]) {
            games[gameId] = new Game(gameId);
        }

        const game = games[gameId];
        const playerIndex = game.addPlayer(socket.id);

        if (playerIndex >= 0) {
            socket.join(gameId);
            socket.emit('playerAssigned', { playerIndex, symbol: playerIndex === 0 ? 'X' : 'O' });
            
            io.to(gameId).emit('gameState', {
                board: game.board,
                currentPlayer: game.currentPlayer,
                players: game.players,
                gameOver: game.gameOver,
                winner: game.winner
            });

            if (game.players.length === 2) {
                io.to(gameId).emit('gameReady');
            }
        } else {
            socket.emit('gameFull');
        }
    });

    socket.on('makeMove', (data) => {
        const { gameId, position } = data;
        const game = games[gameId];

        if (game) {
            const playerIndex = game.players.indexOf(socket.id);
            if (playerIndex >= 0 && game.makeMove(playerIndex, position)) {
                io.to(gameId).emit('gameState', {
                    board: game.board,
                    currentPlayer: game.currentPlayer,
                    players: game.players,
                    gameOver: game.gameOver,
                    winner: game.winner
                });
            }
        }
    });

    socket.on('resetGame', (gameId) => {
        const game = games[gameId];
        if (game && game.players.includes(socket.id)) {
            game.reset();
            io.to(gameId).emit('gameState', {
                board: game.board,
                currentPlayer: game.currentPlayer,
                players: game.players,
                gameOver: game.gameOver,
                winner: game.winner
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        for (const gameId in games) {
            const game = games[gameId];
            const playerIndex = game.players.indexOf(socket.id);
            
            if (playerIndex >= 0) {
                game.players.splice(playerIndex, 1);
                
                if (game.players.length === 0) {
                    delete games[gameId];
                } else {
                    io.to(gameId).emit('playerDisconnected', playerIndex);
                }
                break;
            }
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Tic Tac Toe server running on port ${PORT}`);
    console.log(`Access the game at http://localhost:${PORT}`);
});