class SoundManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private initialized: boolean = false;

  private getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public init() {
    if (!this.initialized) {
      // Create context on first user interaction
      this.getContext();
      this.initialized = true;
    }
  }

  public toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private playTone(frequency: number, type: OscillatorType, duration: number, volume: number = 0.1, slideFreq?: number) {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playClick() {
    this.playTone(600, 'sine', 0.05, 0.02, 800);
  }

  playCorrect() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      
      const playNote = (freq: number, delay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      };

      playNote(523.25, 0);    // C5
      playNote(659.25, 0.1);  // E5
      playNote(783.99, 0.2);  // G5
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playIncorrect() {
    this.playTone(150, 'sawtooth', 0.3, 0.05, 100);
  }

  playLevelUp() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const playNote = (freq: number, delay: number, duration: number = 0.4) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      playNote(523.25, 0);    // C5
      playNote(659.25, 0.1);  // E5
      playNote(783.99, 0.2);  // G5
      playNote(1046.50, 0.3, 0.6); // C6
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playTransition() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }
}

export const soundManager = new SoundManager();
