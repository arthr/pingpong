const socket = io();

socket.on('currentState', (state) => {
    // Atualizar o estado atual
    ball = state.ball;
    scores = state.scores;
    opponentPaddles = {};

    for (let id in state.players) {
        if (id !== socket.id) {
            opponentPaddles[id] = state.players[id];
        }
    }

    currentPlayers = Object.keys(state.players).length;
    isWaitingForPlayers = currentPlayers < MIN_PLAYERS;
});

socket.on('newPlayer', (data) => {
    // Adicionar novo jogador
    if (data.playerId !== socket.id) {
        opponentPaddles[data.playerId] = data.playerData;
    }
    currentPlayers = Object.keys(opponentPaddles).length + 1;
    isWaitingForPlayers = currentPlayers < MIN_PLAYERS;
});

socket.on('playerDisconnected', (playerId) => {
    // Remover jogador desconectado
    delete opponentPaddles[playerId];
    currentPlayers = Object.keys(opponentPaddles).length + 1;
    isWaitingForPlayers = currentPlayers < MIN_PLAYERS;
});

socket.on('movePaddle', (data) => {
    // Mover raquete do oponente
    if (opponentPaddles[data.playerId]) {
        opponentPaddles[data.playerId].paddleY = data.y;
    }
});

socket.on('ballData', (data) => {
    // Atualizar posição da bola
    ball = data;
});

socket.on('resetBall', (data) => {
    // Reiniciar posição da bola e atualizar placar
    ball = data.ball;
    scores = data.scores;
});
