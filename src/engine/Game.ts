import { GameState, TileType } from './Types.js';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Input } from './Input.js';
import { sounds } from './Audio.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Collectible } from '../entities/Collectible.js';
import { Firebar } from '../entities/Firebar.js';
import { ParticleManager } from '../entities/Particle.js';
import { Level } from '../levels/Level.js';
import { getLevel1Data } from '../levels/Level1.js';
import { getLevel2Data } from '../levels/Level2.js';
import { getLevel3Data } from '../levels/Level3.js';
import { getLevel4Data } from '../levels/Level4.js';
import { getLevel5Data } from '../levels/Level5.js';
import { HUD } from '../ui/HUD.js';
import { Menu } from '../ui/Menu.js';
import { rectsOverlap, TILE_SIZE } from './Physics.js';

export class Game {
  public canvas: HTMLCanvasElement;
  public renderer: Renderer;
  public camera: Camera;
  public input: Input;
  public hud: HUD;
  public menu: Menu;
  public particleManager: ParticleManager;

  public state: GameState = 'TITLE';
  public currentLevelIndex: number = 1;
  public level: Level | null = null;
  public player: Player;
  public enemies: Enemy[] = [];
  public collectibles: Collectible[] = [];
  public firebars: Firebar[] = [];

  // Game Stats
  public score: number = 0;
  public coins: number = 0;
  public lives: number = 3;
  public timeLeft: number = 400;

  // Level Clear / Victory timers
  private levelClearTimer: number = 0;
  private bowserDefeated: boolean = false;
  private bowserBridgeCollapseTimer: number = 0;

  // Loop timing
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.camera = new Camera(320, 240);
    this.input = new Input();
    this.hud = new HUD();
    this.particleManager = new ParticleManager();
    this.player = new Player(40, 160);

    // Initialize UI Menu
    this.menu = new Menu({
      onStartGame: (levelIndex) => this.startNewGame(levelIndex),
      onResumeGame: () => this.resumeGame(),
      onRestartLevel: () => this.restartLevel(),
      onQuitToTitle: () => this.goToTitle(),
      onToggleSound: () => sounds.toggleMute(),
      onSaveGameSlot: (slot) => this.saveToSQLite(slot),
      onLoadGameSlot: (slot) => this.loadFromSQLite(slot),
    });

