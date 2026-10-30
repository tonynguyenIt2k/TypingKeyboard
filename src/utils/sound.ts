class TypingSoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playKeyClick(isSpace = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSpace ? 190 : 310, now);
    osc.frequency.exponentialRampToValueAtTime(isSpace ? 75 : 115, now + 0.032);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.038);
  }

  playErrorSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-oscillator soft dissonant "buzzer" filtered through a warm low-pass filter
    const oscPrimary = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    oscPrimary.type = 'sawtooth';
    oscPrimary.frequency.setValueAtTime(148, now);
    oscPrimary.frequency.linearRampToValueAtTime(118, now + 0.11);

    oscSub.type = 'square';
    oscSub.frequency.setValueAtTime(110, now);
    oscSub.frequency.linearRampToValueAtTime(92, now + 0.11);

    // Tame harsh high harmonics so the buzzer stays pleasant during intensive sessions
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(620, now);
    filter.frequency.exponentialRampToValueAtTime(260, now + 0.11);
    filter.Q.setValueAtTime(1.8, now);

    // Quick double-pulse buzzer envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.085, now + 0.012);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.045);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.065);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    oscPrimary.connect(filter);
    oscSub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    oscPrimary.start(now);
    oscSub.start(now);
    oscPrimary.stop(now + 0.125);
    oscSub.stop(now + 0.125);
  }

  playSuccessChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  }
}

export const soundEngine = new TypingSoundEngine();
