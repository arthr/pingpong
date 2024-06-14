module.exports = {
    resetBall,
    updateBallPosition,
    handleCollisions,
};

function resetBall(ball) {
    ball.x = 400;
    ball.y = 300;
    ball.speedX = 5;
    ball.speedY = 5;
}

function updateBallPosition(ball) {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
}

function handleCollisions(ball, players, scores, io) {
    if (ball.y + 10 > 600 || ball.y - 10 < 0) {
        ball.speedY = -ball.speedY;
    }

    const playerLeft = Object.values(players).find(p => p.side === 'left' && p.isPlayer);
    const playerRight = Object.values(players).find(p => p.side === 'right' && p.isPlayer);

    if (playerLeft && ball.x - 10 < 20 && ball.y > playerLeft.paddleY && ball.y < playerLeft.paddleY + 100) {
        ball.speedX = -ball.speedX;
    }

    if (playerRight && ball.x + 10 > 780 && ball.y > playerRight.paddleY && ball.y < playerRight.paddleY + 100) {
        ball.speedX = -ball.speedX;
    }

    if (ball.x - 10 < 0) {
        scores.right++;
        resetBall(ball);
        io.emit('resetBall', { ball, scores });
    }

    if (ball.x + 10 > 800) {
        scores.left++;
        resetBall(ball);
        io.emit('resetBall', { ball, scores });
    }
}
