const socket = io(); // Inicializa o socket.io
const canvas = document.getElementById('gameCanvas'); // Obtém o elemento canvas do HTML
const ctx = canvas.getContext('2d'); // Obtém o contexto de renderização 2D do canvas

// Definindo as dimensões e posições iniciais dos elementos do jogo
let paddleWidth = 10, paddleHeight = 100;
let playerY = canvas.height / 2 - paddleHeight / 2;
let opponentY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 5, ballSpeedY = 5;
let playerPaddle = { x: 0, y: playerY }; // Posição inicial da raquete do jogador
let opponentPaddle = { x: canvas.width - paddleWidth, y: opponentY }; // Posição inicial da raquete do oponente

// Função para ajustar o tamanho do canvas para caber na tela
function resizeCanvas() {
    canvas.width = window.innerWidth; // Define a largura do canvas como a largura da janela
    canvas.height = window.innerHeight; // Define a altura do canvas como a altura da janela
    paddleHeight = canvas.height / 6; // Ajusta a altura da raquete proporcionalmente à altura do canvas
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2; // Centraliza a raquete do jogador
    opponentPaddle.y = canvas.height / 2 - paddleHeight / 2; // Centraliza a raquete do oponente
}
resizeCanvas(); // Chama a função para ajustar o tamanho do canvas
window.addEventListener('resize', resizeCanvas); // Adiciona um evento de redimensionamento da janela para ajustar o canvas

// Função para desenhar os elementos do jogo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

    // Desenha as raquetes
    ctx.fillStyle = '#fff'; // Define a cor branca
    ctx.fillRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight); // Desenha a raquete do jogador
    ctx.fillRect(opponentPaddle.x, opponentPaddle.y, paddleWidth, paddleHeight); // Desenha a raquete do oponente

    // Desenha a bola
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2, true); // Desenha um círculo representando a bola
    ctx.fill();
}

// Função para mover a bola
function moveBall() {
    ballX += ballSpeedX; // Atualiza a posição X da bola
    ballY += ballSpeedY; // Atualiza a posição Y da bola

    // Verifica colisões com as paredes superior e inferior
    if (ballY + 10 > canvas.height || ballY - 10 < 0) {
        ballSpeedY = -ballSpeedY; // Inverte a direção da bola no eixo Y
    }

    // Verifica colisões com as paredes laterais (pontuação)
    if (ballX + 10 > canvas.width || ballX - 10 < 0) {
        ballSpeedX = -ballSpeedX; // Inverte a direção da bola no eixo X
    }

    // Envia a posição atual da bola para o servidor
    socket.emit('ballData', { x: ballX, y: ballY });
}

// Função para mover a raquete do jogador
function movePaddle(event) {
    let y = event.clientY || event.touches[0].clientY; // Obtém a posição Y do mouse ou do toque
    let rect = canvas.getBoundingClientRect(); // Obtém as dimensões e posição do canvas
    playerPaddle.y = y - rect.top - paddleHeight / 2; // Calcula a nova posição da raquete do jogador

    // Envia a nova posição da raquete para o servidor
    socket.emit('movePaddle', { y: playerPaddle.y });
}

// Adiciona eventos de movimento do mouse e toque para controlar a raquete do jogador
canvas.addEventListener('mousemove', movePaddle);
canvas.addEventListener('touchmove', movePaddle);

// Recebe a posição da raquete do oponente do servidor
socket.on('movePaddle', (data) => {
    opponentPaddle.y = data.y; // Atualiza a posição da raquete do oponente
});

// Recebe a posição da bola do servidor
socket.on('ballData', (data) => {
    ballX = data.x; // Atualiza a posição X da bola
    ballY = data.y; // Atualiza a posição Y da bola
});

// Função principal do jogo que é executada a cada frame
function gameLoop() {
    draw(); // Desenha os elementos do jogo
    moveBall(); // Move a bola
    requestAnimationFrame(gameLoop); // Chama a função gameLoop novamente no próximo frame
}

gameLoop(); // Inicia o loop do jogo
