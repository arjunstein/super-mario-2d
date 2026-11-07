export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmInterval: number | null = null;
  private currentBgmLevel: number = 0;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      if (this.currentBgmLevel > 0) {
        this.startBGM(this.currentBgmLevel);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playJump(isSuper: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';

    const now = this.ctx.currentTime;
    const startFreq = isSuper ? 180 : 140;
    const endFreq = isSuper ? 650 : 500;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // B5 (987Hz) for 0.08s then E6 (1318Hz) for 0.35s
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0.2, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playStomp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playBump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Generate noise buffer
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  public playPowerup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [330, 392, 659, 523, 587, 784];
    const duration = 0.07;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.18, now + idx * duration);
      gain.gain.linearRampToValueAtTime(0.01, now + (idx + 1) * duration);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * duration);
      osc.stop(now + (idx + 1) * duration);
    });
  }

  public playPowerdown() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587, 493, 440, 349, 293];
    const duration = 0.08;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.18, now + idx * duration);
      gain.gain.linearRampToValueAtTime(0.01, now + (idx + 1) * duration);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * duration);
      osc.stop(now + (idx + 1) * duration);
    });
  }

  public playDie() {
    this.stopBGM();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 500, d: 0.15 },
      { f: 450, d: 0.15 },
      { f: 400, d: 0.15 },
      { f: 300, d: 0.4 },
    ];

    let t = now;
    for (const note of notes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d;
    }
  }

  public playStageClear() {
    this.stopBGM();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 392, d: 0.12 }, // G4
      { f: 523, d: 0.12 }, // C5
      { f: 659, d: 0.12 }, // E5
      { f: 784, d: 0.12 }, // G5
      { f: 1046, d: 0.24 }, // C6
      { f: 784, d: 0.12 }, // G5
      { f: 1046, d: 0.5 }, // C6
    ];

    let t = now;
    for (const note of notes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.02, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d + 0.02;
    }
  }

  public playBossDefeat() {
    this.stopBGM();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  public startBGM(level: number) {
    this.currentBgmLevel = level;
    if (this.isMuted) return;
    this.stopBGM();
    this.initCtx();
    if (!this.ctx) return;

    // Chiptune melodic patterns based on theme
    const overworldMelody = [
      { f: 330, d: 0.12 }, { f: 330, d: 0.12 }, { f: 0, d: 0.12 }, { f: 330, d: 0.12 },
      { f: 0, d: 0.12 }, { f: 261, d: 0.12 }, { f: 330, d: 0.12 }, { f: 392, d: 0.25 },
      { f: 0, d: 0.25 }, { f: 196, d: 0.25 }, { f: 0, d: 0.25 },
    ];

    const undergroundMelody = [
      { f: 220, d: 0.15 }, { f: 440, d: 0.15 }, { f: 207, d: 0.15 }, { f: 415, d: 0.15 },
      { f: 196, d: 0.15 }, { f: 392, d: 0.15 }, { f: 185, d: 0.25 }, { f: 0, d: 0.15 },
    ];

    const castleMelody = [
      { f: 130, d: 0.15 }, { f: 146, d: 0.15 }, { f: 130, d: 0.15 }, { f: 123, d: 0.2 },
      { f: 164, d: 0.15 }, { f: 155, d: 0.15 }, { f: 146, d: 0.3 }, { f: 0, d: 0.15 },
    ];

    const melody = level === 1 ? overworldMelody : level === 2 ? undergroundMelody : castleMelody;
    let stepIndex = 0;

    const playStep = () => {
      if (!this.ctx || this.isMuted) return;
      const note = melody[stepIndex];
      stepIndex = (stepIndex + 1) % melody.length;

      if (note.f > 0) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = level === 2 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(note.f, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.005, now + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + note.d);
      }
    };

    playStep();
    this.bgmInterval = window.setInterval(playStep, 220);
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmOscillator) {
      try {
        this.bgmOscillator.stop();
        this.bgmOscillator.disconnect();
      } catch {
        // ignore already stopped
      }
      this.bgmOscillator = null;
    }
  }
}

export const sounds = new SoundEngine();

