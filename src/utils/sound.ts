class TypingSoundEngine {
  private ctx: AudioContext | null = null;
  private metroTimerId: number | null = null;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private metroBpm = 120;
  private isMetroPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private soundPack: 'default' | 'clicky' | 'thocky' | 'creamy' | 'typewriter' = 'default';
  private masterVolume = 0.8;

  setSoundPack(pack: 'default' | 'clicky' | 'thocky' | 'creamy' | 'typewriter') {
    this.soundPack = pack;
  }

  getSoundPack() {
    return this.soundPack;
  }

  setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  playKeyClick(isSpace = false, packOverride?: 'default' | 'clicky' | 'thocky' | 'creamy' | 'typewriter') {
    const ctx = this.getContext();
    if (!ctx || this.masterVolume <= 0) return;

    const pack = packOverride || this.soundPack;
    const now = ctx.currentTime;

    if (pack === 'clicky') {
      // Cherry MX Blue style: crisp snappy dual-click transient
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSpace ? 750 : 1200, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 180 : 350, now + 0.024);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(isSpace ? 1100 : 1850, now);
      osc2.frequency.exponentialRampToValueAtTime(320, now + 0.015);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09 * this.masterVolume, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.03);
      osc2.stop(now + 0.03);
      return;
    }

    if (pack === 'thocky') {
      // Deep resonant lubricated switch (Gateron Ink / Alpaca)
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSpace ? 140 : 210, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 52 : 72, now + 0.045);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
      return;
    }

    if (pack === 'creamy') {
      // NovelKeys Cream: soft, silky mid-range damp clack
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSpace ? 280 : 420, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 110 : 160, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isSpace ? 480 : 680, now);
      filter.Q.setValueAtTime(1.8, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08 * this.masterVolume, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
      return;
    }

    if (pack === 'typewriter') {
      // Vintage mechanical typewriter: metallic strike followed by slight spring ring
      const osc = ctx.createOscillator();
      const oscMetal = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(isSpace ? 320 : 680, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 90 : 140, now + 0.04);

      oscMetal.type = 'sine';
      oscMetal.frequency.setValueAtTime(2400, now);
      oscMetal.frequency.exponentialRampToValueAtTime(800, now + 0.03);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.085 * this.masterVolume, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      oscMetal.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscMetal.start(now);
      osc.stop(now + 0.048);
      oscMetal.stop(now + 0.048);
      return;
    }

    // Default mechanical tactile click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSpace ? 190 : 310, now);
    osc.frequency.exponentialRampToValueAtTime(isSpace ? 75 : 115, now + 0.032);

    gain.gain.setValueAtTime(0.06 * this.masterVolume, now);
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

  private scheduleMetronomeTick(time: number, isAccentBeat: boolean) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Crisp warm woodblock / pendulum tick
    osc.type = 'triangle';
    const startFreq = isAccentBeat ? 1040 : 780;
    const endFreq = isAccentBeat ? 420 : 320;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.028);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isAccentBeat ? 950 : 720, time);
    filter.Q.setValueAtTime(2.2, time);

    const peakGain = isAccentBeat ? 0.11 : 0.07;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peakGain, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.036);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  private schedulerStep = () => {
    if (!this.isMetroPlaying || !this.ctx) return;

    const scheduleAheadSec = 0.1;
    // Clamp nextNoteTime if tab was backgrounded so it doesn't burst-fire ticks
    if (this.nextNoteTime < this.ctx.currentTime - 0.05) {
      this.nextNoteTime = this.ctx.currentTime + 0.02;
    }

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadSec) {
      const isAccent = this.currentBeat % 5 === 0; // 1 standard word = 5 characters
      this.scheduleMetronomeTick(this.nextNoteTime, isAccent);

      const secondsPerBeat = 60.0 / Math.max(40, Math.min(450, this.metroBpm));
      this.nextNoteTime += secondsPerBeat;
      this.currentBeat = (this.currentBeat + 1) % 5;
    }
  };

  startMetronome(bpm: number) {
    this.metroBpm = Math.max(40, Math.min(450, bpm));
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.isMetroPlaying) {
      return;
    }

    this.isMetroPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = ctx.currentTime + 0.04;

    if (this.metroTimerId !== null) {
      window.clearInterval(this.metroTimerId);
    }
    this.metroTimerId = window.setInterval(this.schedulerStep, 25);
  }

  setMetronomeBpm(bpm: number) {
    this.metroBpm = Math.max(40, Math.min(450, bpm));
  }

  stopMetronome() {
    this.isMetroPlaying = false;
    if (this.metroTimerId !== null) {
      window.clearInterval(this.metroTimerId);
      this.metroTimerId = null;
    }
  }

  playMetronomePreviewTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.scheduleMetronomeTick(ctx.currentTime + 0.01, true);
  }
}

export const soundEngine = new TypingSoundEngine();
