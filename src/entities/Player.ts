import { Rect } from '../engine/Types.js';
import { GRAVITY, MAX_FALL_SPEED, moveAndSlide, TILE_SIZE } from '../engine/Physics.js';
import { Input } from '../engine/Input.js';
import { sounds } from '../engine/Audio.js';
import { TileType } from '../engine/Types.js';

export class Player {
  public x: number = 40;
  public y: number = 160;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 14;
  public height: number = 16;
  public isSuper: boolean = false;
  public facingRight: boolean = true;
  public isGrounded: boolean = false;
  public isDead: boolean = false;
  public isVictory: boolean = false;

  // Jump physics improvements
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private isJumping: boolean = false;

  // Visual state
  public animState: 'idle' | 'walk' | 'jump' | 'skid' | 'die' = 'idle';
  public walkFrame: number = 0;
  private walkTimer: number = 0;
  public invincibleTimer: number = 0;

  // Flagpole sliding state
  public isSlidingFlag: boolean = false;
  public flagSlideY: number = 0;

  constructor(x: number = 40, y: number = 160) {
    this.x = x;
    this.y = y;
    this.updateDimensions();
  }

  public updateDimensions() {
    this.width = 14;
    this.height = this.isSuper ? 30 : 16;
  }

  public getBox(): Rect {
    return {
      x: this.x + 1,
      y: this.y,
      w: this.width,
      h: this.height,
    };
  }

  public setSuper(superState: boolean) {
    if (!this.isSuper && superState) {
      this.isSuper = true;
      this.y -= 14; // adjust y upwards when growing
      this.updateDimensions();
      sounds.playPowerup();
    } else if (this.isSuper && !superState) {
      this.isSuper = false;
      this.y += 14;
      this.updateDimensions();
      this.invincibleTimer = 2.5; // invulnerability frames
      sounds.playPowerdown();
    }
  }

  public hitByEnemy(): boolean {
    if (this.invincibleTimer > 0 || this.isDead) return false;

    if (this.isSuper) {
      this.setSuper(false);
      return false; // Did not die, shrank instead
    } else {
      this.die();
      return true; // Died
    }
  }

  public die() {
    if (this.isDead) return;
    this.isDead = true;
    this.animState = 'die';
    this.vy = -350;
    this.vx = 0;
    sounds.playDie();
  }

  public bounce() {
    this.vy = -260;
    this.isJumping = true;
    sounds.playStomp();
  }

  public update(
    dt: number,
    input: Input,
    getTile: (tx: number, ty: number) => TileType,
    onHitCeilingBlock?: (tx: number, ty: number, isSuper: boolean) => void
  ) {
    if (this.isDead) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      return;
    }

    if (this.isSlidingFlag) {
      // Slide down flagpole
      this.y += 100 * dt;
      if (this.y >= this.flagSlideY) {
        this.y = this.flagSlideY;
        this.isSlidingFlag = false;
        this.isVictory = true;
        this.vx = 80; // Walk towards castle
      }
      return;
    }

    if (this.isVictory) {
      // Auto-walk to castle entrance
      this.vx = 75;
      this.facingRight = true;
      this.vy += GRAVITY * dt;
      const res = moveAndSlide(this.getBox(), this.vx, this.vy, dt, getTile);
      this.x = res.x - 1;
      this.y = res.y;
      this.vy = res.vy;
      this.animState = 'walk';
      this.walkTimer += dt * 8;
      this.walkFrame = Math.floor(this.walkTimer);
      return;
    }

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
    }

    // 1. Horizontal Movement
    const accel = 650;
    const friction = 500;
    const isRunning = input.isDown('run');
    const maxSpeed = isRunning ? 220 : 140;

    const movingLeft = input.isDown('left');
    const movingRight = input.isDown('right');

    if (movingLeft && !movingRight) {
      this.facingRight = false;
      if (this.vx > 0) {
        this.vx -= (friction + accel) * dt; // Skid turn
      } else {
        this.vx -= accel * dt;
      }
      if (this.vx < -maxSpeed) this.vx = -maxSpeed;
    } else if (movingRight && !movingLeft) {
      this.facingRight = true;
      if (this.vx < 0) {
        this.vx += (friction + accel) * dt; // Skid turn
      } else {
        this.vx += accel * dt;
      }
      if (this.vx > maxSpeed) this.vx = maxSpeed;
    } else {
      // Decelerate / friction to stop
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - friction * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + friction * dt);
      }
    }

    // 2. Vertical Movement & Jump Mechanics
    // Coyote time: leniency window after leaving ground
    if (this.isGrounded) {
      this.coyoteTimer = 0.12;
      this.isJumping = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump buffer: register early jump press before landing
    if (input.isJustPressed('jump')) {
      this.jumpBufferTimer = 0.12;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Trigger jump
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      const jumpImpulse = this.isSuper ? -390 : -370;
      this.vy = jumpImpulse;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.isJumping = true;
      sounds.playJump(this.isSuper);
    }

    // Variable jump height: release button cuts vertical momentum
    if (!input.isDown('jump') && this.vy < -120 && this.isJumping) {
      this.vy *= 0.5;
    }

    // Apply Gravity
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) {
      this.vy = MAX_FALL_SPEED;
    }

    // 3. Move & Slide Collision Resolution
    const box = this.getBox();
    const result = moveAndSlide(box, this.vx, this.vy, dt, getTile);

    this.x = result.x - 1;
    this.y = result.y;
    this.vx = result.vx;
    this.vy = result.vy;
    this.isGrounded = result.onGround;

    // Batas kiri level agar tidak keluar layar ke kiri
    if (this.x < 0) {
      this.x = 0;
      if (this.vx < 0) this.vx = 0;
    }

    // Hit ceiling block interaction
    if (result.hitCeiling && result.ceilingTile && onHitCeilingBlock) {
      onHitCeilingBlock(result.ceilingTile.tx, result.ceilingTile.ty, this.isSuper);
    }

    // 4. Update Animation States
    if (!this.isGrounded) {
      this.animState = 'jump';
    } else if (
      (movingLeft && this.vx > 20) ||
      (movingRight && this.vx < -20)
    ) {
      this.animState = 'skid';
    } else if (Math.abs(this.vx) > 10) {
      this.animState = 'walk';
      this.walkTimer += dt * (Math.abs(this.vx) * 0.08);
      this.walkFrame = Math.floor(this.walkTimer);
    } else {
      this.animState = 'idle';
    }

    // Pit fall death check
    if (this.y > 260) {
      this.die();
    }
  }
}

