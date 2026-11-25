/**
 * SatwaKu AR - Modul Efek Suara (Audio Effects & Kids TTS Engine)
 * Menggunakan Web Audio API (Synthesizer ringan murni tanpa library eksternal)
 * & Web Speech API dengan tuning suara ceria anak-anak (Kids cartoon pitch).
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  // Inisialisasi AudioContext setelah interaksi pengguna (user gesture)
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
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
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // ── Suara Whoosh / Transisi Halus ──────────────────────────────────────
  playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // ── Suara Sukses Menemukan Kartu Satwa (Chime / Tada Fanfare) ───────────
  playDiscoveryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Ceria)
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + (idx * 0.09);
      const duration = 0.22;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });
  }

  // ── Synthesizer Suara Khas Hewan (Procedural Animal SFX) ───────────────
  playAnimalRoar(animalId) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (animalId) {
      // 🐘 Gajah: Suara terompet naik-turun tinggi
      case "animal_01": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(560, now + 0.2);
        osc.frequency.linearRampToValueAtTime(450, now + 0.5);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      // 🦁 Singa & 🐯 Macan: Raungan rendah bergetar (Roar)
      case "animal_03":
      case "animal_04": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.7);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
        break;
      }

      // 🐦 Burung: Kicauan melodi nada tinggi berulang (Chirp)
      case "animal_10": {
        [0, 0.12, 0.24].forEach((delay) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + delay;
          osc.type = "sine";
          osc.frequency.setValueAtTime(1800, t);
          osc.frequency.exponentialRampToValueAtTime(2600, t + 0.08);

          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.08);
        });
        break;
      }

      // 🐍 Ular: Desisan hiss
      case "animal_09": {
        // Buffer white noise sederhana untuk desis ular
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 3500;
        filter.Q.value = 3;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        break;
      }

      // 🐬 Lumba-lumba / 🐟 Ikan: Suara sonar klik ceria di air
      case "animal_11":
      case "animal_12": {
        [0, 0.08, 0.16, 0.24].forEach((delay, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + delay;
          osc.type = "sine";
          osc.frequency.setValueAtTime(1200 + (idx * 200), t);
          osc.frequency.exponentialRampToValueAtTime(1800 + (idx * 150), t + 0.05);

          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.05);
        });
        break;
      }

      // Default (Badak, Zebra, Kapibara, Kura-kura, Kadal): Nada ceria ramah
      default: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(420, now + 0.15);
        osc.frequency.linearRampToValueAtTime(310, now + 0.35);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }

  // ── Engine Text To Speech Ramah Anak (Kids Playful Pitch) ───────────────
  speakForKids(text, onEndCallback) {
    if (!window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";

    // Tuning nada agar terdengar riang, cempreng & ramah seperti kartun
    utterance.pitch = 1.35; // Pitch dinaikkan dari 1.0 (lebih imut & ekspresif)
    utterance.rate = 1.05;  // Kecepatan ceria & bersemangat

    // Cari suara bahasa Indonesia terbaik jika tersedia
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes("id") || v.lang.includes("ID"));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn("Speech error:", e);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  stopSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

// Global instance SoundManager
const soundMgr = new SoundManager();
