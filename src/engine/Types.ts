export type GameState =
  | 'TITLE'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_TRANSITION'
  | 'LEVEL_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY';

export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  BRICK = 2,
  QUESTION_COIN = 3,
  QUESTION_MUSHROOM = 4,
  BLOCK_EMPTY = 5,
  PIPE_TL = 6,
  PIPE_TR = 7,
  PIPE_BL = 8,
  PIPE_BR = 9,
  UG_GROUND = 10,
  UG_BRICK = 11,
  CASTLE_BRICK = 12,
  LAVA = 13,
  FLAGPOLE = 14,
  FLAGTOP = 15,
  AXE = 16,
  BRIDGE = 17,
  STAIR_BLOCK = 18,
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface ScorePopup {
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
}

