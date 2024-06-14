const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {}; // Armazena o estado dos jogadores

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Adiciona um novo jogador ao estado com uma posição inicial
    players[socket.id] = {
        paddleY: 0
    };

    // Envia o estado inicial para o novo jogador
    socket.emit('currentPlayers', players);

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
        // Envia a posição da bola para todos os clientes
        socket.broadcast.emit('ballData', data);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
