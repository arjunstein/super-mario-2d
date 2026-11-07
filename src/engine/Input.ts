export type InputAction = 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'pause';

export class Input {
  private keysDown: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private actionState: Record<InputAction, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    run: false,
    pause: false,
  };
  private actionJustPressed: Record<InputAction, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    run: false,
    pause: false,
  };

  constructor() {
    this.initKeyboard();
  }

  private initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling with arrow keys/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (!this.keysDown.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysDown.add(e.code);
      this.updateActionStates();
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
      this.updateActionStates();
    });

    // Reset inputs on blur
    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.keysJustPressed.clear();
      for (const k of Object.keys(this.actionState) as InputAction[]) {
        this.actionState[k] = false;
        this.actionJustPressed[k] = false;
      }
    });
  }

  private updateActionStates() {
    const isDown = (codes: string[]) => codes.some((code) => this.keysDown.has(code));
    const wasJustPressed = (codes: string[]) => codes.some((code) => this.keysJustPressed.has(code));

    const check = (action: InputAction, codes: string[]) => {
      const active = isDown(codes);
      const just = wasJustPressed(codes);
      this.actionState[action] = active;
      if (just) {
        this.actionJustPressed[action] = true;
      }
    };

    check('left', ['ArrowLeft', 'KeyA']);
    check('right', ['ArrowRight', 'KeyD']);
    check('up', ['ArrowUp', 'KeyW']);
    check('down', ['ArrowDown', 'KeyS']);
    check('jump', ['Space', 'KeyZ', 'ArrowUp', 'KeyW']);
    check('run', ['ShiftLeft', 'ShiftRight', 'KeyX']);
    check('pause', ['KeyP', 'Escape']);
  }

  public setVirtualInput(action: InputAction, active: boolean) {
    if (active && !this.actionState[action]) {
      this.actionJustPressed[action] = true;
    }
    this.actionState[action] = active;
  }

  public isDown(action: InputAction): boolean {
    return this.actionState[action];
  }

  public isJustPressed(action: InputAction): boolean {
    return this.actionJustPressed[action];
  }

  public update() {
    // Reset frame-specific triggers
    this.keysJustPressed.clear();
    for (const k of Object.keys(this.actionJustPressed) as InputAction[]) {
      this.actionJustPressed[k] = false;
    }
  }
}

