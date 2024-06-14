function setupUI(ctx, currentPlayers, minPlayers, countdown) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(200, 150, 400, 300);
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    
    if (countdown) {
        ctx.fillText(countdown, 400, 300);
    } else {
        ctx.fillText('Aguardando mais jogadores', 400, 270);
        ctx.fillText(`Jogadores conectados: ${currentPlayers}/${minPlayers}`, 400, 330);
    }
}

function updateScore(ctx, scores) {
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(scores.left, 200, 50);
    ctx.fillText(scores.right, 600, 50);
}
