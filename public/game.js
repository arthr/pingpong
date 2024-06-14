const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let paddleWidth = 10, paddleHeight = 100;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 5, ballSpeedY = 5;
let playerPaddle = { x: 0, y: canvas.height / 2 - paddleHeight / 2 };
let opponentPaddles = {}; // Armazena as raquetes dos oponentes

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    paddleHeight = canvas.height / 6;
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar a raquete do jogador
    ctx.fillStyle = '#fff';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight);

    // Desenhar as raquetes dos oponentes
    for (let id in opponentPaddles) {
        let paddle = opponentPaddles[id];
        ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
    }

    // Desenhar a bola
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2, true);
    ctx.fill();
}

function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY + 10 > canvas.height || ballY - 10 < 0) {
        ballSpeedY = -ballSpeedY;
    }

    if (ballX + 10 > canvas.width || ballX - 10 < 0) {
        ballSpeedX = -ballSpeedX;
    }

    socket.emit('ballData', { x: ballX, y: ballY });
}

function movePaddle(event) {
    let y = event.clientY || event.touches[0].clientY;
    let rect = canvas.getBoundingClientRect();
    playerPaddle.y = y - rect.top - paddleHeight / 2;

    socket.emit('movePaddle', { y: playerPaddle.y });
}

canvas.addEventListener('mousemove', movePaddle);
canvas.addEventListener('touchmove', movePaddle);

socket.on('currentPlayers', (players) => {
    opponentPaddles = {};
    for (let id in players) {
        if (id !== socket.id) {
            opponentPaddles[id] = { x: canvas.width - paddleWidth, y: players[id].paddleY };
        }
    }
});

socket.on('newPlayer', (data) => {
    if (data.playerId !== socket.id) {
        opponentPaddles[data.playerId] = { x: canvas.width - paddleWidth, y: data.paddleY };
    }
});

socket.on('playerDisconnected', (playerId) => {
    delete opponentPaddles[playerId];
});

socket.on('movePaddle', (data) => {
    if (opponentPaddles[data.playerId]) {
        opponentPaddles[data.playerId].y = data.y;
    }
});

socket.on('ballData', (data) => {
    ballX = data.x;
    ballY = data.y;
});

function gameLoop() {
    draw();
    moveBall();
    requestAnimationFrame(gameLoop);
}

gameLoop();
