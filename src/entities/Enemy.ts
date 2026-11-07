import { Rect, TileType } from '../engine/Types.js';
import { GRAVITY, MAX_FALL_SPEED, moveAndSlide } from '../engine/Physics.js';
import { sounds } from '../engine/Audio.js';

export type EnemyKind = 'goomba' | 'koopa' | 'bowser';

export class Enemy {
  public kind: EnemyKind;
  public x: number;
  public y: number;
  public vx: number = -35;
  public vy: number = 0;
  public width: number = 16;
  public height: number = 16;
  public isDead: boolean = false;
  public isSquashed: boolean = false;
  public squashedTimer: number = 0;
  public facingRight: boolean = false;

  // Koopa Shell specific
  public isShell: boolean = false;
  public isMovingShell: boolean = false;

  // Bowser specific
  public fireTimer: number = 2.0;
  public hopTimer: number = 1.5;
  public hp: number = 5;
  public isDefeated: boolean = false;
  public defeatTimer: number = 0;

  private walkTimer: number = 0;
  public walkFrame: number = 0;

  constructor(kind: EnemyKind, x: number, y: number) {
    this.kind = kind;
    this.x = x;
    this.y = y;

    if (kind === 'goomba') {
      this.width = 16;
      this.height = 16;
      this.vx = -35;
    } else if (kind === 'koopa') {
      this.width = 16;
      this.height = 24;
      this.vx = -40;
    } else if (kind === 'bowser') {
      this.width = 32;
      this.height = 32;
      this.vx = 0;
    }
  }

  public getBox(): Rect {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height,
    };
  }

  public stomp(): { defeated: boolean; score: number } {
    if (this.kind === 'goomba') {
      this.isSquashed = true;
      this.squashedTimer = 0.5;
      this.vx = 0;
      this.vy = 0;
      return { defeated: true, score: 100 };
    }

    if (this.kind === 'koopa') {
      if (!this.isShell) {
        // Turn into stationary shell
        this.isShell = true;
        this.height = 16;
        this.y += 8;
        this.vx = 0;
        return { defeated: false, score: 100 };
      } else {
        if (this.isMovingShell) {
          // Stomping a moving shell halts it safely
          this.isMovingShell = false;
          this.vx = 0;
          sounds.playBump();
          return { defeated: false, score: 100 };
        } else {
          // Kick stationary shell
          this.isMovingShell = true;
          this.vx = 260; // Kick right by default
          sounds.playBump();
          return { defeated: false, score: 200 };
        }
      }
    }

    // Bowser cannot be stomped
    return { defeated: false, score: 0 };
  }

  public kickShell(direction: number) {
    if (this.kind === 'koopa' && this.isShell) {
      this.isMovingShell = true;
      this.vx = direction > 0 ? 280 : -280;
      sounds.playBump();
    }
  }

  public killInstant(): number {
    this.isDead = true;
    sounds.playStomp();
    return this.kind === 'bowser' ? 5000 : 200;
  }

  public update(
    dt: number,
    playerX: number,
    getTile: (tx: number, ty: number) => TileType,
    spawnFireball?: (x: number, y: number, vx: number) => void
  ) {
    if (this.isDead) return;

    if (this.isSquashed) {
      this.squashedTimer -= dt;
      if (this.squashedTimer <= 0) {
        this.isDead = true;
      }
      return;
    }

    // Bowser AI Behavior
    if (this.kind === 'bowser') {
      if (this.isDefeated) {
        // Tumble into lava
        this.vy += GRAVITY * 0.6 * dt;
        this.y += this.vy * dt;
        this.defeatTimer += dt;
        if (this.y > 270 || this.defeatTimer > 3.0) {
          this.isDead = true;
        }
        return;
      }

      this.facingRight = playerX > this.x;

      // Hop up and down
      this.hopTimer -= dt;
      if (this.hopTimer <= 0) {
        this.vy = -180;
        this.hopTimer = 2.0 + Math.random() * 1.5;
      }

      // Shoot Fireball towards player
      this.fireTimer -= dt;
      if (this.fireTimer <= 0 && spawnFireball) {
        const fireVx = this.facingRight ? 160 : -160;
        spawnFireball(this.x + (this.facingRight ? 30 : -4), this.y + 10, fireVx);
        this.fireTimer = 2.5 + Math.random() * 2.0;
      }

      this.vy += GRAVITY * dt;
      const res = moveAndSlide(this.getBox(), this.vx, this.vy, dt, getTile);
      this.x = res.x;
      this.y = res.y;
      this.vy = res.vy;
      return;
    }

    // Standard Enemies (Goomba & Koopa)
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    const res = moveAndSlide(this.getBox(), this.vx, this.vy, dt, getTile);
    this.x = res.x;
    this.y = res.y;
    this.vy = res.vy;

    // Bounce off walls
    if (res.vx === 0 && this.vx !== 0) {
      this.vx = -this.vx;
    }

    this.facingRight = this.vx > 0;

    // Update walk animation
    this.walkTimer += dt * 6;
    this.walkFrame = Math.floor(this.walkTimer);

    // Fall into bottomless pit
    if (this.y > 270) {
      this.isDead = true;
    }
  }
}

