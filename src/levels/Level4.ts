import { LevelData } from './Level.js';
import { TileType } from '../engine/Types.js';

export function getLevel4Data(): LevelData {
  const width = 125;
  const height = 15;

  const tiles: number[][] = Array.from({ length: height }, () => Array(width).fill(TileType.EMPTY));

  // Night ruins floor with pits
  for (let x = 0; x < width; x++) {
    // Pits at x = 24..27, 48..52, 76..80
    if (
      (x >= 24 && x <= 27) ||
      (x >= 48 && x <= 52) ||
      (x >= 76 && x <= 80)
    ) {
      continue;
    }
    tiles[13][x] = TileType.UG_GROUND;
    tiles[14][x] = TileType.UG_GROUND;
  }

  // Helper for pipe
  const placePipe = (startX: number, pipeHeight: number) => {
    const topY = 13 - pipeHeight;
    tiles[topY][startX] = TileType.PIPE_TL;
    tiles[topY][startX + 1] = TileType.PIPE_TR;
    for (let y = topY + 1; y < 13; y++) {
      tiles[y][startX] = TileType.PIPE_BL;
      tiles[y][startX + 1] = TileType.PIPE_BR;
    }
  };

  placePipe(14, 2);
  placePipe(34, 3);
  placePipe(66, 3);

  // Floating ancient ruins blocks
  for (let x = 18; x <= 23; x++) {
    tiles[9][x] = TileType.UG_BRICK;
  }
  tiles[9][19] = TileType.QUESTION_COIN;
  tiles[9][22] = TileType.QUESTION_MUSHROOM;

  // Stepping stones over first pit
  tiles[10][25] = TileType.UG_BRICK;
  tiles[10][26] = TileType.UG_BRICK;

  // Middle elevated platform with Firebar
  for (let x = 38; x <= 46; x++) {
    tiles[8][x] = TileType.UG_BRICK;
    tiles[4][x] = TileType.UG_BRICK;
  }
  tiles[8][41] = TileType.QUESTION_COIN;
  tiles[8][43] = TileType.QUESTION_COIN;

  // Stepping stones over second pit
  tiles[11][49] = TileType.UG_BRICK;
  tiles[9][51] = TileType.UG_BRICK;

  // Staircase & high battlements
  for (let step = 0; step < 5; step++) {
    for (let y = 12 - step; y <= 12; y++) {
      tiles[y][56 + step] = TileType.STAIR_BLOCK;
    }
  }

  for (let x = 61; x <= 72; x++) {
    tiles[7][x] = TileType.UG_BRICK;
  }
  tiles[7][64] = TileType.QUESTION_COIN;
  tiles[7][68] = TileType.QUESTION_MUSHROOM;

  // Stepping stone over third pit
  tiles[10][77] = TileType.UG_BRICK;
  tiles[10][78] = TileType.UG_BRICK;

  // Final tunnel leading to giant warp pipe
  for (let x = 84; x <= 104; x++) {
    tiles[8][x] = TileType.UG_BRICK;
  }

  // Giant exit pipe at x = 106 leading to Bowser's domain!
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
    world: '1-4',
    name: 'Night Ruins',
    theme: 'night',
    time: 350,
    width,
    height,
    tiles,
    enemies: [
      { kind: 'goomba', x: 20 * 16, y: 12 * 16 },
      { kind: 'koopa', x: 38 * 16, y: 7 * 16 },
      { kind: 'goomba', x: 44 * 16, y: 7 * 16 },
      { kind: 'koopa', x: 65 * 16, y: 6 * 16 },
      { kind: 'goomba', x: 70 * 16, y: 6 * 16 },
      { kind: 'koopa', x: 92 * 16, y: 12 * 16 },
      { kind: 'goomba', x: 98 * 16, y: 12 * 16 },
    ],
    collectibles: [
      { kind: 'coin', x: 19 * 16 + 3, y: 6 * 16 },
      { kind: 'coin', x: 21 * 16 + 3, y: 6 * 16 },
      { kind: 'coin', x: 40 * 16 + 3, y: 3 * 16 },
      { kind: 'coin', x: 42 * 16 + 3, y: 3 * 16 },
      { kind: 'coin', x: 63 * 16 + 3, y: 5 * 16 },
      { kind: 'coin', x: 67 * 16 + 3, y: 5 * 16 },
      { kind: 'coin', x: 86 * 16 + 3, y: 7 * 16 },
      { kind: 'coin', x: 88 * 16 + 3, y: 7 * 16 },
    ],
    firebars: [
      { cx: 42 * 16 + 8, cy: 8 * 16 + 8, length: 5, speed: 2.5 },
      { cx: 66 * 16 + 8, cy: 7 * 16 + 8, length: 5, speed: -2.3 },
    ],
    playerSpawn: { x: 35, y: 180 },
    goalType: 'pipe',
    goalX: pipeX * 16,
  };
}

