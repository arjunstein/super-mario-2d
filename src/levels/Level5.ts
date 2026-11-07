import { LevelData } from './Level.js';
import { TileType } from '../engine/Types.js';

export function getLevel5Data(): LevelData {
  const width = 130;
  const height = 15;

  const tiles: number[][] = Array.from({ length: height }, () => Array(width).fill(TileType.EMPTY));

  // Castle ceiling
  for (let x = 0; x < width; x++) {
    tiles[0][x] = TileType.CASTLE_BRICK;
    tiles[1][x] = TileType.CASTLE_BRICK;
  }

  // Castle floor and lava pits
  for (let x = 0; x < width; x++) {
    // Fill bottom rows with lava by default
    tiles[14][x] = TileType.LAVA;

    // Stone platforms vs Lava pools
    // Safe stone floor: 0..24, 34..50, 62..75, 114..129
    if (
      (x >= 0 && x <= 24) ||
      (x >= 34 && x <= 50) ||
      (x >= 62 && x <= 75) ||
      (x >= 114 && x <= 129)
    ) {
      tiles[13][x] = TileType.CASTLE_BRICK;
      tiles[14][x] = TileType.CASTLE_BRICK;
    } else {
      // Lava pool
      tiles[13][x] = TileType.LAVA;
      tiles[14][x] = TileType.LAVA;
    }
  }

  // Floating stepping stones over first lava pool (x: 25..33)
  tiles[11][26] = TileType.CASTLE_BRICK;
  tiles[11][27] = TileType.CASTLE_BRICK;
  tiles[9][30] = TileType.CASTLE_BRICK;
  tiles[9][31] = TileType.CASTLE_BRICK;

  // Question blocks & castle obstacles
  tiles[9][14] = TileType.QUESTION_COIN;
  tiles[9][16] = TileType.QUESTION_MUSHROOM;
  tiles[9][18] = TileType.QUESTION_COIN;

  // Mid castle fortress blocks
  for (let x = 40; x <= 46; x++) {
    tiles[9][x] = TileType.CASTLE_BRICK;
    tiles[5][x] = TileType.CASTLE_BRICK;
  }
  tiles[9][43] = TileType.QUESTION_COIN;

  // Stepping stones over second lava pool (x: 51..61)
  tiles[10][53] = TileType.CASTLE_BRICK;
  tiles[8][56] = TileType.CASTLE_BRICK;
  tiles[10][59] = TileType.CASTLE_BRICK;

  // High castle battlements
  for (let step = 0; step < 4; step++) {
    for (let y = 12 - step; y <= 12; y++) {
      tiles[y][68 + step] = TileType.CASTLE_BRICK;
    }
  }

  // Pre-Boss corridor
  for (let x = 72; x <= 85; x++) {
    tiles[8][x] = TileType.CASTLE_BRICK;
  }
  tiles[8][78] = TileType.QUESTION_MUSHROOM;

  // The Grand Bowser Bridge (x: 88 to 110) over bottomless lava!
  for (let x = 88; x <= 110; x++) {
    tiles[11][x] = TileType.BRIDGE;
  }

  // Axe Switch on safe ground past bridge (x: 112)
  const axeX = 112;
  tiles[11][111] = TileType.CASTLE_BRICK;
  tiles[12][111] = TileType.CASTLE_BRICK;
  tiles[13][111] = TileType.CASTLE_BRICK;

  tiles[10][axeX] = TileType.AXE;
  tiles[11][axeX] = TileType.CASTLE_BRICK;
  tiles[12][axeX] = TileType.CASTLE_BRICK;
  tiles[13][axeX] = TileType.CASTLE_BRICK;

  // Victory Chamber past the Axe
  for (let x = 114; x < width; x++) {
    tiles[12][x] = TileType.CASTLE_BRICK;
    tiles[13][x] = TileType.CASTLE_BRICK;
  }

  return {
    world: '1-5',
    name: "Bowser's Castle",
    theme: 'castle',
    time: 300,
    width,
    height,
    tiles,
    enemies: [
      { kind: 'goomba', x: 18 * 16, y: 12 * 16 },
      { kind: 'koopa', x: 42 * 16, y: 12 * 16 },
      { kind: 'koopa', x: 65 * 16, y: 12 * 16 },
      // Bowser stationed on the bridge!
      { kind: 'bowser', x: 101 * 16, y: 9 * 16 },
    ],
    collectibles: [
      { kind: 'coin', x: 15 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 17 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 42 * 16 + 3, y: 4 * 16 },
      { kind: 'coin', x: 44 * 16 + 3, y: 4 * 16 },
      { kind: 'coin', x: 56 * 16 + 3, y: 6 * 16 },
    ],
    firebars: [
      { cx: 43 * 16 + 8, cy: 9 * 16 + 8, length: 5, speed: 2.2 },
      { cx: 78 * 16 + 8, cy: 8 * 16 + 8, length: 5, speed: -2.4 },
    ],
    playerSpawn: { x: 35, y: 180 },
    goalType: 'axe',
    goalX: axeX * 16,
  };
}

