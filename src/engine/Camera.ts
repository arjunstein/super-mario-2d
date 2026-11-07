export class Camera {
  public x: number = 0;
  public y: number = 0;
  public width: number = 320;
  public height: number = 240;
  private maxLevelWidth: number = 3200;
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;

  constructor(viewportWidth: number = 320, viewportHeight: number = 240) {
    this.width = viewportWidth;
    this.height = viewportHeight;
  }

  public setLevelBounds(maxWidth: number) {
    this.maxLevelWidth = maxWidth;
    this.x = 0;
    this.y = 0;
  }

  public follow(targetX: number, dt: number) {
    // Pusat kamera mengikuti posisi player secara dinamis (bisa maju dan mundur)
    const desiredX = targetX - this.width * 0.42;

    this.x += (desiredX - this.x) * Math.min(1, dt * 8);

    // Clamp camera within 0 and max level width - viewport width
    const maxX = Math.max(0, this.maxLevelWidth - this.width);
    if (this.x > maxX) {
      this.x = maxX;
    }
    if (this.x < 0) {
      this.x = 0;
    }

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
      }
    }
  }

  public shake(duration: number = 0.2, intensity: number = 4) {
    this.shakeTimer = duration;
    this.shakeIntensity = intensity;
  }

  public getShakeOffset(): { x: number; y: number } {
    if (this.shakeTimer <= 0 || this.shakeIntensity <= 0) {
      return { x: 0, y: 0 };
    }
    return {
      x: (Math.random() - 0.5) * this.shakeIntensity,
      y: (Math.random() - 0.5) * this.shakeIntensity,
    };
  }
}

