/**
 * SatwaKu AR - Modul Audio & Efek Suara
 * Menggunakan File Audio Asli (MP3) yang digenerate & Web Audio API untuk efek suara interaktif.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.currentAudio = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // ── Suara Tombol Pop / Bubble (Klik) ───────────────────────────────────
  playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // ── Suara Sukses Deteksi Marker AR (Fanfare Chime) ─────────────────────
  playDiscoveryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + (idx * 0.09);
      const duration = 0.22;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    });
  }

  // ── Pemutar Suara Khas Hewan Asli (Audio File MP3 dari assets/audio/animals/) ──
  playAnimalRoar(animalId, soundSrc) {
    if (this.isMuted) return;
    this.initContext();

    if (soundSrc) {
      const audio = new Audio(soundSrc);
      audio.play().catch(e => console.warn("Animal sound play prevented:", e));
      return;
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (animalId) {
      // 🐱 Kucing: Meong lembut
      case "animal_01": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.45);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.45);
        break;
      }

      // 🐶 Anjing: Guk-guk
      case "animal_02": {
        [0, 0.16].forEach((d) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + d;
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

          gain.gain.setValueAtTime(0.28, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(t); osc.stop(t + 0.12);
        });
        break;
      }

      // 🐰 Kelinci: Boing imut
      case "animal_03": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.3);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.3);
        break;
      }

      // 🐄 Sapi: Mooo
      case "animal_04": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.25);
        osc.frequency.linearRampToValueAtTime(130, now + 0.65);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.7);
        break;
      }

      // 🐔 Ayam: Kukuruyuk
      case "animal_05": {
        [0, 0.08, 0.18, 0.32].forEach((delay, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + delay;
          osc.type = "sawtooth";
          const freq = idx === 3 ? 650 : (400 + idx * 80);
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + (idx === 3 ? 0.35 : 0.09));
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(t); osc.stop(t + (idx === 3 ? 0.35 : 0.09));
        });
        break;
      }

      // 🐐 Kambing: Mbeeek
      case "animal_06": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(290, now + 0.2);
        osc.frequency.linearRampToValueAtTime(240, now + 0.5);

        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.55);
        break;
      }

      // 🦆 Bebek: Kwek-kwek
      case "animal_07": {
        [0, 0.16].forEach((d) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + d;
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(450, t);
          osc.frequency.linearRampToValueAtTime(320, t + 0.12);

          gain.gain.setValueAtTime(0.26, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(t); osc.stop(t + 0.12);
        });
        break;
      }

      // 🐘 Gajah: Terompet belalai
      case "animal_08": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(560, now + 0.2);
        osc.frequency.linearRampToValueAtTime(450, now + 0.5);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.55);
        break;
      }

      // 🦁 Singa & 🐯 Harimau: Raungan menggelegar
      case "animal_09":
      case "animal_11": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.7);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.75);
        break;
      }

      // 🦒 Jerapah: Nada savana hangat
      case "animal_10": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(340, now + 0.25);
        osc.frequency.linearRampToValueAtTime(220, now + 0.5);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.55);
        break;
      }

      // 🐒 Monyet: U-u-a-a
      case "animal_12": {
        [0, 0.12, 0.24, 0.36].forEach((delay, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + delay;
          osc.type = "sine";
          osc.frequency.setValueAtTime(idx % 2 === 0 ? 550 : 850, t);
          osc.frequency.exponentialRampToValueAtTime(idx % 2 === 0 ? 750 : 600, t + 0.08);

          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(t); osc.stop(t + 0.08);
        });
        break;
      }

      default: {
        this.playPop();
        break;
      }
    }
  }

  // ── Pemutar File Audio Narasi Satwa (Audio Voice-Over MP3) ──────────────
  playNarrationAudio(audioSrc, onEndCallback) {
    this.stopNarrationAudio();

    if (!audioSrc) {
      if (onEndCallback) onEndCallback();
      return;
    }

    const audio = new Audio(audioSrc);
    this.currentAudio = audio;

    audio.onended = () => {
      this.currentAudio = null;
      if (onEndCallback) onEndCallback();
    };

    audio.onerror = (err) => {
      console.warn("Gagal memutar audio narration:", err);
      this.currentAudio = null;
      if (onEndCallback) onEndCallback();
    };

    audio.play().catch(e => {
      console.warn("Audio play prevented:", e);
      this.currentAudio = null;
      if (onEndCallback) onEndCallback();
    });
  }

  stopNarrationAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

// Global instance
const soundMgr = new SoundManager();
