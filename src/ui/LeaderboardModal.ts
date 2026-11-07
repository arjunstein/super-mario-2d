export interface LeaderboardEntry {
  id?: number;
  player_name: string;
  score: number;
  coins: number;
  level_completed: number;
  created_at?: string;
}

export class LeaderboardModal {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'leaderboard-modal';
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
  }

  public async show() {
    this.container.style.display = 'flex';
    this.container.innerHTML = `
      <div class="modal-box">
        <h2 class="pixel-text gold-text">🏆 TOP 10 HIGH SCORES</h2>
        <p class="subtitle">Persisted in SQLite database</p>
        <div id="leaderboard-list" class="loading-spinner">Loading scores...</div>
        <button id="close-modal-btn" class="retro-btn">CLOSE</button>
      </div>
    `;

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
      this.hide();
    });

    try {
      const res = await fetch('/api/leaderboard');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        this.renderList(json.data);
      } else {
        const listEl = document.getElementById('leaderboard-list');
        if (listEl) listEl.innerHTML = '<p class="error-msg">Failed to load leaderboard data</p>';
      }
    } catch {
      const listEl = document.getElementById('leaderboard-list');
      if (listEl) listEl.innerHTML = '<p class="error-msg">Could not connect to SQLite backend</p>';
    }
  }

  private renderList(entries: LeaderboardEntry[]) {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;

    if (entries.length === 0) {
      listEl.innerHTML = '<p>No scores recorded yet!</p>';
      return;
    }

    let html = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>NAME</th>
            <th>SCORE</th>
            <th>COINS</th>
            <th>LEVEL</th>
          </tr>
        </thead>
        <tbody>
    `;

    entries.forEach((e, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      html += `
        <tr>
          <td>${medal}</td>
          <td class="player-name">${this.escapeHtml(e.player_name)}</td>
          <td class="player-score">${String(e.score).padStart(6, '0')}</td>
          <td>🪙 ${e.coins}</td>
          <td>W1-${e.level_completed}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    listEl.innerHTML = html;
  }

  public hide() {
    this.container.style.display = 'none';
  }

  public async submitScore(playerName: string, score: number, coins: number, levelCompleted: number) {
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName,
          score,
          coins,
          level_completed: levelCompleted,
        }),
      });
    } catch (err) {
      console.error('Failed to submit score to SQLite:', err);
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

