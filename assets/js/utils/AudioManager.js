export class AudioManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;
    this.muted = false;
  }

  play(name, type = 'sfx') {
    if (this.muted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    switch (name) {
      case 'click': this._playClick(); break;
      case 'type': this._playTick(); break;
      case 'unlock': this._playUnlock(); break;
      case 'boot': this._playBoot(); break;
    }
  }

  _playClick() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  _playTick() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.frequency.value = 400;
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.02);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.02);
  }

  _playUnlock() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start();
    osc.stop(now + 0.2);
  }

  _playBoot() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.5);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start();
    osc.stop(now + 0.5);
  }

  setVolume(vol) {
    this.masterGain.gain.value = vol;
  }
}

export const audioManager = new AudioManager();
