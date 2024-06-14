const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { resetBall, updateBallPosition, handleCollisions } = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.use('/css', express.static(__dirname + '/../public/css'));
app.use('/js', express.static(__dirname + '/../public/js'));

let players = {};
let ball = { x: 400, y: 300, speedX: 0, speedY: 0 };
let scores = { left: 0, right: 0 };
let playerColors = ['#ff0000', '#0000ff'];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    if (Object.keys(players).length < 2) {
        let color = playerColors[Object.keys(players).length];
        let side = Object.keys(players).length === 0 ? 'left' : 'right';
        players[socket.id] = {
            paddleY: 300,
            color: color,
            isPlayer: true,
            side: side
        };

        if (Object.keys(players).length === 2) {
            resetBall(ball);
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
            resetBall(ball);
            io.emit('resetBall', { ball, scores });
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

const BALL_UPDATE_INTERVAL = 1000 / 30;

setInterval(() => {
    if (Object.keys(players).filter(id => players[id].isPlayer).length === 2) {
        updateBallPosition(ball);
        handleCollisions(ball, players, scores, io);
        io.emit('ballData', ball);
    }
}, BALL_UPDATE_INTERVAL);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
