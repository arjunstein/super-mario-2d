import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'mario.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and reliability
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      coins INTEGER NOT NULL,
      level_completed INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_saves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_name TEXT UNIQUE NOT NULL,
      player_name TEXT NOT NULL,
      current_level INTEGER NOT NULL,
      score INTEGER NOT NULL,
      coins INTEGER NOT NULL,
      lives INTEGER NOT NULL,
      is_super INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default leaderboard if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM leaderboard').get() as { count: number };
  if (countRow.count === 0) {
    const insert = db.prepare(`
      INSERT INTO leaderboard (player_name, score, coins, level_completed)
      VALUES (?, ?, ?, ?)
    `);

    const defaults = [
      ['MARIO', 12500, 48, 3],
      ['LUIGI', 9800, 35, 3],
      ['PEACH', 6400, 22, 2],
      ['TOAD', 3200, 15, 1],
      ['YOSHI', 1500, 8, 1],
    ];

    for (const [name, score, coins, level] of defaults) {
      insert.run(name, score, coins, level);
    }
  }
}

export interface LeaderboardEntry {
  id?: number;
  player_name: string;
  score: number;
  coins: number;
  level_completed: number;
  created_at?: string;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return db
    .prepare('SELECT id, player_name, score, coins, level_completed, created_at FROM leaderboard ORDER BY score DESC LIMIT 10')
    .all() as LeaderboardEntry[];
}

export function addLeaderboardEntry(entry: {
  player_name: string;
  score: number;
  coins: number;
  level_completed: number;
}) {
  const stmt = db.prepare(`
    INSERT INTO leaderboard (player_name, score, coins, level_completed)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(
    entry.player_name.toUpperCase().slice(0, 12) || 'PLAYER',
    entry.score,
    entry.coins,
    entry.level_completed
  );
}

export interface GameSave {
  id?: number;
  slot_name: string;
  player_name: string;
  current_level: number;
  score: number;
  coins: number;
  lives: number;
  is_super: number;
  updated_at?: string;
}

export function getSaves(): GameSave[] {
  return db
    .prepare('SELECT id, slot_name, player_name, current_level, score, coins, lives, is_super, updated_at FROM game_saves ORDER BY slot_name ASC')
    .all() as GameSave[];
}

export function getSaveBySlot(slotName: string): GameSave | undefined {
  return db
    .prepare('SELECT id, slot_name, player_name, current_level, score, coins, lives, is_super, updated_at FROM game_saves WHERE slot_name = ?')
    .get(slotName) as GameSave | undefined;
}

export function saveGame(save: {
  slot_name: string;
  player_name: string;
  current_level: number;
  score: number;
  coins: number;
  lives: number;
  is_super: boolean;
}) {
  const stmt = db.prepare(`
    INSERT INTO game_saves (slot_name, player_name, current_level, score, coins, lives, is_super, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slot_name) DO UPDATE SET
      player_name = excluded.player_name,
      current_level = excluded.current_level,
      score = excluded.score,
      coins = excluded.coins,
      lives = excluded.lives,
      is_super = excluded.is_super,
      updated_at = CURRENT_TIMESTAMP
  `);

  return stmt.run(
    save.slot_name,
    save.player_name.toUpperCase().slice(0, 12) || 'PLAYER',
    save.current_level,
    save.score,
    save.coins,
    save.lives,
    save.is_super ? 1 : 0
  );
}

