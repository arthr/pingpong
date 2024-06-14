const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {}; // Armazena o estado dos jogadores
let ball = { x: 400, y: 300, speedX: 5, speedY: 5 }; // Estado inicial da bola

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Define a posição inicial dos jogadores
    players[socket.id] = {
        paddleY: 300,
        isPlayerOne: Object.keys(players).length === 0 // O primeiro jogador é o Player One
    };

    // Envia o estado inicial para o novo jogador
    socket.emit('currentState', { players, ball });

    // Notifica os outros jogadores sobre o novo jogador
    socket.broadcast.emit('newPlayer', { playerId: socket.id, paddleY: players[socket.id].paddleY });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Remove o jogador do estado
        delete players[socket.id];
        // Notifica os outros jogadores sobre a desconexão
        socket.broadcast.emit('playerDisconnected', socket.id);
    });

    socket.on('movePaddle', (data) => {
        if (players[socket.id]) {
            players[socket.id].paddleY = data.y;
            // Envia a posição da raquete para todos os outros clientes
            socket.broadcast.emit('movePaddle', { playerId: socket.id, y: data.y });
        }
    });

    socket.on('ballData', (data) => {
        if (players[socket.id] && players[socket.id].isPlayerOne) {
            // Apenas o Player One controla a bola
            ball = data;
            socket.broadcast.emit('ballData', ball);
        }
    });
});

setInterval(() => {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y + 10 > 600 || ball.y - 10 < 0) {
        ball.speedY = -ball.speedY;
    }

    if (ball.x + 10 > 800 || ball.x - 10 < 0) {
        ball.speedX = -ball.speedX;
    }

    io.emit('ballData', ball);
}, 1000 / 60);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