    this.initMuteKey();
  }

  private initMuteKey() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') {
        sounds.toggleMute();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }
    });
  }

  public init() {
    this.menu.showTitleScreen();
    this.state = 'TITLE';
    this.lastTime = performance.now();
    this.isRunning = true;
    requestAnimationFrame((t) => this.loop(t));
  }

  public startNewGame(levelIndex: number = 1) {
    this.currentLevelIndex = levelIndex;
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.loadLevel(levelIndex);
  }

  public loadLevel(levelIndex: number) {
    this.currentLevelIndex = levelIndex;
    const data =
      levelIndex === 1
        ? getLevel1Data()
        : levelIndex === 2
        ? getLevel2Data()
        : levelIndex === 3
        ? getLevel3Data()
        : levelIndex === 4
        ? getLevel4Data()
        : getLevel5Data();

    this.level = new Level(data);
    this.camera.setLevelBounds(this.level.getPixelWidth());
    this.player = new Player(data.playerSpawn.x, data.playerSpawn.y);
    this.enemies = this.level.createInitialEnemies();
    this.collectibles = this.level.createInitialCollectibles();
    this.firebars = this.level.createInitialFirebars();
    this.particleManager.clear();
    this.timeLeft = data.time;
    this.levelClearTimer = 0;
    this.bowserDefeated = false;
    this.bowserBridgeCollapseTimer = 0;

    this.state = 'PLAYING';
    this.menu.hide();
    sounds.startBGM(levelIndex);

    // Auto-save progress to SQLite
    this.autoSaveProgress();
  }

  public restartLevel() {
    this.loadLevel(this.currentLevelIndex);
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sounds.stopBGM();
      this.menu.showPauseScreen();
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.menu.hide();
      sounds.startBGM(this.currentLevelIndex);
    }
  }

  public goToTitle() {
    this.state = 'TITLE';
    sounds.stopBGM();
    this.menu.showTitleScreen();
  }

  public async saveToSQLite(slot: string): Promise<boolean> {
    try {
      const res = await fetch('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_name: slot,
          player_name: 'MARIO',
          current_level: this.currentLevelIndex,
          score: this.score,
          coins: this.coins,
          lives: this.lives,
          is_super: this.player.isSuper,
        }),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  public async loadFromSQLite(slot: string = 'slot_1'): Promise<boolean> {
    try {
      const res = await fetch(`/api/saves/${slot}`);
      const json = await res.json();
      if (json.success && json.data) {
        const s = json.data;
        this.score = Number(s.score) || 0;
        this.coins = Number(s.coins) || 0;
        this.lives = Number(s.lives) || 3;
        this.loadLevel(Number(s.current_level) || 1);
        if (s.is_super) {
          this.player.setSuper(true);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async autoSaveProgress() {
    try {
      await fetch('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_name: 'auto_save',
          player_name: 'MARIO',
          current_level: this.currentLevelIndex,
          score: this.score,
          coins: this.coins,
          lives: this.lives,
          is_super: this.player.isSuper,
        }),
      });
    } catch {
      // ignore offline/sandbox issues
    }
  }

  // Handle block hits from underneath (Ceiling collision)
  private handleCeilingBlockHit(tx: number, ty: number, isSuper: boolean) {
    if (!this.level) return;
    const tile = this.level.getTile(tx, ty);

    if (tile === TileType.QUESTION_COIN) {
      this.level.setTile(tx, ty, TileType.BLOCK_EMPTY);
      this.collectibles.push(
        new Collectible('popping_coin', tx * TILE_SIZE + 3, (ty - 1) * TILE_SIZE)
      );
      this.score += 200;
      this.coins += 1;
      this.particleManager.addScorePopup('+200', tx * TILE_SIZE, ty * TILE_SIZE - 10);
    } else if (tile === TileType.QUESTION_MUSHROOM) {
      this.level.setTile(tx, ty, TileType.BLOCK_EMPTY);
      this.collectibles.push(
        new Collectible('mushroom', tx * TILE_SIZE, (ty - 1) * TILE_SIZE)
      );
      this.particleManager.addScorePopup('MUSHROOM', tx * TILE_SIZE, ty * TILE_SIZE - 10);
    } else if (tile === TileType.BRICK || tile === TileType.UG_BRICK) {
      if (isSuper) {
        // Super Mario shatters brick!
        this.level.setTile(tx, ty, TileType.EMPTY);
        sounds.playBreak();
        this.camera.shake(0.15, 3);
        const color = tile === TileType.UG_BRICK ? '#008088' : '#b84418';
        this.particleManager.spawnBrickShatter(tx * TILE_SIZE, ty * TILE_SIZE, color);
        this.score += 50;
      } else {
        // Small Mario bumps brick
        sounds.playBump();
      }
    }
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    // Delta time clamped to avoid physics explosion on lag spikes
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();
    this.input.update();

    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number) {
    if (!this.level) return;

    this.renderer.update(dt);
    this.particleManager.update(dt);

    // Countdown game timer
    if (!this.player.isVictory && !this.player.isDead) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.player.die();
      }
    }

    // Update Player
    const getTile = (tx: number, ty: number) => this.level!.getTile(tx, ty);
    this.player.update(dt, this.input, getTile, (tx, ty, isSuper) =>
      this.handleCeilingBlockHit(tx, ty, isSuper)
    );

    // Camera follow player
    this.camera.follow(this.player.x, dt);

    // Check player death handling
    if (this.player.isDead) {
      if (this.player.y > 320) {
        this.lives -= 1;
        if (this.lives > 0) {
          this.loadLevel(this.currentLevelIndex);
        } else {
          this.state = 'GAME_OVER';
          this.menu.showGameOverScreen(this.score, this.coins, this.currentLevelIndex);
        }
      }
      return;
    }

    // Check Goal Reached
    this.checkLevelGoal(dt);

    // Update Collectibles
    for (const c of this.collectibles) {
      c.update(dt, getTile);

      // Collectible overlap with player
      if (!c.isDead && c.kind !== 'popping_coin' && rectsOverlap(this.player.getBox(), c.getBox())) {
        if (c.kind === 'coin') {
          c.isDead = true;
          this.coins += 1;
          this.score += 200;
          sounds.playCoin();
          this.particleManager.addScorePopup('+200', c.x, c.y - 10);
        } else if (c.kind === 'mushroom') {
          c.isDead = true;
          this.score += 1000;
          this.player.setSuper(true);
          this.particleManager.addScorePopup('+1000', c.x, c.y - 10);
        } else if (c.kind === 'fireball') {
          // Bowser fireball hurts player
          c.isDead = true;
          this.player.hitByEnemy();
        }
      }
    }
    this.collectibles = this.collectibles.filter((c) => !c.isDead);

    // Update Enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player.x, getTile, (fx, fy, fvx) => {
        this.collectibles.push(new Collectible('fireball', fx, fy, fvx));
      });

      if (enemy.isDead || enemy.isSquashed) continue;

      const pBox = this.player.getBox();
      const eBox = enemy.getBox();

      if (rectsOverlap(pBox, eBox)) {
        // Player stomping enemy from above
        const isStomping =
          this.player.vy > 0 &&
          pBox.y + pBox.h - this.player.vy * dt <= eBox.y + 12;

        if (isStomping && enemy.kind !== 'bowser') {
          const res = enemy.stomp();
          this.player.bounce();
          if (res.score > 0) {
            this.score += res.score;
            this.particleManager.addScorePopup(`+${res.score}`, enemy.x, enemy.y - 10);
          }
        } else if (enemy.isShell && !enemy.isMovingShell) {
          // Kick stationary shell
          const dir = this.player.x < enemy.x ? 1 : -1;
          enemy.kickShell(dir);
        } else {
          // Enemy touches player
          this.player.hitByEnemy();
        }
      }

      // If enemy is a moving Koopa shell, it can eliminate other enemies
      if (enemy.isMovingShell) {
        for (const other of this.enemies) {
          if (other !== enemy && !other.isDead && rectsOverlap(enemy.getBox(), other.getBox())) {
            const pts = other.killInstant();
            this.score += pts;
            this.particleManager.addScorePopup(`+${pts}`, other.x, other.y - 10);
          }
        }
      }
    }
    this.enemies = this.enemies.filter((e) => !e.isDead);

    // Update Firebars
    for (const fb of this.firebars) {
      fb.update(dt);
      if (fb.checkPlayerCollision(this.player.getBox())) {
        this.player.hitByEnemy();
      }
    }

    // Hazard checks (Lava)
    const pCenterTx = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const pBottomTy = Math.floor((this.player.y + this.player.height) / TILE_SIZE);
    if (this.level.getTile(pCenterTx, pBottomTy) === TileType.LAVA) {
      this.player.die();
    }
  }

  private checkLevelGoal(dt: number) {
    if (!this.level || this.player.isDead) return;

    // Level 1: Flagpole
    if (this.level.data.goalType === 'flag') {
      const flagTx = Math.floor(this.level.data.goalX / TILE_SIZE);
      const playerTx = Math.floor((this.player.x + this.player.width) / TILE_SIZE);

      if (playerTx >= flagTx && !this.player.isSlidingFlag && !this.player.isVictory) {
        this.player.isSlidingFlag = true;
        this.player.flagSlideY = 12 * TILE_SIZE - this.player.height;
        this.player.vx = 0;
        this.score += Math.floor(this.timeLeft) * 10;
        sounds.playStageClear();
      }

      if (this.player.isVictory) {
        this.levelClearTimer += dt;
        if (this.levelClearTimer > 3.0) {
          if (this.currentLevelIndex < 5) {
            this.loadLevel(this.currentLevelIndex + 1);
          } else {
            this.state = 'VICTORY';
            sounds.playStageClear();
            this.menu.showVictoryScreen(this.score, this.coins, this.timeLeft);
          }
        }
      }
    }

    // Pipe Goal Exit
    if (this.level.data.goalType === 'pipe') {
      const pipeX = this.level.data.goalX;
      if (this.player.x >= pipeX - 4 && !this.player.isVictory) {
        this.player.isVictory = true;
        this.score += Math.floor(this.timeLeft) * 10;
        sounds.playStageClear();
      }

      if (this.player.isVictory) {
        this.levelClearTimer += dt;
        if (this.levelClearTimer > 2.5) {
          if (this.currentLevelIndex < 5) {
            this.loadLevel(this.currentLevelIndex + 1);
          } else {
            this.state = 'VICTORY';
            sounds.playStageClear();
            this.menu.showVictoryScreen(this.score, this.coins, this.timeLeft);
          }
        }
      }
    }

    // Level 3: Castle Axe Switch (Cut Bridge & Defeat Bowser)
    if (this.level.data.goalType === 'axe') {
      const axeTx = Math.floor(this.level.data.goalX / TILE_SIZE);
      const playerTx = Math.floor((this.player.x + this.player.width) / TILE_SIZE);

      if (playerTx >= axeTx && !this.bowserDefeated) {
        this.bowserDefeated = true;
        this.level.setTile(axeTx, 10, TileType.EMPTY); // Remove Axe
        sounds.playBossDefeat();
        this.camera.shake(1.2, 5);

        // Break bridge tiles over time
        for (let x = 88; x <= 110; x++) {
          this.level.setTile(x, 11, TileType.EMPTY);
        }

        // Defeat Bowser
        for (const enemy of this.enemies) {
          if (enemy.kind === 'bowser') {
            enemy.isDefeated = true; // Bowser falls into lava with defeat animation
            this.score += 5000;
            this.particleManager.addScorePopup('+5000', enemy.x, enemy.y - 10);
          }
        }

        this.player.isVictory = true;
        this.score += Math.floor(this.timeLeft) * 20;
      }

      if (this.player.isVictory) {
        this.levelClearTimer += dt;
        if (this.levelClearTimer > 3.5) {
          // Final Victory!
          this.state = 'VICTORY';
          sounds.playStageClear();
          this.menu.showVictoryScreen(this.score, this.coins, this.timeLeft);
        }
      }
    }
  }

  private render() {
    const camX = this.camera.x;
    const shake = this.camera.getShakeOffset();
    const ctx = this.renderer.ctx;

    // 1. Clear full canvas & draw parallax background in SCREEN SPACE (untransformed)
    const theme = this.level?.data.theme || 'overworld';
    if (theme === 'overworld') {
      this.renderer.clear('#5c94fc');
      this.renderer.drawOverworldBackground(camX);
    } else if (theme === 'underground') {
      this.renderer.clear('#000000');
    } else if (theme === 'athletic') {
      this.renderer.clear('#fc9838');
      this.renderer.drawAthleticBackground(camX);
    } else if (theme === 'night') {
      this.renderer.clear('#081028');
      this.renderer.drawNightBackground(camX);
    } else {
      this.renderer.clear('#110808');
      this.renderer.drawCastleBackground(camX);
    }

    // 2. Apply World Camera Translation for Game Entities
    ctx.save();
    ctx.translate(Math.round(-camX + shake.x), Math.round(shake.y));

    if (this.level) {
      // Visible tile range for rendering optimization
      const startTx = Math.max(0, Math.floor(camX / TILE_SIZE));
      const endTx = Math.min(
        this.level.widthTiles,
        Math.ceil((camX + this.camera.width) / TILE_SIZE) + 1
      );

      // Render Level Tiles
      for (let ty = 0; ty < this.level.heightTiles; ty++) {
        for (let tx = startTx; tx < endTx; tx++) {
          const tile = this.level.getTile(tx, ty);
          if (tile !== TileType.EMPTY) {
            this.renderer.drawTile(tile, tx * TILE_SIZE, ty * TILE_SIZE);
          }
        }
      }

      // Draw Flag on Flagpole if in Level 1
      if (this.level.data.goalType === 'flag') {
        const flagX = this.level.data.goalX;
        const flagY = this.player.isSlidingFlag
          ? this.player.y
          : this.player.isVictory
          ? 12 * TILE_SIZE
          : 4 * TILE_SIZE;
        this.renderer.drawFlag(flagX, 4 * TILE_SIZE, flagY);
      }

      // Render Firebars
      for (const fb of this.firebars) {
        const fireballs = fb.getFireballs();
        for (const p of fireballs) {
          this.renderer.drawFireball(p.x - 4, p.y - 4);
        }
      }

      // Render Collectibles
      for (const c of this.collectibles) {
        if (c.kind === 'coin' || c.kind === 'popping_coin') {
          this.renderer.drawCoin(c.x, c.y);
        } else if (c.kind === 'mushroom') {
          this.renderer.drawMushroom(c.x, c.y);
        } else if (c.kind === 'fireball') {
          this.renderer.drawFireball(c.x, c.y);
        }
      }

      // Render Enemies
      for (const e of this.enemies) {
        if (e.kind === 'goomba') {
          this.renderer.drawGoomba(
            e.x,
            e.y,
            e.isSquashed ? 'squashed' : 'walk',
            e.walkFrame
          );
        } else if (e.kind === 'koopa') {
          this.renderer.drawKoopa(
            e.x,
            e.y,
            e.isShell,
            e.facingRight,
            e.walkFrame
          );
        } else if (e.kind === 'bowser') {
          this.renderer.drawBowser(
            e.x,
            e.y,
            e.facingRight,
            e.isDefeated
          );
        }
      }

      // Render Mario
      this.renderer.drawMario(
        this.player.x,
        this.player.y,
        this.player.isSuper,
        this.player.facingRight,
        this.player.animState,
        this.player.walkFrame,
        this.player.invincibleTimer
      );

      // Render Particles & Popups
      this.renderer.drawParticles(this.particleManager.debris);
      this.renderer.drawScorePopups(this.particleManager.popups);
    }

    ctx.restore();

    // Render Fixed Top HUD
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      const worldName = this.level?.data.world || '1-1';
      this.hud.draw(
        ctx,
        this.score,
        this.coins,
        worldName,
        this.timeLeft,
        this.lives,
        sounds.getMuted()
      );
    }
  }
}

