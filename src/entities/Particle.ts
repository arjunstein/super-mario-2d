import { ScorePopup } from '../engine/Types.js';

export class BrickDebris {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public size: number = 4;
  public color: string = '#b84418';
  public life: number = 0.8;

  constructor(x: number, y: number, vx: number, vy: number, color: string = '#b84418') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
  }

  public update(dt: number): boolean {
    this.vy += 800 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life > 0;
  }
}

export class ParticleManager {
  public debris: BrickDebris[] = [];
  public popups: ScorePopup[] = [];

  public spawnBrickShatter(x: number, y: number, color: string = '#b84418') {
    const pieces = [
      { vx: -70, vy: -240 },
      { vx: 70, vy: -240 },
      { vx: -40, vy: -170 },
      { vx: 40, vy: -170 },
    ];
    for (const p of pieces) {
      this.debris.push(new BrickDebris(x + 6, y + 6, p.vx, p.vy, color));
    }
  }

  public addScorePopup(text: string, x: number, y: number) {
    this.popups.push({
      text,
      x,
      y,
      vy: -40,
      life: 0.6,
      maxLife: 0.6,
    });
  }

  public update(dt: number) {
    // Update debris
    this.debris = this.debris.filter((d) => d.update(dt));

    // Update score popups
    for (const p of this.popups) {
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.popups = this.popups.filter((p) => p.life > 0);
  }

  public clear() {
    this.debris = [];
    this.popups = [];
  }
}

