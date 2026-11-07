import { LeaderboardModal } from './LeaderboardModal.js';

export interface MenuCallbacks {
  onStartGame: (levelIndex: number) => void;
  onResumeGame: () => void;
  onRestartLevel: () => void;
  onQuitToTitle: () => void;
  onToggleSound: () => boolean;
  onSaveGameSlot?: (slot: string) => Promise<boolean>;
  onLoadGameSlot?: (slot: string) => Promise<boolean>;
}

export class Menu {
  private container: HTMLDivElement;
  private callbacks: MenuCallbacks;
  public leaderboardModal: LeaderboardModal;

  constructor(callbacks: MenuCallbacks) {
    this.callbacks = callbacks;
    this.leaderboardModal = new LeaderboardModal();
    this.container = document.createElement('div');
    this.container.id = 'game-ui-overlay';
    document.body.appendChild(this.container);
  }

  public showTitleScreen() {
    this.container.style.display = 'flex';
    this.container.innerHTML = `
      <div class="menu-card title-card">
        <h1 class="game-logo">SUPER MARIO 2D</h1>
        <div class="subtitle-badge">TypeScript • SQLite • Docker</div>

        <div class="menu-buttons">
          <button id="btn-play-1" class="retro-btn primary-btn">▶ START WORLD 1-1 (Overworld)</button>
          <button id="btn-load-game" class="retro-btn">💾 RESUME SAVED GAME (SQLite)</button>
          <div class="level-select-row">
            <button id="btn-play-1-s" class="retro-btn secondary-btn" title="Overworld">W 1-1</button>
            <button id="btn-play-2" class="retro-btn secondary-btn" title="Underground">W 1-2</button>
            <button id="btn-play-3" class="retro-btn secondary-btn" title="Athletic">W 1-3</button>
            <button id="btn-play-4" class="retro-btn secondary-btn" title="Night Ruins">W 1-4</button>
            <button id="btn-play-5" class="retro-btn secondary-btn" title="Bowser Castle">W 1-5</button>
          </div>
          <button id="btn-leaderboard" class="retro-btn">🏆 HIGH SCORES (SQLite)</button>
          <button id="btn-controls" class="retro-btn info-btn">🎮 CONTROLS & HOW TO PLAY</button>
        </div>
        <div id="title-status-msg" class="status-msg"></div>

        <div class="footer-hint">Press [SPACE] or Click to Play • Press [M] to Mute</div>
      </div>
    `;

    document.getElementById('btn-play-1')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onStartGame(1);
    });

    document.getElementById('btn-load-game')?.addEventListener('click', async () => {
      const msgEl = document.getElementById('title-status-msg');
      if (this.callbacks.onLoadGameSlot) {
        if (msgEl) msgEl.innerText = 'Loading from SQLite database...';
        const ok = await this.callbacks.onLoadGameSlot('slot_1');
        if (!ok) {
          // Fallback check auto_save
          const okAuto = await this.callbacks.onLoadGameSlot('auto_save');
          if (!okAuto && msgEl) {
            msgEl.innerText = 'No saved game found in SQLite. Start a new game first!';
          }
        }
      }
    });

    document.getElementById('btn-play-1-s')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onStartGame(1);
    });

    document.getElementById('btn-play-2')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onStartGame(2);
    });

    document.getElementById('btn-play-3')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onStartGame(3);
    });

    document.getElementById('btn-play-4')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onStartGame(4);
    });

    document.getElementById('btn-play-5')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onStartGame(5);
    });

    document.getElementById('btn-leaderboard')?.addEventListener('click', () => {
      this.leaderboardModal.show();
    });

    document.getElementById('btn-controls')?.addEventListener('click', () => {
      this.showControlsScreen();
    });
  }

  public showControlsScreen() {
    this.container.style.display = 'flex';
    this.container.innerHTML = `
      <div class="menu-card controls-card">
        <h2 class="pixel-text gold-text">🎮 GAME CONTROLS</h2>
        <div class="controls-grid">
          <div class="control-item"><span class="key-badge">← / →</span> or <span class="key-badge">A / D</span> <span>Walk Left / Right</span></div>
          <div class="control-item"><span class="key-badge">SPACE</span> or <span class="key-badge">W / Z</span> <span>Jump (Hold higher)</span></div>
          <div class="control-item"><span class="key-badge">SHIFT</span> or <span class="key-badge">X</span> <span>Sprint / Run Fast</span></div>
          <div class="control-item"><span class="key-badge">P</span> or <span class="key-badge">ESC</span> <span>Pause Game</span></div>
          <div class="control-item"><span class="key-badge">M</span> <span>Toggle Sound (BGM/SFX)</span></div>
        </div>
        <div class="gameplay-tips">
          <p>🍄 <b>Mushroom</b> makes Mario grow into Super Mario!</p>
          <p>🐢 Stomp Koopa to get a shell, then kick it into enemies!</p>
          <p>🔥 In World 1-3 Castle, jump past Bowser to hit the <b>Axe Switch</b>!</p>
        </div>
        <button id="btn-back-title" class="retro-btn">BACK TO TITLE</button>
      </div>
    `;

    document.getElementById('btn-back-title')?.addEventListener('click', () => {
      this.showTitleScreen();
    });
  }

  public showPauseScreen() {
    this.container.style.display = 'flex';
    this.container.innerHTML = `
      <div class="menu-card pause-card">
        <h2 class="pixel-text gold-text">GAME PAUSED</h2>
        <div class="menu-buttons">
          <button id="btn-resume" class="retro-btn primary-btn">RESUME GAME</button>
          <button id="btn-save-slot" class="retro-btn">💾 SAVE TO SQLITE (Slot 1)</button>
          <button id="btn-pause-mute" class="retro-btn">🔊 TOGGLE SOUND</button>
          <button id="btn-quit" class="retro-btn danger-btn">QUIT TO TITLE</button>
        </div>
        <div id="save-status-msg" class="status-msg"></div>
      </div>
    `;

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onResumeGame();
    });

    document.getElementById('btn-save-slot')?.addEventListener('click', async () => {
      const msgEl = document.getElementById('save-status-msg');
      if (this.callbacks.onSaveGameSlot) {
        if (msgEl) msgEl.innerText = 'Saving to SQLite database...';
        const ok = await this.callbacks.onSaveGameSlot('slot_1');
        if (msgEl) msgEl.innerText = ok ? '✅ Game successfully saved to SQLite!' : '❌ Save failed';
      }
    });

    document.getElementById('btn-pause-mute')?.addEventListener('click', () => {
      this.callbacks.onToggleSound();
    });

    document.getElementById('btn-quit')?.addEventListener('click', () => {
      this.callbacks.onQuitToTitle();
    });
  }

  public showGameOverScreen(score: number, coins: number, levelCompleted: number) {
    this.container.style.display = 'flex';
    this.container.innerHTML = `
      <div class="menu-card gameover-card">
        <h1 class="pixel-text red-text">GAME OVER</h1>
        <div class="score-summary">
          <p>FINAL SCORE: <span class="highlight">${score}</span></p>
          <p>COINS COLLECTED: <span class="highlight">🪙 ${coins}</span></p>
        </div>

        <div class="save-score-form">
          <label>ENTER YOUR NAME FOR LEADERBOARD:</label>
          <div class="input-row">
            <input id="player-name-input" type="text" maxlength="12" value="MARIO" autofocus />
            <button id="btn-submit-score" class="retro-btn primary-btn">SUBMIT</button>
          </div>
          <div id="submit-feedback" class="status-msg"></div>
        </div>

        <div class="menu-buttons">
          <button id="btn-retry" class="retro-btn">TRY AGAIN</button>
          <button id="btn-go-title" class="retro-btn">TITLE SCREEN</button>
        </div>
      </div>
    `;

    const submitBtn = document.getElementById('btn-submit-score');
    submitBtn?.addEventListener('click', async () => {
      const input = document.getElementById('player-name-input') as HTMLInputElement;
      const name = (input?.value || 'MARIO').trim().toUpperCase();
      const feedback = document.getElementById('submit-feedback');
      if (feedback) feedback.innerText = 'Saving to SQLite...';
      const ok = await this.leaderboardModal.submitScore(name, score, coins, levelCompleted);
      if (ok) {
        if (feedback) feedback.innerText = '✅ Score recorded!';
        submitBtn.setAttribute('disabled', 'true');
        setTimeout(() => {
          this.leaderboardModal.show(name);
        }, 500);
      } else {
        if (feedback) feedback.innerText = '❌ Failed to record score.';
      }
    });

    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onRestartLevel();
    });

    document.getElementById('btn-go-title')?.addEventListener('click', () => {
      this.callbacks.onQuitToTitle();
    });
  }

  public showVictoryScreen(score: number, coins: number, totalTime: number) {
    this.container.style.display = 'flex';
    this.container.innerHTML = `
      <div class="menu-card victory-card">
        <h1 class="pixel-text gold-text">CONGRATULATIONS!</h1>
        <p class="princess-quote">"THANK YOU MARIO! YOUR QUEST IS COMPLETE!"</p>
        <div class="score-summary">
          <p>FINAL SCORE: <span class="highlight">${score}</span></p>
          <p>TOTAL COINS: <span class="highlight">🪙 ${coins}</span></p>
          <p>TIME REMAINING: <span class="highlight">⏱️ ${Math.floor(totalTime)}s</span></p>
        </div>

        <div class="save-score-form">
          <label>RECORD YOUR HERO'S NAME (SQLite):</label>
          <div class="input-row">
            <input id="victory-player-name" type="text" maxlength="12" value="HERO" autofocus />
            <button id="btn-victory-submit" class="retro-btn primary-btn">SUBMIT SCORE</button>
          </div>
          <div id="victory-feedback" class="status-msg"></div>
        </div>

        <div class="menu-buttons">
          <button id="btn-victory-leaderboard" class="retro-btn">🏆 VIEW HIGH SCORES</button>
          <button id="btn-play-again" class="retro-btn primary-btn">PLAY AGAIN</button>
        </div>
      </div>
    `;

    const submitBtn = document.getElementById('btn-victory-submit');
    submitBtn?.addEventListener('click', async () => {
      const input = document.getElementById('victory-player-name') as HTMLInputElement;
      const name = (input?.value || 'HERO').trim().toUpperCase();
      const feedback = document.getElementById('victory-feedback');
      if (feedback) feedback.innerText = 'Saving to SQLite database...';
      const ok = await this.leaderboardModal.submitScore(name, score, coins, 5);
      if (ok) {
        if (feedback) feedback.innerText = '✅ Score recorded! Opening High Scores...';
        submitBtn.setAttribute('disabled', 'true');
        setTimeout(() => {
          this.leaderboardModal.show(name);
        }, 500);
      } else {
        if (feedback) feedback.innerText = '❌ Failed to save. Check server connection.';
      }
    });

    document.getElementById('btn-victory-leaderboard')?.addEventListener('click', () => {
      const input = document.getElementById('victory-player-name') as HTMLInputElement;
      const name = input?.value?.trim().toUpperCase();
      this.leaderboardModal.show(name);
    });

    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onStartGame(1);
    });
  }

  public hide() {
    this.container.style.display = 'none';
  }
}

