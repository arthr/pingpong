function drawPaddle(ctx, paddle) {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function movePaddle(event, paddle, canvas, isDragging = false) {
    let y = event.clientY || event.touches[0].clientY;
    let rect = canvas.getBoundingClientRect();
    let newY = y - rect.top - paddle.height / 2;

    if (newY < 0) newY = 0;
    else if (newY + paddle.height > canvas.height) newY = canvas.height - paddle.height;

    paddle.y = newY;

    if (isDragging) {
        event.preventDefault();
    }

    socket.emit('movePaddle', { y: paddle.y });
}
