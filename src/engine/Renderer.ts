import { Rect, TileType, ScorePopup } from './Types.js';
import { TILE_SIZE } from './Physics.js';

export class Renderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private animTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  public update(dt: number) {
    this.animTimer += dt;
  }

  public clear(color: string = '#5c94fc') {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Draw background elements (Clouds, Hills, Bushes)
  public drawOverworldBackground(camX: number) {
    const ctx = this.ctx;
    // Distant hills (parallax factor 0.3)
    const hillMod = (((camX * 0.3) % 220) + 220) % 220;
    ctx.fillStyle = '#00a800';
    for (let i = -1; i < 3; i++) {
      const hx = i * 220 - hillMod;
      this.drawHill(hx, 180, 80, 50);
      this.drawHill(hx + 120, 190, 60, 40);
    }

    // Clouds (parallax factor 0.15)
    const cloudMod = (((camX * 0.15 + this.animTimer * 5) % 260) + 260) % 260;
    ctx.fillStyle = '#ffffff';
    for (let i = -1; i < 3; i++) {
      const cx = i * 260 - cloudMod;
      this.drawCloud(cx, 35);
      this.drawCloud(cx + 140, 65);
    }
  }

  private drawCloud(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 12, y + 10, 10, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 6, 14, 0, Math.PI * 2);
    ctx.arc(x + 38, y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 8, y + 10, 36, 10);
  }

  private drawHill(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h, w / 2, h, 0, Math.PI, 0);
    ctx.fill();
    // Dark green edge
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw Athletic sunset background
  public drawAthleticBackground(camX: number) {
    const ctx = this.ctx;
    // Distant sunset mountains (parallax factor 0.2)
    const mtnMod = (((camX * 0.2) % 240) + 240) % 240;
    ctx.fillStyle = '#a04870';
    for (let i = -1; i < 3; i++) {
      const mx = i * 240 - mtnMod;
      this.drawHill(mx, 170, 90, 60);
      this.drawHill(mx + 130, 185, 70, 45);
    }

    // High sunset pink/white clouds
    const cloudMod = (((camX * 0.12 + this.animTimer * 4) % 280) + 280) % 280;
    ctx.fillStyle = '#ffe8d0';
    for (let i = -1; i < 3; i++) {
      const cx = i * 280 - cloudMod;
      this.drawCloud(cx, 25);
      this.drawCloud(cx + 150, 55);
    }
  }

  // Draw Night starry background
  public drawNightBackground(camX: number) {
    const ctx = this.ctx;
    // Crescent Moon (fixed in sky)
    ctx.fillStyle = '#fff8b0';
    ctx.beginPath();
    ctx.arc(260, 38, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0e1a'; // cutout for crescent
    ctx.beginPath();
    ctx.arc(265, 34, 12, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling stars (parallax factor 0.05)
    const starParallax = (camX * 0.05) % 320;
    const starSeeds = [
      { x: 30, y: 20 }, { x: 75, y: 45 }, { x: 120, y: 15 },
      { x: 160, y: 50 }, { x: 210, y: 25 }, { x: 280, y: 65 },
      { x: 45, y: 80 }, { x: 95, y: 95 }, { x: 185, y: 85 },
      { x: 240, y: 110 }, { x: 310, y: 30 }, { x: 15, y: 60 },
    ];

    for (let i = 0; i < starSeeds.length; i++) {
      const s = starSeeds[i];
      const sx = ((s.x - starParallax + 320) % 320);
      const twinkle = Math.sin(this.animTimer * 3 + i * 1.5) > 0 ? 2 : 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, s.y, twinkle, twinkle);
    }
  }

  // Draw Castle lava background
  public drawCastleBackground(camX: number) {
    const ctx = this.ctx;
    // Lava ambient glow
    const lavaGrad = ctx.createLinearGradient(0, 180, 0, 240);
    lavaGrad.addColorStop(0, '#1a0000');
    lavaGrad.addColorStop(1, '#660000');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, 180, this.canvas.width, 60);

    // Distant pillars
    const pillarMod = (((camX * 0.4) % 140) + 140) % 140;
    ctx.fillStyle = '#1e1e24';
    for (let i = -1; i < 4; i++) {
      const px = i * 140 - pillarMod;
      ctx.fillRect(px, 40, 24, 180);
      ctx.fillStyle = '#141418';
      ctx.fillRect(px + 4, 40, 16, 180);
      ctx.fillStyle = '#1e1e24';
    }
  }

  // Tile rendering
  public drawTile(type: TileType, x: number, y: number) {
    const ctx = this.ctx;
    const s = TILE_SIZE;

    switch (type) {
      case TileType.GROUND: {
        // Brown earth with grass fringe
        ctx.fillStyle = '#d87020';
        ctx.fillRect(x, y, s, s);
        // Grass top
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x, y, s, 3);
        ctx.fillStyle = '#80d010';
        ctx.fillRect(x + 1, y, s - 2, 1);
        // Earth texture speckles
        ctx.fillStyle = '#804000';
        ctx.fillRect(x + 3, y + 6, 2, 2);
        ctx.fillRect(x + 10, y + 10, 2, 2);
        break;
      }

      case TileType.BRICK: {
        // Red/brown brick with mortar
        ctx.fillStyle = '#b84418';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#000000';
        // Mortar lines
        ctx.fillRect(x, y + 7, s, 1);
        ctx.fillRect(x, y + s - 1, s, 1);
        ctx.fillRect(x + 7, y, 1, 7);
        ctx.fillRect(x + 3, y + 8, 1, 7);
        ctx.fillRect(x + 11, y + 8, 1, 7);
        // Highlight
        ctx.fillStyle = '#e87840';
        ctx.fillRect(x, y, s, 1);
        ctx.fillRect(x, y + 8, s, 1);
        break;
      }

      case TileType.QUESTION_COIN:
      case TileType.QUESTION_MUSHROOM: {
        // Golden pulsating Question Block
        const pulse = Math.sin(this.animTimer * 6) > 0 ? '#fcb040' : '#f87800';
        ctx.fillStyle = pulse;
        ctx.fillRect(x, y, s, s);
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
        // Corner bolts
        ctx.fillStyle = '#401800';
        ctx.fillRect(x + 1, y + 1, 1, 1);
        ctx.fillRect(x + s - 2, y + 1, 1, 1);
        ctx.fillRect(x + 1, y + s - 2, 1, 1);
        ctx.fillRect(x + s - 2, y + s - 2, 1, 1);
        // Question mark "?"
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 3, 6, 2);
        ctx.fillRect(x + 9, y + 5, 2, 3);
        ctx.fillRect(x + 6, y + 7, 4, 2);
        ctx.fillRect(x + 6, y + 9, 2, 2);
        ctx.fillRect(x + 6, y + 12, 2, 2);
        break;
      }

      case TileType.BLOCK_EMPTY: {
        // Brown spent block
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(x, y, s, s);
        ctx.strokeStyle = '#3d2314';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
        ctx.fillStyle = '#3d2314';
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillRect(x + s - 4, y + 2, 2, 2);
        ctx.fillRect(x + 2, y + s - 4, 2, 2);
        ctx.fillRect(x + s - 4, y + s - 4, 2, 2);
        break;
      }

      case TileType.PIPE_TL: {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#80d010';
        ctx.fillRect(x + 2, y, 4, s);
        ctx.fillStyle = '#005000';
        ctx.fillRect(x, y, 1, s);
        ctx.fillRect(x, y, s, 2);
        break;
      }

      case TileType.PIPE_TR: {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#005000';
        ctx.fillRect(x + s - 2, y, 2, s);
        ctx.fillRect(x, y, s, 2);
        break;
      }

      case TileType.PIPE_BL: {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x + 2, y, s - 2, s);
        ctx.fillStyle = '#80d010';
        ctx.fillRect(x + 4, y, 4, s);
        ctx.fillStyle = '#005000';
        ctx.fillRect(x + 2, y, 1, s);
        break;
      }

      case TileType.PIPE_BR: {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x, y, s - 2, s);
        ctx.fillStyle = '#005000';
        ctx.fillRect(x + s - 4, y, 2, s);
        break;
      }

      case TileType.UG_GROUND: {
        // Subterranean dark cyan stone
        ctx.fillStyle = '#008088';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#004850';
        ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
        ctx.fillStyle = '#80e8f0';
        ctx.fillRect(x + 1, y + 1, s - 2, 1);
        break;
      }

      case TileType.UG_BRICK: {
        // Underground blue brick
        ctx.fillStyle = '#005888';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#002840';
        ctx.fillRect(x, y + 7, s, 1);
        ctx.fillRect(x, y + s - 1, s, 1);
        ctx.fillRect(x + 7, y, 1, 7);
        ctx.fillRect(x + 3, y + 8, 1, 7);
        ctx.fillRect(x + 11, y + 8, 1, 7);
        ctx.fillStyle = '#60b0e0';
        ctx.fillRect(x, y, s, 1);
        break;
      }

      case TileType.CASTLE_BRICK: {
        // Slate gray fortress stone
        ctx.fillStyle = '#404050';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#101018';
        ctx.fillRect(x, y + 7, s, 1);
        ctx.fillRect(x, y + s - 1, s, 1);
        ctx.fillRect(x + 7, y, 1, 7);
        ctx.fillRect(x + 4, y + 8, 1, 7);
        ctx.fillStyle = '#787888';
        ctx.fillRect(x, y, s, 1);
        break;
      }

      case TileType.LAVA: {
        // Animated bubbling lava
        const wave = Math.sin(this.animTimer * 8 + x * 0.2) * 2;
        ctx.fillStyle = '#e83000';
        ctx.fillRect(x, y + wave, s, s);
        ctx.fillStyle = '#fcb000';
        ctx.fillRect(x, y + wave, s, 3);
        ctx.fillStyle = '#ffffff';
        if (Math.sin(this.animTimer * 12 + x) > 0.6) {
          ctx.fillRect(x + 4, y + wave + 4, 3, 3);
        }
        break;
      }

      case TileType.FLAGPOLE: {
        // Silver flagpole
        ctx.fillStyle = '#d0d0d8';
        ctx.fillRect(x + 6, y, 4, s);
        ctx.fillStyle = '#707080';
        ctx.fillRect(x + 9, y, 1, s);
        break;
      }

      case TileType.FLAGTOP: {
        // Golden sphere finial
        ctx.fillStyle = '#f8b800';
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 6, y + 4, 2, 2);
        break;
      }

      case TileType.AXE: {
        // Castle bridge axe switch
        const spin = Math.sin(this.animTimer * 6) * 2;
        ctx.fillStyle = '#f8b800';
        ctx.fillRect(x + 4, y + 8 + spin, 8, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 6, y + 2 + spin, 4, 6);
        ctx.fillStyle = '#d87000';
        ctx.fillRect(x + 10, y + 1 + spin, 4, 8);
        break;
      }

      case TileType.BRIDGE: {
        // Wooden bridge suspended over lava
        ctx.fillStyle = '#b87030';
        ctx.fillRect(x, y + 4, s, 8);
        ctx.fillStyle = '#704018';
        ctx.fillRect(x + 2, y + 4, 2, 8);
        ctx.fillRect(x + 10, y + 4, 2, 8);
        ctx.fillStyle = '#f0a050';
        ctx.fillRect(x, y + 4, s, 2);
        break;
      }

      case TileType.STAIR_BLOCK: {
        // Pyramid stone steps
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(x, y, s, s);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
        ctx.fillStyle = '#d87020';
        ctx.fillRect(x + 1, y + 1, s - 2, 1);
        break;
      }

      default:
        break;
    }
  }

  // Draw Mario (Small: 16x16, Super: 16x32)
  public drawMario(
    x: number,
    y: number,
    isSuper: boolean,
    facingRight: boolean,
    state: 'idle' | 'walk' | 'jump' | 'skid' | 'die',
    walkFrame: number,
    invincibleTimer: number
  ) {
    const ctx = this.ctx;

    // Invulnerability blinking
    if (invincibleTimer > 0 && Math.floor(invincibleTimer * 20) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (!facingRight && state !== 'die') {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }

    if (state === 'die') {
      // Small Mario death posture
      this.drawMarioDead();
      ctx.restore();
      return;
    }

    if (isSuper) {
      this.drawSuperMario(state, walkFrame);
    } else {
      this.drawSmallMario(state, walkFrame);
    }

    ctx.restore();
  }

  private drawSmallMario(state: 'idle' | 'walk' | 'jump' | 'skid', walkFrame: number) {
    const ctx = this.ctx;
    // Cap & Shirt: #e52521 (Red)
    // Overalls: #0028a8 (Blue)
    // Skin: #fc9838 (Peach)
    // Hair/Mustache: #6b4000 (Brown)

    // Hat
    ctx.fillStyle = '#e52521';
    ctx.fillRect(3, 1, 8, 3);
    ctx.fillRect(2, 3, 12, 2);

    // Hair & Mustache
    ctx.fillStyle = '#6b4000';
    ctx.fillRect(2, 4, 3, 3);
    ctx.fillRect(4, 6, 2, 2);
    ctx.fillRect(9, 6, 4, 2); // mustache

    // Face / Skin
    ctx.fillStyle = '#fc9838';
    ctx.fillRect(5, 4, 4, 2);
    ctx.fillRect(7, 5, 2, 2); // nose
    ctx.fillRect(5, 6, 4, 1);

    // Body / Overalls
    if (state === 'jump') {
      // Jumping pose: arms out, legs spread
      ctx.fillStyle = '#0028a8';
      ctx.fillRect(4, 8, 8, 5);
      // Shirt red arms
      ctx.fillStyle = '#e52521';
      ctx.fillRect(2, 7, 3, 3);
      ctx.fillRect(11, 7, 3, 3);
      // Legs
      ctx.fillStyle = '#6b4000';
      ctx.fillRect(1, 13, 4, 3);
      ctx.fillRect(11, 13, 4, 3);
    } else if (state === 'skid') {
      // Skidding pose
      ctx.fillStyle = '#0028a8';
      ctx.fillRect(4, 8, 8, 5);
      ctx.fillStyle = '#e52521';
      ctx.fillRect(1, 8, 3, 3);
      ctx.fillStyle = '#6b4000';
      ctx.fillRect(3, 13, 5, 3);
      ctx.fillRect(9, 13, 5, 3);
    } else if (state === 'walk') {
      const f = walkFrame % 3;
      ctx.fillStyle = '#0028a8';
      ctx.fillRect(4, 8, 8, 5);
      ctx.fillStyle = '#e52521';
      ctx.fillRect(2, 8, 2, 3);
      // Striding boots
      ctx.fillStyle = '#6b4000';
      if (f === 0) {
        ctx.fillRect(2, 13, 5, 3);
        ctx.fillRect(9, 12, 4, 3);
      } else if (f === 1) {
        ctx.fillRect(3, 13, 4, 3);
        ctx.fillRect(8, 13, 4, 3);
      } else {
        ctx.fillRect(1, 12, 4, 3);
        ctx.fillRect(8, 13, 5, 3);
      }
    } else {
      // Idle
      ctx.fillStyle = '#0028a8';
      ctx.fillRect(4, 8, 8, 5);
      ctx.fillStyle = '#e52521';
      ctx.fillRect(2, 8, 2, 3);
      ctx.fillStyle = '#6b4000';
      ctx.fillRect(3, 13, 4, 3);
      ctx.fillRect(9, 13, 4, 3);
    }
  }

  private drawSuperMario(state: 'idle' | 'walk' | 'jump' | 'skid', walkFrame: number) {
    const ctx = this.ctx;
    // Super Mario height: 32px
    // Hat
    ctx.fillStyle = '#e52521';
    ctx.fillRect(3, 2, 9, 4);
    ctx.fillRect(2, 5, 13, 3);

    // Hair / mustache
    ctx.fillStyle = '#6b4000';
    ctx.fillRect(2, 7, 4, 4);
    ctx.fillRect(5, 10, 2, 2);
    ctx.fillRect(10, 10, 5, 3);

    // Face
    ctx.fillStyle = '#fc9838';
    ctx.fillRect(6, 7, 5, 3);
    ctx.fillRect(8, 9, 3, 2);
    ctx.fillRect(6, 11, 4, 2);

    // Torso / Dungarees
    ctx.fillStyle = '#e52521';
    ctx.fillRect(3, 13, 10, 5);

    ctx.fillStyle = '#0028a8';
    ctx.fillRect(4, 17, 8, 9);
    // Yellow buttons
    ctx.fillStyle = '#fcb040';
    ctx.fillRect(5, 18, 1, 2);
    ctx.fillRect(10, 18, 1, 2);

    // Hands
    ctx.fillStyle = '#fc9838';
    ctx.fillRect(1, 16, 3, 3);
    ctx.fillRect(12, 16, 3, 3);

    // Legs & Shoes
    ctx.fillStyle = '#6b4000';
    if (state === 'jump') {
      ctx.fillRect(1, 26, 5, 5);
      ctx.fillRect(10, 26, 5, 5);
    } else if (state === 'walk') {
      const f = walkFrame % 3;
      if (f === 0) {
        ctx.fillRect(1, 27, 6, 5);
        ctx.fillRect(10, 25, 5, 5);
      } else {
        ctx.fillRect(2, 26, 5, 6);
        ctx.fillRect(9, 26, 5, 6);
      }
    } else {
      ctx.fillRect(2, 27, 5, 5);
      ctx.fillRect(9, 27, 5, 5);
    }
  }

  private drawMarioDead() {
    const ctx = this.ctx;
    ctx.fillStyle = '#e52521';
    ctx.fillRect(3, 1, 10, 4);
    ctx.fillStyle = '#6b4000';
    ctx.fillRect(2, 5, 3, 3);
    ctx.fillStyle = '#fc9838';
    ctx.fillRect(5, 5, 6, 4);
    ctx.fillStyle = '#0028a8';
    ctx.fillRect(4, 9, 8, 4);
    ctx.fillStyle = '#6b4000';
    ctx.fillRect(1, 13, 5, 3);
    ctx.fillRect(10, 13, 5, 3);
  }

  // Draw Enemies
  public drawGoomba(x: number, y: number, state: 'walk' | 'squashed', walkFrame: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (state === 'squashed') {
      // Squashed Goomba
      ctx.fillStyle = '#a84000';
      ctx.fillRect(1, 10, 14, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(3, 12, 3, 2);
      ctx.fillRect(10, 12, 3, 2);
      ctx.restore();
      return;
    }

    // Mushroom Cap
    ctx.fillStyle = '#b84418';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(1, 3, 14, 5);
    ctx.fillRect(0, 6, 16, 3);

    // Stem
    ctx.fillStyle = '#fce4a0';
    ctx.fillRect(4, 9, 8, 4);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 7, 3, 3);
    ctx.fillRect(10, 7, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 8, 2, 2);
    ctx.fillRect(10, 8, 2, 2);

    // Eyebrows
    ctx.fillStyle = '#000000';
    ctx.fillRect(3, 6, 3, 1);
    ctx.fillRect(10, 6, 3, 1);

    // Feet
    ctx.fillStyle = '#000000';
    const f = walkFrame % 2;
    if (f === 0) {
      ctx.fillRect(1, 13, 5, 3);
      ctx.fillRect(9, 13, 4, 2);
    } else {
      ctx.fillRect(3, 13, 4, 2);
      ctx.fillRect(10, 13, 5, 3);
    }

    ctx.restore();
  }

  public drawKoopa(x: number, y: number, isShell: boolean, facingRight: boolean, walkFrame: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (!facingRight && !isShell) {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }

    if (isShell) {
      // Shell only (16x16)
      ctx.fillStyle = '#00a800';
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 5, 8, 6);
      ctx.fillStyle = '#00a800';
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = '#fce4a0';
      ctx.fillRect(2, 13, 12, 3);
      ctx.restore();
      return;
    }

    // Walking Koopa (16x24)
    // Head
    ctx.fillStyle = '#00a800';
    ctx.fillRect(7, 2, 7, 6);
    ctx.fillStyle = '#fce4a0';
    ctx.fillRect(11, 4, 4, 4); // beak
    ctx.fillStyle = '#000000';
    ctx.fillRect(9, 3, 2, 2); // eye

    // Shell body
    ctx.fillStyle = '#00a800';
    ctx.fillRect(3, 8, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 10, 6, 6);

    // Feet
    ctx.fillStyle = '#fce4a0';
    const f = walkFrame % 2;
    if (f === 0) {
      ctx.fillRect(2, 19, 5, 5);
      ctx.fillRect(9, 18, 4, 4);
    } else {
      ctx.fillRect(3, 18, 4, 4);
      ctx.fillRect(9, 19, 5, 5);
    }

    ctx.restore();
  }

  public drawBowser(x: number, y: number, facingRight: boolean, isDefeated: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (facingRight) {
      ctx.scale(-1, 1);
      ctx.translate(-32, 0);
    }

    if (isDefeated) {
      ctx.translate(0, 10);
      ctx.rotate(0.4);
    }

    // Bowser (32x32)
    // Shell (Spiky green)
    ctx.fillStyle = '#008800';
    ctx.fillRect(12, 8, 16, 18);
    // Spikes (White/gray)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 5, 3, 3);
    ctx.fillRect(22, 5, 3, 3);
    ctx.fillRect(27, 12, 3, 3);
    ctx.fillRect(27, 20, 3, 3);

    // Head (Large green snout and horns)
    ctx.fillStyle = '#008800';
    ctx.fillRect(2, 8, 12, 12);
    // Snout
    ctx.fillStyle = '#fcb040';
    ctx.fillRect(0, 14, 8, 8);
    // Horns
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 2, 3, 6);
    // Fiery Red Hair
    ctx.fillStyle = '#e52521';
    ctx.fillRect(8, 4, 8, 6);

    // Red glowing eye
    ctx.fillStyle = '#e52521';
    ctx.fillRect(5, 10, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 10, 1, 1);

    // Claws & Feet
    ctx.fillStyle = '#fcb040';
    ctx.fillRect(4, 26, 8, 6);
    ctx.fillRect(18, 26, 8, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 30, 2, 2);
    ctx.fillRect(8, 30, 2, 2);
    ctx.fillRect(17, 30, 2, 2);
    ctx.fillRect(22, 30, 2, 2);

    ctx.restore();
  }

  // Draw Collectibles & Items
  public drawCoin(x: number, y: number) {
    const ctx = this.ctx;
    const pulse = Math.abs(Math.sin(this.animTimer * 5));
    const width = Math.max(2, Math.round(10 * pulse));
    const offset = Math.round((10 - width) / 2);

    ctx.fillStyle = '#fcb000';
    ctx.fillRect(Math.round(x) + offset, Math.round(y) + 2, width, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(x) + offset + 1, Math.round(y) + 3, Math.max(1, width - 2), 2);
  }

  public drawMushroom(x: number, y: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Red cap
    ctx.fillStyle = '#e52521';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(1, 3, 14, 6);

    // White spots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 2, 4, 3);
    ctx.fillRect(2, 5, 3, 3);
    ctx.fillRect(11, 5, 3, 3);

    // Face/stem
    ctx.fillStyle = '#fce4a0';
    ctx.fillRect(4, 9, 8, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(5, 11, 2, 2);
    ctx.fillRect(9, 11, 2, 2);

    ctx.restore();
  }

  public drawFireball(x: number, y: number) {
    const ctx = this.ctx;
    const pulse = Math.sin(this.animTimer * 15) > 0;
    ctx.fillStyle = pulse ? '#fc7800' : '#fcb000';
    ctx.fillRect(Math.round(x), Math.round(y), 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(x) + 2, Math.round(y) + 2, 4, 4);
  }

  public drawFlag(x: number, poleY: number, flagY: number) {
    const ctx = this.ctx;
    // Flag cloth sliding down pole
    ctx.fillStyle = '#00a800';
    ctx.beginPath();
    ctx.moveTo(x + 6, flagY);
    ctx.lineTo(x - 14, flagY + 8);
    ctx.lineTo(x + 6, flagY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 4, flagY + 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw floating scores and particle debris
  public drawScorePopups(popups: ScorePopup[]) {
    const ctx = this.ctx;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#ffffff';
    for (const p of popups) {
      ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
    }
  }

  public drawParticles(particles: { x: number; y: number; color: string; size: number }[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
  }
}

