import { Rect, TileType } from './Types.js';

export const GRAVITY = 950;
export const MAX_FALL_SPEED = 400;
export const TILE_SIZE = 16;

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function isSolidTile(type: TileType): boolean {
  switch (type) {
    case TileType.GROUND:
    case TileType.BRICK:
    case TileType.QUESTION_COIN:
    case TileType.QUESTION_MUSHROOM:
    case TileType.BLOCK_EMPTY:
    case TileType.PIPE_TL:
    case TileType.PIPE_TR:
    case TileType.PIPE_BL:
    case TileType.PIPE_BR:
    case TileType.UG_GROUND:
    case TileType.UG_BRICK:
    case TileType.CASTLE_BRICK:
    case TileType.BRIDGE:
    case TileType.STAIR_BLOCK:
      return true;
    default:
      return false;
  }
}

export interface TileCollisionResult {
  collidedX: boolean;
  collidedY: boolean;
  onGround: boolean;
  hitCeiling: boolean;
  hitTileX?: number;
  hitTileY?: number;
  hitTileType?: TileType;
}

export function moveAndSlide(
  box: Rect,
  vx: number,
  vy: number,
  dt: number,
  getTile: (tx: number, ty: number) => TileType
): { x: number; y: number; vx: number; vy: number; onGround: boolean; hitCeiling: boolean; ceilingTile?: { tx: number; ty: number; type: TileType } } {
  let newX = box.x;
  let newY = box.y;
  let curVx = vx;
  let curVy = vy;
  let onGround = false;
  let hitCeiling = false;
  let ceilingTile: { tx: number; ty: number; type: TileType } | undefined = undefined;

  // 1. Move along X
  const deltaX = curVx * dt;
  newX += deltaX;

  const minTxX = Math.floor(newX / TILE_SIZE);
  const maxTxX = Math.floor((newX + box.w - 0.01) / TILE_SIZE);
  const minTyX = Math.floor(newY / TILE_SIZE);
  const maxTyX = Math.floor((newY + box.h - 0.01) / TILE_SIZE);

  if (deltaX > 0) {
    // Moving Right
    for (let ty = minTyX; ty <= maxTyX; ty++) {
      const tile = getTile(maxTxX, ty);
      if (isSolidTile(tile)) {
        newX = maxTxX * TILE_SIZE - box.w;
        curVx = 0;
        break;
      }
    }
  } else if (deltaX < 0) {
    // Moving Left
    for (let ty = minTyX; ty <= maxTyX; ty++) {
      const tile = getTile(minTxX, ty);
      if (isSolidTile(tile)) {
        newX = (minTxX + 1) * TILE_SIZE;
        curVx = 0;
        break;
      }
    }
  }

  // 2. Move along Y
  const deltaY = curVy * dt;
  newY += deltaY;

  const minTxY = Math.floor(newX / TILE_SIZE);
  const maxTxY = Math.floor((newX + box.w - 0.01) / TILE_SIZE);
  const minTyY = Math.floor(newY / TILE_SIZE);
  const maxTyY = Math.floor((newY + box.h - 0.01) / TILE_SIZE);

  if (deltaY > 0) {
    // Falling Down
    for (let tx = minTxY; tx <= maxTxY; tx++) {
      const tile = getTile(tx, maxTyY);
      if (isSolidTile(tile)) {
        newY = maxTyY * TILE_SIZE - box.h;
        curVy = 0;
        onGround = true;
        break;
      }
    }
  } else if (deltaY < 0) {
    // Jumping Up
    for (let tx = minTxY; tx <= maxTxY; tx++) {
      const tile = getTile(tx, minTyY);
      if (isSolidTile(tile)) {
        newY = (minTyY + 1) * TILE_SIZE;
        curVy = 0;
        hitCeiling = true;
        ceilingTile = { tx, ty: minTyY, type: tile };
        break;
      }
    }
  }

  return {
    x: newX,
    y: newY,
    vx: curVx,
    vy: curVy,
    onGround,
    hitCeiling,
    ceilingTile,
  };
}

