const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const MIN_PLAYERS = 2;
const PADDLE_OFFSET = 20; // Offset das raquetes das paredes

let paddleWidth = 10, paddleHeight = 100;
let ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
let playerPaddle = { x: PADDLE_OFFSET, y: GAME_HEIGHT / 2 - paddleHeight / 2 };
let opponentPaddles = {}; // Armazena as raquetes dos oponentes
let playerColor = '#fff';
let opponentColors = {};
let playerSide = 'left';
let isDragging = false; // Variável para rastrear se a barra está sendo arrastada
let isWaitingForPlayers = true; // Variável para rastrear se estamos aguardando mais jogadores
let currentPlayers = 0; // Número atual de jogadores
let countdown = 3; // Contagem regressiva para o início do jogo
let scores = { left: 0, right: 0 }; // Placar

function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    paddleHeight = canvas.height / 6;
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    if (playerSide === 'right') {
        playerPaddle.x = canvas.width - paddleWidth - PADDLE_OFFSET;
    } else {
        playerPaddle.x = PADDLE_OFFSET;
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isWaitingForPlayers) {
        // Desenhar mensagem de aguardando mais jogadores
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Fundo branco semitransparente
        ctx.fillRect(GAME_WIDTH / 4, GAME_HEIGHT / 3, GAME_WIDTH / 2, GAME_HEIGHT / 3);
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Aguardando mais jogadores', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
        ctx.fillText(`Jogadores conectados: ${currentPlayers}/${MIN_PLAYERS}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    } else if (countdown > 0) {
        // Desenhar contagem regressiva
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Fundo branco semitransparente
        ctx.fillRect(GAME_WIDTH / 4, GAME_HEIGHT / 3, GAME_WIDTH / 2, GAME_HEIGHT / 3);
        ctx.fillStyle = '#000';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(countdown, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
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

        // Desenhar o placar
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(scores.left, GAME_WIDTH / 4, 50);
        ctx.fillText(scores.right, 3 * GAME_WIDTH / 4, 50);
    }
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

// Função para mover a barra ao "empurrar" o dedo
function touchMove(event) {
    let touchY = event.touches[0].clientY;
    let rect = canvas.getBoundingClientRect();

    if (isDragging) {
        let deltaY = touchY - rect.top - paddleHeight / 2;
        playerPaddle.y = deltaY;

        // Limitar o movimento da raquete dentro dos limites da área jogável
        if (playerPaddle.y < 0) {
            playerPaddle.y = 0;
        } else if (playerPaddle.y + paddleHeight > GAME_HEIGHT) {
            playerPaddle.y = GAME_HEIGHT - paddleHeight;
        }

        socket.emit('movePaddle', { y: playerPaddle.y });
    }

    event.preventDefault(); // Prevenir o comportamento padrão
}

function startDrag(event) {
    isDragging = true;
    touchMove(event);
}

function endDrag() {
    isDragging = false;
}

canvas.addEventListener('mousedown', movePaddle);
canvas.addEventListener('mousemove', movePaddle);

canvas.addEventListener('touchstart', startDrag);
canvas.addEventListener('touchmove', touchMove);
canvas.addEventListener('touchend', endDrag);
canvas.addEventListener('touchcancel', endDrag);

socket.on('currentState', (state) => {
    opponentPaddles = {};
    opponentColors = {};
    let playerCount = 0;
    for (let id in state.players) {
        if (state.players[id].isPlayer) {
            playerCount++;
            if (id !== socket.id) {
                let side = state.players[id].side === 'left' ? PADDLE_OFFSET : canvas.width - paddleWidth - PADDLE_OFFSET;
                opponentPaddles[id] = { x: side, y: state.players[id].paddleY };
                opponentColors[id] = state.players[id].color;
            } else {
                playerColor = state.players[id].color;
                playerSide = state.players[id].side;
                if (playerSide === 'right') {
                    playerPaddle.x = canvas.width - paddleWidth - PADDLE_OFFSET;
                }
            }
        }
    }
    ball = state.ball;
    scores = state.scores; // Atualiza o placar

    // Atualizar número atual de jogadores
    currentPlayers = playerCount;

    // Verificar se estamos aguardando mais jogadores
    if (currentPlayers >= MIN_PLAYERS) {
        if (isWaitingForPlayers) {
            isWaitingForPlayers = false;
            startCountdown();
        }
    } else {
        isWaitingForPlayers = true;
    }
});

socket.on('newPlayer', (data) => {
    if (data.playerData.isPlayer) {
        let side = data.playerData.side === 'left' ? PADDLE_OFFSET : canvas.width - paddleWidth - PADDLE_OFFSET;
        opponentPaddles[data.playerId] = { x: side, y: data.playerData.paddleY };
        opponentColors[data.playerId] = data.playerData.color;

        // Atualizar número atual de jogadores
        currentPlayers++;

        // Verificar se estamos aguardando mais jogadores
        if (currentPlayers >= MIN_PLAYERS) {
            if (isWaitingForPlayers) {
                isWaitingForPlayers = false;
                startCountdown();
            }
        } else {
            isWaitingForPlayers = true;
        }
    }
});

socket.on('playerDisconnected', (playerId) => {
    if (opponentPaddles[playerId]) {
        delete opponentPaddles[playerId];
        delete opponentColors[playerId];

        // Atualizar número atual de jogadores
        currentPlayers--;

        // Verificar se estamos aguardando mais jogadores
        if (currentPlayers >= MIN_PLAYERS) {
            if (isWaitingForPlayers) {
                isWaitingForPlayers = false;
                startCountdown();
            }
        } else {
            isWaitingForPlayers = true;
        }
    }
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
    ball = data.ball;
    scores = data.scores; // Atualiza o placar
});

function startCountdown() {
    countdown = 3;
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
