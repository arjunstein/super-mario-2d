import { Rect, TileType } from '../engine/Types.js';
import { GRAVITY, moveAndSlide } from '../engine/Physics.js';
import { sounds } from '../engine/Audio.js';

export type CollectibleKind = 'coin' | 'popping_coin' | 'mushroom' | 'fireball';

export class Collectible {
  public kind: CollectibleKind;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 10;
  public height: number = 14;
  public isDead: boolean = false;
  private lifeTimer: number = 0;

  constructor(kind: CollectibleKind, x: number, y: number, vx: number = 0, vy: number = 0) {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    if (kind === 'coin') {
      this.width = 10;
      this.height = 14;
    } else if (kind === 'popping_coin') {
      this.width = 10;
      this.height = 14;
      this.vy = -220;
      this.lifeTimer = 0.45;
      sounds.playCoin();
    } else if (kind === 'mushroom') {
      this.width = 16;
      this.height = 16;
      this.vx = 45;
      sounds.playPowerup();
    } else if (kind === 'fireball') {
      this.width = 8;
      this.height = 8;
      this.vx = vx !== 0 ? vx : -150;
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

  public update(dt: number, getTile: (tx: number, ty: number) => TileType) {
    if (this.isDead) return;

    if (this.kind === 'popping_coin') {
      this.vy += GRAVITY * 0.6 * dt;
      this.y += this.vy * dt;
      this.lifeTimer -= dt;
      if (this.lifeTimer <= 0) {
        this.isDead = true;
      }
      return;
    }

    if (this.kind === 'mushroom') {
      this.vy += GRAVITY * dt;
      const res = moveAndSlide(this.getBox(), this.vx, this.vy, dt, getTile);
      this.x = res.x;
      this.y = res.y;
      this.vy = res.vy;
      if (res.vx === 0) {
        this.vx = -this.vx;
      }
      if (this.y > 270) {
        this.isDead = true;
      }
      return;
    }

    if (this.kind === 'fireball') {
      this.x += this.vx * dt;
      // Slight wave motion
      this.y += Math.sin(this.x * 0.1) * 20 * dt;
      if (this.x < -50 || this.x > 4000) {
        this.isDead = true;
      }
    }
  }
}

