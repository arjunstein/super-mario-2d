import { LevelData } from './Level.js';
import { TileType } from '../engine/Types.js';

export function getLevel2Data(): LevelData {
  const width = 125;
  const height = 15;

  const tiles: number[][] = Array.from({ length: height }, () => Array(width).fill(TileType.EMPTY));

  // Cavern Ceiling
  for (let x = 0; x < width; x++) {
    tiles[0][x] = TileType.UG_BRICK;
    tiles[1][x] = TileType.UG_BRICK;
  }

  // Cavern Floor with pits
  for (let x = 0; x < width; x++) {
    // Pits at x = 28..31, 52..56, 80..83
    if (
      (x >= 28 && x <= 31) ||
      (x >= 52 && x <= 56) ||
      (x >= 80 && x <= 83)
    ) {
      continue;
    }
    tiles[13][x] = TileType.UG_GROUND;
    tiles[14][x] = TileType.UG_GROUND;
  }

  // Floating platforms and coin clusters
  // First underground platform section
  for (let x = 14; x <= 22; x++) {
    tiles[9][x] = TileType.UG_BRICK;
  }
  tiles[9][16] = TileType.QUESTION_COIN;
  tiles[9][18] = TileType.QUESTION_MUSHROOM;
  tiles[9][20] = TileType.QUESTION_COIN;

  // Stepping stones over first pit
  tiles[10][29] = TileType.UG_BRICK;
  tiles[10][30] = TileType.UG_BRICK;

  // Middle upper walkway
  for (let x = 36; x <= 48; x++) {
    tiles[8][x] = TileType.UG_BRICK;
    tiles[4][x] = TileType.UG_BRICK;
  }
  tiles[8][40] = TileType.QUESTION_COIN;
  tiles[8][44] = TileType.QUESTION_COIN;

  // Narrow stepping platforms over big pit
  tiles[11][53] = TileType.UG_BRICK;
  tiles[9][55] = TileType.UG_BRICK;

  // Staircase & blocks in cavern
  for (let step = 0; step < 5; step++) {
    for (let y = 12 - step; y <= 12; y++) {
      tiles[y][66 + step] = TileType.STAIR_BLOCK;
    }
  }

  for (let x = 71; x <= 78; x++) {
    tiles[8][x] = TileType.UG_BRICK;
  }
  tiles[8][74] = TileType.QUESTION_MUSHROOM;

  // Floating stepping stone over third pit
  tiles[10][81] = TileType.UG_BRICK;
  tiles[10][82] = TileType.UG_BRICK;

  // End cavern tunnel leading to giant exit pipe
  for (let x = 90; x <= 108; x++) {
    tiles[6][x] = TileType.UG_BRICK;
  }

  // Exit pipe at x = 106
  const pipeX = 106;
  tiles[10][pipeX] = TileType.PIPE_TL;
  tiles[10][pipeX + 1] = TileType.PIPE_TR;
  for (let y = 11; y <= 12; y++) {
    tiles[y][pipeX] = TileType.PIPE_BL;
    tiles[y][pipeX + 1] = TileType.PIPE_BR;
  }

  // End wall
  for (let x = 110; x < width; x++) {
    for (let y = 2; y <= 12; y++) {
      tiles[y][x] = TileType.UG_BRICK;
    }
  }

  return {
    world: '1-2',
    name: 'Underground Cavern',
    theme: 'underground',
    time: 350,
    width,
    height,
    tiles,
    enemies: [
      { kind: 'goomba', x: 18 * 16, y: 12 * 16 },
      { kind: 'koopa', x: 25 * 16, y: 11 * 16 },
      { kind: 'goomba', x: 38 * 16, y: 7 * 16 },
      { kind: 'goomba', x: 44 * 16, y: 7 * 16 },
      { kind: 'koopa', x: 62 * 16, y: 11 * 16 },
      { kind: 'goomba', x: 74 * 16, y: 7 * 16 },
      { kind: 'koopa', x: 95 * 16, y: 11 * 16 },
    ],
    collectibles: [
      { kind: 'coin', x: 17 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 19 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 39 * 16 + 3, y: 3 * 16 },
      { kind: 'coin', x: 41 * 16 + 3, y: 3 * 16 },
      { kind: 'coin', x: 43 * 16 + 3, y: 3 * 16 },
      { kind: 'coin', x: 53 * 16 + 3, y: 9 * 16 },
      { kind: 'coin', x: 55 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 98 * 16 + 3, y: 11 * 16 },
      { kind: 'coin', x: 101 * 16 + 3, y: 11 * 16 },
    ],
    playerSpawn: { x: 35, y: 180 },
    goalType: 'pipe',
    goalX: pipeX * 16,
  };
}

