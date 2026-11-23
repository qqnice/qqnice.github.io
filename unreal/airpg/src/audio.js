/**
 * audio.js — 零依賴 Web Audio API 復古 8-bit 音效合成器
 */

class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lastStepTime = 0;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, duration = 0.08, type = 'square', volume = 0.07, slideTo = null) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playStep() {
    const now = performance.now();
    if (now - this.lastStepTime < 210) return;
    this.lastStepTime = now;
    const pitch = 130 + Math.random() * 25;
    this.playTone(pitch, 0.04, 'triangle', 0.045, 85);
  }

  playBlip(pitch = 520) {
    this.playTone(pitch + (Math.random() * 40 - 20), 0.032, 'square', 0.035);
  }

  playConfirm() {
    this.playTone(587.33, 0.07, 'square', 0.06);
    setTimeout(() => this.playTone(880, 0.11, 'square', 0.06), 65);
  }

  playCancel() {
    this.playTone(392, 0.07, 'square', 0.055);
    setTimeout(() => this.playTone(261.63, 0.1, 'square', 0.055), 65);
  }

  playOpenModal() {
    this.playTone(440, 0.06, 'triangle', 0.06, 660);
  }

  playBlocked() {
    this.playTone(150, 0.09, 'sawtooth', 0.045, 95);
  }
}

export const audio = new RetroAudio();
