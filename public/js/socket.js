const socket = io();

socket.on('currentState', (state) => {
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
    if (data.playerId !== socket.id) {
        opponentPaddles[data.playerId] = data.playerData;
    }
    currentPlayers = Object.keys(opponentPaddles).length + 1;
    isWaitingForPlayers = currentPlayers < MIN_PLAYERS;
});

socket.on('playerDisconnected', (playerId) => {
    delete opponentPaddles[playerId];
    currentPlayers = Object.keys(opponentPaddles).length + 1;
    isWaitingForPlayers = currentPlayers < MIN_PLAYERS;
});

socket.on('movePaddle', (data) => {
    if (opponentPaddles[data.playerId]) {
        opponentPaddles[data.playerId].paddleY = data.y;
    }
});

socket.on('ballData', (data) => {
    ball = data;
});

socket.on('resetBall', (data) => {
    ball = data.ball;
    scores = data.scores;
});
