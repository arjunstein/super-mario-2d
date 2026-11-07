import { Rect } from '../engine/Types.js';

export class Firebar {
  public cx: number;
  public cy: number;
  public length: number;
  public angle: number = 0;
  public speed: number = 2.4; // radians per second

  constructor(cx: number, cy: number, length: number = 5, speed: number = 2.4, startAngle: number = 0) {
    this.cx = cx;
    this.cy = cy;
    this.length = length;
    this.speed = speed;
    this.angle = startAngle;
  }

  public update(dt: number) {
    this.angle += this.speed * dt;
  }

  // Returns array of fireball center positions along the rotating rod
  public getFireballs(): { x: number; y: number }[] {
    const list: { x: number; y: number }[] = [];
    const spacing = 7;
    for (let i = 1; i <= this.length; i++) {
      const dist = i * spacing;
      list.push({
        x: this.cx + Math.cos(this.angle) * dist,
        y: this.cy + Math.sin(this.angle) * dist,
      });
    }
    return list;
  }

  public checkPlayerCollision(playerBox: Rect): boolean {
    const fireballs = this.getFireballs();
    for (const fb of fireballs) {
      // Circle to Rect collision approximation
      const closestX = Math.max(playerBox.x, Math.min(fb.x, playerBox.x + playerBox.w));
      const closestY = Math.max(playerBox.y, Math.min(fb.y, playerBox.y + playerBox.h));
      const dx = fb.x - closestX;
      const dy = fb.y - closestY;
      if (dx * dx + dy * dy < 16) {
        // radius 4
        return true;
      }
    }
    return false;
  }
}

