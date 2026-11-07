import { Router } from 'express';
import {
  getLeaderboard,
  addLeaderboardEntry,
  getSaves,
  getSaveBySlot,
  saveGame,
} from './db.js';

export const apiRouter = Router();

// Health check endpoint for Docker / orchestration
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Leaderboard endpoints
apiRouter.get('/leaderboard', (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const list = getLeaderboard();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/leaderboard', (req, res) => {
  try {
    const { player_name, score, coins, level_completed } = req.body;
    const numScore = Number(score);
    if (isNaN(numScore)) {
      return res.status(400).json({ success: false, error: 'Valid score is required' });
    }

    addLeaderboardEntry({
      player_name: String(player_name || 'HERO'),
      score: numScore,
      coins: Number(coins) || 0,
      level_completed: Number(level_completed) || 5,
    });

    const updated = getLeaderboard();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Game save slots endpoints
apiRouter.get('/saves', (_req, res) => {
  try {
    const saves = getSaves();
    res.json({ success: true, data: saves });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.get('/saves/:slot', (req, res) => {
  try {
    const slot = req.params.slot;
    const save = getSaveBySlot(slot);
    if (!save) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }
    res.json({ success: true, data: save });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/saves', (req, res) => {
  try {
    const { slot_name, player_name, current_level, score, coins, lives, is_super } = req.body;
    if (!slot_name) {
      return res.status(400).json({ success: false, error: 'slot_name is required' });
    }

    saveGame({
      slot_name: String(slot_name),
      player_name: String(player_name || 'MARIO'),
      current_level: Number(current_level) || 1,
      score: Number(score) || 0,
      coins: Number(coins) || 0,
      lives: Number(lives) || 3,
      is_super: Boolean(is_super),
    });

    res.json({ success: true, message: 'Game saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

