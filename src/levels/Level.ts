import { TileType } from '../engine/Types.js';
import { Enemy, EnemyKind } from '../entities/Enemy.js';
import { Collectible, CollectibleKind } from '../entities/Collectible.js';
import { Firebar } from '../entities/Firebar.js';
import { TILE_SIZE } from '../engine/Physics.js';

export interface LevelData {
  world: string;
  name: string;
  theme: 'overworld' | 'underground' | 'athletic' | 'night' | 'castle';
  time: number;
  width: number;
  height: number;
  tiles: number[][]; // [row][col] where row is y (0..14), col is x (0..width-1)
  enemies: { kind: EnemyKind; x: number; y: number }[];
  collectibles: { kind: CollectibleKind; x: number; y: number }[];
  firebars?: { cx: number; cy: number; length?: number; speed?: number; startAngle?: number }[];
  playerSpawn: { x: number; y: number };
  goalType: 'flag' | 'pipe' | 'axe';
  goalX: number;
}

export class Level {
  public data: LevelData;
  public widthTiles: number;
  public heightTiles: number;
  public tileMap: TileType[][];

  constructor(data: LevelData) {
    this.data = data;
    this.widthTiles = data.width;
    this.heightTiles = data.height;

    // Deep clone tiles array so blocks can be broken or modified in place
    this.tileMap = [];
    for (let y = 0; y < this.heightTiles; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < this.widthTiles; x++) {
        row.push(data.tiles[y]?.[x] ?? TileType.EMPTY);
      }
      this.tileMap.push(row);
    }
  }

  public getPixelWidth(): number {
    return this.widthTiles * TILE_SIZE;
  }

  public getTile(tx: number, ty: number): TileType {
    if (tx < 0 || tx >= this.widthTiles || ty < 0 || ty >= this.heightTiles) {
      return TileType.EMPTY;
    }
    return this.tileMap[ty][tx];
  }

  public setTile(tx: number, ty: number, tile: TileType) {
    if (tx >= 0 && tx < this.widthTiles && ty >= 0 && ty < this.heightTiles) {
      this.tileMap[ty][tx] = tile;
    }
  }

  public createInitialEnemies(): Enemy[] {
    return this.data.enemies.map((e) => new Enemy(e.kind, e.x, e.y));
  }

  public createInitialCollectibles(): Collectible[] {
    return this.data.collectibles.map((c) => new Collectible(c.kind, c.x, c.y));
  }

  public createInitialFirebars(): Firebar[] {
    return (this.data.firebars || []).map(
      (f) => new Firebar(f.cx, f.cy, f.length ?? 5, f.speed ?? 2.4, f.startAngle ?? 0)
    );
  }
}

