const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let paddleWidth = 10, paddleHeight = 100;
let ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
let playerPaddle = { x: 0, y: GAME_HEIGHT / 2 - paddleHeight / 2 };
let opponentPaddles = {}; // Armazena as raquetes dos oponentes
let playerColor = '#fff';
let opponentColors = {};
let playerSide = 'left';

function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    paddleHeight = canvas.height / 6;
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    if (playerSide === 'right') {
        playerPaddle.x = canvas.width - paddleWidth;
    } else {
        playerPaddle.x = 0;
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar a raquete do jogador
    ctx.fillStyle = playerColor;
    ctx.fillRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight);

    // Desenhar as raquetes dos oponentes
    for (let id in opponentPaddles) {
        let paddle = opponentPaddles[id];
        ctx.fillStyle = opponentColors[id];
        ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
    }

    // Desenhar a bola
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2, true);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

function movePaddle(event) {
    let y = event.clientY || event.touches[0].clientY;
    let rect = canvas.getBoundingClientRect();
    let newY = y - rect.top - paddleHeight / 2;

    // Limitar o movimento da raquete dentro dos limites da área jogável
    if (newY < 0) {
        newY = 0;
    } else if (newY + paddleHeight > GAME_HEIGHT) {
        newY = GAME_HEIGHT - paddleHeight;
    }

    playerPaddle.y = newY;

    socket.emit('movePaddle', { y: playerPaddle.y });
}


canvas.addEventListener('mousemove', movePaddle);
canvas.addEventListener('touchmove', movePaddle);

socket.on('currentState', (state) => {
    opponentPaddles = {};
    opponentColors = {};
    for (let id in state.players) {
        if (id !== socket.id) {
            let side = state.players[id].side === 'left' ? 0 : canvas.width - paddleWidth;
            opponentPaddles[id] = { x: side, y: state.players[id].paddleY };
            opponentColors[id] = state.players[id].color;
        } else {
            playerColor = state.players[id].color;
            playerSide = state.players[id].side;
            if (playerSide === 'right') {
                playerPaddle.x = canvas.width - paddleWidth;
            }
        }
    }
    ball = state.ball;
});

socket.on('newPlayer', (data) => {
    if (data.playerId !== socket.id) {
        let side = data.playerData.side === 'left' ? 0 : canvas.width - paddleWidth;
        opponentPaddles[data.playerId] = { x: side, y: data.playerData.paddleY };
        opponentColors[data.playerId] = data.playerData.color;
    }
});

socket.on('playerDisconnected', (playerId) => {
    delete opponentPaddles[playerId];
    delete opponentColors[playerId];
});

socket.on('movePaddle', (data) => {
    if (opponentPaddles[data.playerId]) {
        opponentPaddles[data.playerId].y = data.y;
    }
});

socket.on('ballData', (data) => {
    ball = data;
});

socket.on('resetBall', (data) => {
    ball = data;
});

function moveBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Colisão com as paredes superior e inferior
    if (ball.y + 10 > GAME_HEIGHT || ball.y - 10 < 0) {
        ball.speedY = -ball.speedY;
    }

    // Colisão com as raquetes dos jogadores
    if (ball.x - 10 < playerPaddle.x + paddleWidth &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + paddleHeight) {
        ball.speedX = -ball.speedX;
    }

    for (let id in opponentPaddles) {
        let paddle = opponentPaddles[id];
        if (ball.x + 10 > paddle.x &&
            ball.y > paddle.y &&
            ball.y < paddle.y + paddleHeight) {
            ball.speedX = -ball.speedX;
        }
    }

    // Colisão com as paredes esquerda e direita
    if (ball.x + 10 > GAME_WIDTH || ball.x - 10 < 0) {
        ball.speedX = -ball.speedX;
    }

    socket.emit('ballData', ball);
}

function gameLoop() {
    draw();
    moveBall(); // Chama a função moveBall em cada frame
    requestAnimationFrame(gameLoop);
}

gameLoop();


function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
