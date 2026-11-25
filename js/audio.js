/**
 * Shogi Web - Procedural Sound Effects & Traditional Japanese BGM Synthesizer
 * Uses Web Audio API for authentic wooden piece clack and traditional Koto & Shakuhachi melodies.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    let muted = false;
    let bgmMuted = false;
    let bgmVolume = 0.4;

    try {
      muted = localStorage.getItem('shogi_muted') === 'true';
      bgmMuted = localStorage.getItem('shogi_bgm_muted') === 'true';
      const storedVol = localStorage.getItem('shogi_bgm_volume');
      if (storedVol !== null) bgmVolume = parseFloat(storedVol);
    } catch (e) {}

    this.muted = muted;
    this.bgmMuted = bgmMuted;
    this.bgmVolume = bgmVolume;

    this.bgmTimer = null;
    this.isBgmPlaying = false;
    this.bgmGainNode = null;

    // 4 Selectable Traditional & Atmospheric Songs
    this.songs = [
      { id: 'sakura_spring', nameEn: 'Sakura Breeze (桜風)', nameJa: '桜風 (Sakura)', nameRu: 'Ветер сакуры (桜風)' },
      { id: 'koto_zen', nameEn: 'Moonlit Kaya Garden (月夜)', nameJa: '月夜の榧庭 (Koto)', nameRu: 'Лунный сад (月夜)' },
      { id: 'samurai_duel', nameEn: "Shogun's Battle (将軍の陣)", nameJa: '将軍の陣 (Taiko)', nameRu: 'Битва сёгуна (将軍の陣)' },
      { id: 'misty_temple', nameEn: 'Misty Kyoto Temple (古寺)', nameJa: '霧の古寺 (Temple)', nameRu: 'Храм в тумане (古寺)' }
    ];

    let savedSong = 'sakura_spring';
    try {
      savedSong = localStorage.getItem('shogi_bgm_song') || 'sakura_spring';
    } catch (e) {}
    this.currentSongId = this.songs.some(s => s.id === savedSong) ? savedSong : 'sakura_spring';

    // Song 1: Sakura Miyako-bushi Pentatonic (E4, F4, A4, B4, C5, E5, F5, A5)
    this.sakuraFrequencies = [
      329.63, 349.23, 440.00, 493.88, 523.25, 659.25, 698.46, 880.00
    ];
    this.sakuraPhrases = [
      [2, 2, 3, 2, 2, 3],
      [2, 3, 4, 3, 2, 3, 2, 1],
      [0, 1, 2, 1, 0],
      [2, 3, 4, 5, 4, 3, 2],
      [1, 0, 1, 2, 0]
    ];

    // Song 2: Traditional Hirajōshi (平調子) Koto Pentatonic Scale
    this.hirajoshiFrequencies = [
      146.83, 164.81, 174.61, 220.00, 233.08,
      293.66, 329.63, 349.23, 440.00, 466.16,
      587.33, 659.25, 698.46
    ];
    this.phrases = [
      [5, 7, 8, 5],
      [8, 9, 10, 8, 7],
      [3, 5, 7, 5, 3],
      [7, 8, 7, 5, 2],
      [10, 9, 8, 7, 5],
      [5, 8, 10, 12, 10, 8],
      [2, 3, 5, 7, 5],
      [8, 7, 5, 3, 0]
    ];

    // Song 3: Yo-scale Battle Motif (D4, E4, G4, A4, B4, D5, E5, G5)
    this.battleFrequencies = [
      293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99
    ];
    this.battlePhrases = [
      [0, 2, 3, 5, 3, 2],
      [3, 5, 7, 5, 3, 2, 0],
      [2, 3, 4, 3, 2, 0],
      [5, 3, 2, 0, 2, 3]
    ];

    // Song 4: Misty Temple In-sen meditative bells (C4, Db4, F4, G4, Bb4, C5, F5)
    this.templeFrequencies = [
      261.63, 277.18, 349.23, 392.00, 466.16, 523.25, 698.46
    ];
    this.templePhrases = [
      [0, 3, 5],
      [2, 4, 6],
      [1, 3, 2, 0],
      [5, 4, 3, 0]
    ];

    this.currentPhraseIdx = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('shogi_muted', this.muted);
    } catch (e) {}
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // --- Background Music (BGM) Controls ---

  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
      this.bgmMuted = true;
    } else {
      this.bgmMuted = false;
      this.startBgm();
    }
    try {
      localStorage.setItem('shogi_bgm_muted', this.bgmMuted);
    } catch (e) {}
    return this.isBgmPlaying;
  }

  setBgmVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('shogi_bgm_volume', this.bgmVolume);
    } catch (e) {}
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.35, this.ctx.currentTime);
    }
  }

  startBgm() {
    if (this.bgmMuted) return;
    this.init();
    if (!this.ctx || this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    if (!this.bgmGainNode) {
      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.35, this.ctx.currentTime);
      this.bgmGainNode.connect(this.ctx.destination);
    }

    this.scheduleNextBgmPhrase();
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // Procedural Koto Pluck Synthesizer
  playKotoString(freq, delay = 0, duration = 1.4) {
    if (!this.ctx || !this.isBgmPlaying) return;

    const t = this.ctx.currentTime + delay;

    // Dual oscillator modeling acoustic Koto string harmonics
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Body resonant filter (Paulownia wood Koto chamber)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(350, t + duration);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t); // 1st overtone

    // Pluck attack & natural decay
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGainNode);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Shakuhachi Flute Breath Tone Drone
  playShakuhachiNote(freq, delay = 0, duration = 3.5) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Gentle natural vibrato
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(4.8, t); // 4.8 Hz gentle vibrato
    vibratoGain.gain.setValueAtTime(freq * 0.015, t);

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Soft breath fade in and long fade out
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);

    vibrato.start(t);
    osc.start(t);
    vibrato.stop(t + duration);
    osc.stop(t + duration);
  }

  getSongList() {
    return this.songs;
  }

  getCurrentSong() {
    return this.songs.find(s => s.id === this.currentSongId) || this.songs[0];
  }

  setSong(songId) {
    if (!this.songs.some(s => s.id === songId)) return;
    this.currentSongId = songId;
    this.currentPhraseIdx = 0;
    try {
      localStorage.setItem('shogi_bgm_song', songId);
    } catch (e) {}
    if (this.isBgmPlaying) {
      this.stopBgm();
      this.startBgm();
    }
  }

  nextSong() {
    const idx = this.songs.findIndex(s => s.id === this.currentSongId);
    const next = this.songs[(idx + 1) % this.songs.length];
    this.setSong(next.id);
    return next;
  }

  // Deep Taiko Drum Hit
  playTaikoDrum(delay = 0, intensity = 0.55) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.35);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(intensity, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);
    osc.start(t);
    osc.stop(t + 0.56);
  }

  // Temple Singing Bell / Furin Chime
  playTempleBell(freq, delay = 0, duration = 4.2) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    [1, 2.756, 5.4].forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, t);

      const amp = i === 0 ? 0.28 : (i === 1 ? 0.1 : 0.04);
      const dec = duration / (i + 1);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(amp, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dec);

      osc.connect(gain);
      gain.connect(this.bgmGainNode);
      osc.start(t);
      osc.stop(t + dec + 0.05);
    });
  }

  // Crisp Shamisen Pluck
  playShamisenPluck(freq, delay = 0, duration = 0.55) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(420, t + duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGainNode);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  // Sequence melodies for the active song
  scheduleNextBgmPhrase() {
    if (!this.isBgmPlaying) return;

    let timeOffset = 0;
    let restDelay = 2.5;

    if (this.currentSongId === 'sakura_spring') {
      const phrase = this.sakuraPhrases[this.currentPhraseIdx % this.sakuraPhrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.sakuraFrequencies[noteIdx];
        const spacing = (i === phrase.length - 1) ? 0.95 : 0.48;
        this.playKotoString(freq, timeOffset, 1.9);
        if (i % 3 === 0) {
          this.playKotoString(freq * 0.5, timeOffset + 0.04, 2.4);
        }
        timeOffset += spacing;
      });
      this.playShakuhachiNote(this.sakuraFrequencies[phrase[0]] * 0.5, 0.15, 3.6);
      restDelay = 1.6 + Math.random() * 1.1;
    } else if (this.currentSongId === 'samurai_duel') {
      const phrase = this.battlePhrases[this.currentPhraseIdx % this.battlePhrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.battleFrequencies[noteIdx];
        this.playShamisenPluck(freq, timeOffset, 0.55);
        if (i % 2 === 0) {
          this.playTaikoDrum(timeOffset, i === 0 ? 0.65 : 0.35);
        }
        timeOffset += 0.32;
      });
      if (this.currentPhraseIdx % 2 === 0) {
        this.playShakuhachiNote(this.battleFrequencies[phrase[0]] * 0.5, 0.1, 2.2);
      }
      restDelay = 0.8 + Math.random() * 0.6;
    } else if (this.currentSongId === 'misty_temple') {
      const phrase = this.templePhrases[this.currentPhraseIdx % this.templePhrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.templeFrequencies[noteIdx];
        this.playTempleBell(freq, timeOffset, 4.0);
        timeOffset += 1.05;
      });
      this.playShakuhachiNote(this.templeFrequencies[phrase[0]] * 0.5, 0.4, 4.5);
      restDelay = 2.4 + Math.random() * 1.4;
    } else {
      // Default: koto_zen (Moonlit Kaya Garden)
      const phrase = this.phrases[this.currentPhraseIdx % this.phrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.hirajoshiFrequencies[noteIdx];
        const spacing = 0.45 + (i % 2 === 0 ? 0.15 : 0.0);
        this.playKotoString(freq, timeOffset, 1.6);
        timeOffset += spacing;
      });
      if (Math.random() < 0.65) {
        const fluteFreq = this.hirajoshiFrequencies[phrase[0]] * 0.5;
        this.playShakuhachiNote(fluteFreq, 0.2, 3.5);
      }
      restDelay = 2.2 + Math.random() * 1.6;
    }

    const nextDelay = (timeOffset + restDelay) * 1000;
    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBgmPhrase();
    }, nextDelay);
  }

  // --- Sound Effects (SFX) ---

  // Realistic Japanese wooden piece "Pachi!" clack
  playPieceClack() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.07);

    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);

    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Heavier wooden capture snap
  playCapture() {
    if (this.muted) return;
    this.playPieceClack();
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.02;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playDrop() {
    this.playPieceClack();
  }

  playPromotion() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [659.25, 880.0, 1174.66];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  playCheck() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(740, t + 0.09);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const melody = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    melody.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }
}
