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

  public async show(highlightName?: string) {
    this.container.style.display = 'flex';
    this.container.innerHTML = `
      <div class="modal-box">
        <h2 class="pixel-text gold-text">🏆 TOP 10 HIGH SCORES</h2>
        <p class="subtitle">Persisted in SQLite database</p>
        <div id="leaderboard-list" class="loading-spinner">Loading scores...</div>
        <button id="close-modal-btn" class="retro-btn primary-btn">CLOSE</button>
      </div>
    `;

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
      this.hide();
    });

    try {
      // Append cache buster to guarantee fresh results from SQLite backend
      const res = await fetch(`/api/leaderboard?t=${Date.now()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        this.renderList(json.data, highlightName);
      } else {
        const listEl = document.getElementById('leaderboard-list');
        if (listEl) listEl.innerHTML = '<p class="error-msg">Failed to load leaderboard data</p>';
      }
    } catch {
      const listEl = document.getElementById('leaderboard-list');
      if (listEl) listEl.innerHTML = '<p class="error-msg">Could not connect to SQLite backend</p>';
    }
  }

  private renderList(entries: LeaderboardEntry[], highlightName?: string) {
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

    const targetName = highlightName ? highlightName.trim().toUpperCase() : null;
    let highlightedOnce = false;

    entries.forEach((e, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const isMatch = targetName && !highlightedOnce && e.player_name.toUpperCase() === targetName;
      if (isMatch) highlightedOnce = true;

      const rowClass = isMatch ? 'class="highlight-row"' : '';
      const star = isMatch ? ' ⭐' : '';

      html += `
        <tr ${rowClass}>
          <td>${medal}</td>
          <td class="player-name">${this.escapeHtml(e.player_name)}${star}</td>
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

  public async submitScore(
    playerName: string,
    score: number,
    coins: number,
    levelCompleted: number
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName.trim().toUpperCase() || 'HERO',
          score: Number(score) || 0,
          coins: Number(coins) || 0,
          level_completed: Number(levelCompleted) || 5,
        }),
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.error('Failed to submit score to SQLite:', err);
      return false;
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
