export class HUD {
  public draw(
    ctx: CanvasRenderingContext2D,
    score: number,
    coins: number,
    world: string,
    timeLeft: number,
    lives: number,
    isMuted: boolean
  ) {
    ctx.save();
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ffffff';

    // Top Header Labels
    ctx.fillText('MARIO', 16, 12);
    ctx.fillText('WORLD', 145, 12);
    ctx.fillText('TIME', 255, 12);

    // Data Row
    const scoreStr = String(score).padStart(6, '0');
    const coinStr = `🪙x${String(coins).padStart(2, '0')}`;
    const timeStr = String(Math.max(0, Math.floor(timeLeft))).padStart(3, '0');
    const livesStr = `❤️x${lives}`;

    ctx.fillText(scoreStr, 16, 24);
    ctx.fillText(coinStr, 80, 24);
    ctx.fillText(world, 155, 24);
    ctx.fillText(timeStr, 260, 24);
    ctx.fillText(livesStr, 205, 24);

    // Audio Mute indicator
    if (isMuted) {
      ctx.fillStyle = '#ff4444';
      ctx.fillText('🔇 MUTED (M)', 16, 36);
    }

    ctx.restore();
  }
}

