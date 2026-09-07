/**
 * Synthesizes authentic NYC Subway chime using Web Audio API
 */
class SubwaySoundEffects {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (enabled && !this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Iconic NYC Subway 2-tone door/arrival chime (F4 -> C4 or D5 -> A4)
   */
  public playSubwayChime() {
    if (!this.soundEnabled) return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1: Higher tone (587.33 Hz - D5)
      this.playTone(587.33, now, 0.4, 0.15);

      // Note 2: Lower tone (440 Hz - A4)
      this.playTone(440.0, now + 0.35, 0.55, 0.18);
    } catch (e) {
      console.warn('Could not play subway chime:', e);
    }
  }

  private playTone(freq: number, startTime: number, duration: number, peakVol: number) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Warm envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakVol, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const soundEffects = new SubwaySoundEffects();
