import './style.css';
import { Game } from './engine/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element #game-canvas not found!');
    return;
  }

  const game = new Game(canvas);

  // Setup mobile / touch virtual controls
  const bindVirtualButton = (btnId: string, action: 'left' | 'right' | 'jump' | 'run') => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const start = (e: Event) => {
      e.preventDefault();
      game.input.setVirtualInput(action, true);
    };

    const end = (e: Event) => {
      e.preventDefault();
      game.input.setVirtualInput(action, false);
    };

    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', end, { passive: false });
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);
  };

  bindVirtualButton('v-left', 'left');
  bindVirtualButton('v-right', 'right');
  bindVirtualButton('v-jump', 'jump');
  bindVirtualButton('v-run', 'run');

  game.init();
});

