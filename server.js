const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {}; // Armazena o estado dos jogadores
let ball = { x: 400, y: 300, speedX: 0, speedY: 0 }; // Estado inicial da bola
let playerColors = ['#ff0000', '#0000ff']; // Cores dos jogadores

function resetBall() {
    ball.x = 400;
    ball.y = 300;
    ball.speedX = 0;
    ball.speedY = 0;
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    if (Object.keys(players).length < 2) {
        let color = playerColors[Object.keys(players).length];
        let side = Object.keys(players).length === 0 ? 'left' : 'right';
        players[socket.id] = {
            paddleY: 300,
            color: color,
            isPlayer: true,
            side: side // Define o lado do jogador
        };

        if (Object.keys(players).length === 2) {
            ball.speedX = 5;
            ball.speedY = 5;
        }
    } else {
        players[socket.id] = {
            isPlayer: false
        };
    }

    socket.emit('currentState', { players, ball });

    socket.broadcast.emit('newPlayer', { playerId: socket.id, playerData: players[socket.id] });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete players[socket.id];

        if (Object.keys(players).length < 2) {
            resetBall();
            io.emit('resetBall', ball);
        }

        socket.broadcast.emit('playerDisconnected', socket.id);
    });

    socket.on('movePaddle', (data) => {
        if (players[socket.id] && players[socket.id].isPlayer) {
            players[socket.id].paddleY = data.y;
            socket.broadcast.emit('movePaddle', { playerId: socket.id, y: data.y });
        }
    });

    socket.on('ballData', (data) => {
        if (players[socket.id] && players[socket.id].isPlayer) {
            ball = data;
            socket.broadcast.emit('ballData', ball);
        }
    });
});

setInterval(() => {
    if (Object.keys(players).length === 2) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.y + 10 > 600 || ball.y - 10 < 0) {
            ball.speedY = -ball.speedY;
        }

        if (ball.x + 10 > 800 || ball.x - 10 < 0) {
            ball.speedX = -ball.speedX;
        }

        io.emit('ballData', ball);
    }
}, 1000 / 30);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
