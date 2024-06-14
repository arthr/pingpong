const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('movePaddle', (data) => {
        socket.broadcast.emit('movePaddle', data);
    });

    socket.on('ballData', (data) => {
        socket.broadcast.emit('ballData', data);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
