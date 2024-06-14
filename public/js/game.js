const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const MIN_PLAYERS = 2;
const PADDLE_OFFSET = 20; // Offset das raquetes das paredes

let ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, speedX: 5, speedY: 5 };
let playerPaddle = { x: PADDLE_OFFSET, y: GAME_HEIGHT / 2 - 50, width: 10, height: 100, color: '#ff0000' };
let opponentPaddles = {};
let playerSide = 'left';
let isDragging = false;
let isWaitingForPlayers = true;
let currentPlayers = 0;
let countdown = 3;
let scores = { left: 0, right: 0 };

function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(ctx, playerPaddle);

    for (let id in opponentPaddles) {
        drawPaddle(ctx, opponentPaddles[id]);
    }

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2, true);
    ctx.fillStyle = '#fff';
    ctx.fill();

    if (isWaitingForPlayers) {
        setupUI(ctx, currentPlayers, MIN_PLAYERS);
    } else if (countdown > 0) {
        setupUI(ctx, countdown);
    }

    updateScore(ctx, scores);
}

canvas.addEventListener('mousemove', (event) => movePaddle(event, playerPaddle, canvas));
canvas.addEventListener('touchmove', (event) => movePaddle(event, playerPaddle, canvas, isDragging));
canvas.addEventListener('touchstart', () => isDragging = true);
canvas.addEventListener('touchend', () => isDragging = false);

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
