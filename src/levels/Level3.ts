import { LevelData } from './Level.js';
import { TileType } from '../engine/Types.js';

export function getLevel3Data(): LevelData {
  const width = 125;
  const height = 15;

  const tiles: number[][] = Array.from({ length: height }, () => Array(width).fill(TileType.EMPTY));

  // Ground only at start and end
  // Start platform (x: 0..12)
  for (let x = 0; x <= 12; x++) {
    tiles[13][x] = TileType.GROUND;
    tiles[14][x] = TileType.GROUND;
  }

  // End platform (x: 95..124)
  for (let x = 95; x < width; x++) {
    tiles[13][x] = TileType.GROUND;
    tiles[14][x] = TileType.GROUND;
  }

  // Helper to place mushroom/treetop platform
  const placePlatform = (startX: number, endX: number, y: number, stemX?: number) => {
    for (let x = startX; x <= endX; x++) {
      tiles[y][x] = TileType.BRICK;
    }
    // Optional tree stem
    if (stemX !== undefined) {
      for (let sy = y + 1; sy <= 14; sy++) {
        tiles[sy][stemX] = TileType.STAIR_BLOCK;
      }
    }
  };

  // High treetop platforms
  placePlatform(16, 23, 10, 19);
  tiles[10][18] = TileType.QUESTION_COIN;
  tiles[10][21] = TileType.QUESTION_MUSHROOM;

  placePlatform(27, 33, 8, 30);
  tiles[8][29] = TileType.QUESTION_COIN;
  tiles[8][31] = TileType.QUESTION_COIN;

  placePlatform(37, 44, 6, 40);
  tiles[6][39] = TileType.QUESTION_COIN;
  tiles[6][42] = TileType.QUESTION_COIN;

  // Middle stepping stones
  placePlatform(48, 52, 9, 50);
  placePlatform(56, 61, 7, 58);
  tiles[7][59] = TileType.QUESTION_MUSHROOM;

  placePlatform(65, 71, 10, 68);
  tiles[10][67] = TileType.QUESTION_COIN;
  tiles[10][69] = TileType.QUESTION_COIN;

  placePlatform(75, 83, 8, 79);
  tiles[8][77] = TileType.QUESTION_COIN;
  tiles[8][81] = TileType.QUESTION_COIN;

  placePlatform(87, 92, 10, 89);

  // End staircase to Flagpole
  const stairStart = 98;
  for (let step = 0; step < 6; step++) {
    for (let y = 12 - step; y <= 12; y++) {
      tiles[y][stairStart + step] = TileType.STAIR_BLOCK;
    }
  }

  // Flagpole at x = 112
  const flagX = 112;
  tiles[3][flagX] = TileType.FLAGTOP;
  for (let y = 4; y <= 12; y++) {
    tiles[y][flagX] = TileType.FLAGPOLE;
  }
  tiles[12][flagX] = TileType.STAIR_BLOCK;

  // Castle wall at end
  for (let x = 118; x < width; x++) {
    for (let y = 8; y <= 12; y++) {
      tiles[y][x] = TileType.BRICK;
    }
  }

  return {
    world: '1-3',
    name: 'Athletic Treetops',
    theme: 'athletic',
    time: 350,
    width,
    height,
    tiles,
    enemies: [
      { kind: 'goomba', x: 20 * 16, y: 9 * 16 },
      { kind: 'koopa', x: 30 * 16, y: 7 * 16 },
      { kind: 'goomba', x: 41 * 16, y: 5 * 16 },
      { kind: 'koopa', x: 58 * 16, y: 6 * 16 },
      { kind: 'goomba', x: 68 * 16, y: 9 * 16 },
      { kind: 'koopa', x: 79 * 16, y: 7 * 16 },
    ],
    collectibles: [
      { kind: 'coin', x: 19 * 16 + 3, y: 8 * 16 },
      { kind: 'coin', x: 28 * 16 + 3, y: 6 * 16 },
      { kind: 'coin', x: 32 * 16 + 3, y: 6 * 16 },
      { kind: 'coin', x: 49 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 51 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 88 * 16 + 3, y: 8 * 16 },
      { kind: 'coin', x: 90 * 16 + 3, y: 8 * 16 },
    ],
    playerSpawn: { x: 40, y: 180 },
    goalType: 'flag',
    goalX: flagX * 16,
  };
}
