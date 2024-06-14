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
let scores = { left: 0, right: 0 }; // Placar

function resetBall() {
    ball.x = 400;
    ball.y = 300;
    ball.speedX = 5;
    ball.speedY = 5;
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
            resetBall();
        }
    } else {
        players[socket.id] = {
            isPlayer: false
        };
    }

    socket.emit('currentState', { players, ball, scores });

    socket.broadcast.emit('newPlayer', { playerId: socket.id, playerData: players[socket.id] });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        const wasPlayer = players[socket.id] && players[socket.id].isPlayer;
        delete players[socket.id];

        if (wasPlayer && Object.keys(players).filter(id => players[id].isPlayer).length < 2) {
            resetBall();
            io.emit('resetBall', { ball, scores }); // Envia a posição resetada da bola e o placar aos clientes
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

const BALL_UPDATE_INTERVAL = 1000 / 30; // Atualiza a cada 30 frames por segundo

setInterval(() => {
    if (Object.keys(players).filter(id => players[id].isPlayer).length === 2) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Colisão com as paredes superior e inferior
        if (ball.y + 10 > 600 || ball.y - 10 < 0) {
            ball.speedY = -ball.speedY;
        }

        // Colisão com as raquetes dos jogadores
        const playerLeft = Object.values(players).find(p => p.side === 'left' && p.isPlayer);
        const playerRight = Object.values(players).find(p => p.side === 'right' && p.isPlayer);

        if (playerLeft && ball.x - 10 < 20 && ball.y > playerLeft.paddleY && ball.y < playerLeft.paddleY + 100) {
            ball.speedX = -ball.speedX;
        }

        if (playerRight && ball.x + 10 > 780 && ball.y > playerRight.paddleY && ball.y < playerRight.paddleY + 100) {
            ball.speedX = -ball.speedX;
        }

        // Verificar se a bola colidiu com as áreas atrás das raquetes
        if (ball.x - 10 < 0) {
            scores.right++;
            resetBall();
            io.emit('resetBall', { ball, scores });
        }

        if (ball.x + 10 > 800) {
            scores.left++;
            resetBall();
            io.emit('resetBall', { ball, scores });
        }

        io.emit('ballData', ball);
    }
}, BALL_UPDATE_INTERVAL);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
