import { LevelData } from './Level.js';
import { TileType } from '../engine/Types.js';

export function getLevel1Data(): LevelData {
  const width = 120;
  const height = 15;

  // Initialize empty grid
  const tiles: number[][] = Array.from({ length: height }, () => Array(width).fill(TileType.EMPTY));

  // Helper to place ground with optional pits
  for (let x = 0; x < width; x++) {
    // Pits at x = 42..44 and x = 65..67
    if ((x >= 42 && x <= 44) || (x >= 65 && x <= 67)) {
      continue;
    }
    tiles[13][x] = TileType.GROUND;
    tiles[14][x] = TileType.GROUND;
  }

  // Helper to build pipe
  const placePipe = (startX: number, pipeHeight: number) => {
    const topY = 13 - pipeHeight;
    tiles[topY][startX] = TileType.PIPE_TL;
    tiles[topY][startX + 1] = TileType.PIPE_TR;
    for (let y = topY + 1; y < 13; y++) {
      tiles[y][startX] = TileType.PIPE_BL;
      tiles[y][startX + 1] = TileType.PIPE_BR;
    }
  };

  // Place pipes
  placePipe(18, 2);
  placePipe(28, 3);
  placePipe(38, 4);
  placePipe(56, 2);

  // Early question blocks & bricks
  tiles[9][10] = TileType.QUESTION_COIN;

  tiles[9][14] = TileType.BRICK;
  tiles[9][15] = TileType.QUESTION_MUSHROOM;
  tiles[9][16] = TileType.BRICK;
  tiles[9][17] = TileType.QUESTION_COIN;
  tiles[9][18] = TileType.BRICK;

  tiles[5][16] = TileType.QUESTION_COIN;

  // Middle section blocks
  tiles[9][48] = TileType.BRICK;
  tiles[9][49] = TileType.QUESTION_COIN;
  tiles[9][50] = TileType.BRICK;

  tiles[5][52] = TileType.BRICK;
  tiles[5][53] = TileType.BRICK;
  tiles[5][54] = TileType.QUESTION_COIN;
  tiles[5][55] = TileType.BRICK;

  // High bridge of bricks
  for (let x = 72; x <= 78; x++) {
    tiles[9][x] = TileType.BRICK;
  }
  tiles[9][75] = TileType.QUESTION_MUSHROOM;

  // Staircase leading to flagpole
  const stairStart = 88;
  for (let step = 0; step < 7; step++) {
    for (let y = 12 - step; y <= 12; y++) {
      tiles[y][stairStart + step] = TileType.STAIR_BLOCK;
    }
  }

  // Flagpole at x = 104
  const flagX = 104;
  tiles[3][flagX] = TileType.FLAGTOP;
  for (let y = 4; y <= 12; y++) {
    tiles[y][flagX] = TileType.FLAGPOLE;
  }
  tiles[12][flagX] = TileType.STAIR_BLOCK;

  // Castle wall at the end
  for (let x = 112; x < 120; x++) {
    for (let y = 8; y <= 12; y++) {
      tiles[y][x] = TileType.BRICK;
    }
  }

  return {
    world: '1-1',
    name: 'Overworld',
    theme: 'overworld',
    time: 400,
    width,
    height,
    tiles,
    enemies: [
      { kind: 'goomba', x: 22 * 16, y: 12 * 16 },
      { kind: 'goomba', x: 33 * 16, y: 12 * 16 },
      { kind: 'goomba', x: 35 * 16, y: 12 * 16 },
      { kind: 'goomba', x: 50 * 16, y: 12 * 16 },
      { kind: 'goomba', x: 62 * 16, y: 12 * 16 },
      { kind: 'goomba', x: 74 * 16, y: 8 * 16 },
      { kind: 'goomba', x: 82 * 16, y: 12 * 16 },
    ],
    collectibles: [
      { kind: 'coin', x: 10 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 24 * 16 + 3, y: 10 * 16 },
      { kind: 'coin', x: 53 * 16 + 3, y: 3 * 16 },
      { kind: 'coin', x: 73 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 77 * 16 + 3, y: 7 * 16 },
    ],
    playerSpawn: { x: 40, y: 180 },
    goalType: 'flag',
    goalX: flagX * 16,
  };
}

