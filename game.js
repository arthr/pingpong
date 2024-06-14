const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let paddleWidth = 10, paddleHeight = 100;
let playerY = canvas.height / 2 - paddleHeight / 2;
let opponentY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 5, ballSpeedY = 5;
let playerPaddle = { x: 0, y: playerY };
let opponentPaddle = { x: canvas.width - paddleWidth, y: opponentY };

// Ajustar o canvas para caber na tela
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    paddleHeight = canvas.height / 6;
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    opponentPaddle.y = canvas.height / 2 - paddleHeight / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight);
    ctx.fillRect(opponentPaddle.x, opponentPaddle.y, paddleWidth, paddleHeight);

    // Desenhar bola
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
}

function movePaddle(event) {
    let y = event.clientY || event.touches[0].clientY;
    let rect = canvas.getBoundingClientRect();
    playerPaddle.y = y - rect.top - paddleHeight / 2;
}

canvas.addEventListener('mousemove', movePaddle);
canvas.addEventListener('touchmove', movePaddle);

function gameLoop() {
    draw();
    moveBall();
    requestAnimationFrame(gameLoop);
}

gameLoop();
