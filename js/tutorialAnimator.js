/**
 * Shogi Web - Animated Tutorial Theater Engine
 * Renders high-quality scripted piece animations on a crafted 5x5 Kaya wood board
 * with Komadai stand, 3D promotion flips, knight leap arcs, captures, drops,
 * and secret rule demonstrations in English, Japanese, and Russian.
 */

export class TutorialAnimator {
  constructor(containerId, audio = null) {
    this.containerId = containerId;
    this.audio = audio;
    this.steps = [];
    this.stepIndex = 0;
    this.timer = null;
    this.isPlaying = false;
    this.lang = 'en';
    this.speedMultiplier = 1.0;
    this.currentBanner = '';
    this.currentBannerType = 'info';
  }

  setLanguage(lang) {
    this.lang = lang || 'en';
    if (this.steps.length > 0) {
      this.renderStep(this.stepIndex, false);
    }
  }

  loadLessonAnimation(animConfig, lang = 'en') {
    this.stop();
    this.lang = lang;
    this.steps = (animConfig && animConfig.steps) ? animConfig.steps : [];
    this.stepIndex = 0;
    this.buildDOM(animConfig);
    if (this.steps.length > 0) {
      this.renderStep(0, false);
      this.play();
    }
  }

  buildDOM(animConfig) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const showPromoZone = animConfig && animConfig.showPromoZone;
    const promoLabel = this.lang === 'ja' ? '敵陣 (成りゾーン)' : (this.lang === 'ru' ? 'Зона превращения' : 'Promotion Zone');
    const komadaiLabel = this.lang === 'ja' ? '駒台 (持ち駒)' : (this.lang === 'ru' ? 'Комадай (Запас)' : 'Komadai (Hand)');

    let cellsHtml = '';
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const promoCls = (showPromoZone && y <= 1) ? ' promo-zone' : '';
        cellsHtml += `<div class="anim-cell${promoCls}" data-x="${x}" data-y="${y}"></div>`;
      }
    }

    container.innerHTML = `
      <div class="anim-theater-wrapper">
        ${showPromoZone ? `<div class="anim-zone-tag">✨ ${promoLabel}</div>` : ''}
        <div class="anim-board-frame">
          <div class="anim-board-grid">
            ${cellsHtml}
            <div id="anim-highlights-layer" class="anim-highlights-layer"></div>
            <div id="anim-pieces-layer" class="anim-pieces-layer"></div>
          </div>
        </div>

        <div class="anim-komadai-bar">
          <span class="anim-komadai-title">${komadaiLabel}:</span>
          <div id="anim-komadai-slots" class="anim-komadai-slots"></div>
        </div>

        <div id="anim-callout-banner" class="anim-callout-banner info"></div>

        <div class="anim-controls-bar">
          <button type="button" id="anim-replay-btn" class="btn btn-secondary btn-xs">↺ ${this.lang === 'ja' ? '最初から' : (this.lang === 'ru' ? 'Сначала' : 'Replay')}</button>
          <button type="button" id="anim-playpause-btn" class="btn btn-primary btn-xs">⏸ ${this.lang === 'ja' ? '一時停止' : (this.lang === 'ru' ? 'Пауза' : 'Pause')}</button>
          <button type="button" id="anim-nextstep-btn" class="btn btn-secondary btn-xs">⏭ ${this.lang === 'ja' ? '次のコマ' : (this.lang === 'ru' ? 'Шаг' : 'Step')}</button>
          <span id="anim-step-dots" class="anim-step-dots"></span>
        </div>
      </div>
    `;

    document.getElementById('anim-replay-btn')?.addEventListener('click', () => this.replay());
    document.getElementById('anim-playpause-btn')?.addEventListener('click', () => this.togglePlay());
    document.getElementById('anim-nextstep-btn')?.addEventListener('click', () => {
      this.pause();
      const next = (this.stepIndex + 1) % this.steps.length;
      this.stepIndex = next;
      this.renderStep(next, true);
    });
  }

  play() {
    if (this.steps.length <= 1) return;
    this.isPlaying = true;
    this.updatePlayButton();
    this.scheduleNext();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updatePlayButton();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  replay() {
    this.pause();
    this.stepIndex = 0;
    this.renderStep(0, false);
    this.play();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  updatePlayButton() {
    const btn = document.getElementById('anim-playpause-btn');
    if (!btn) return;
    if (this.isPlaying) {
      btn.textContent = `⏸ ${this.lang === 'ja' ? '一時停止' : (this.lang === 'ru' ? 'Пауза' : 'Pause')}`;
    } else {
      btn.textContent = `▶ ${this.lang === 'ja' ? '再生' : (this.lang === 'ru' ? 'Играть' : 'Play')}`;
    }
  }

  scheduleNext() {
    if (!this.isPlaying || this.steps.length === 0) return;
    const step = this.steps[this.stepIndex];
    const duration = (step && step.duration ? step.duration : 1700) / this.speedMultiplier;

    this.timer = setTimeout(() => {
      if (!this.isPlaying) return;
      this.stepIndex = (this.stepIndex + 1) % this.steps.length;
      this.renderStep(this.stepIndex, this.stepIndex !== 0);
      this.scheduleNext();
    }, duration);
  }

  renderStep(idx, playSound = false) {
    const step = this.steps[idx];
    if (!step) return;

    const piecesLayer = document.getElementById('anim-pieces-layer');
    const highlightsLayer = document.getElementById('anim-highlights-layer');
    const komadaiSlots = document.getElementById('anim-komadai-slots');
    const banner = document.getElementById('anim-callout-banner');
    const dotsEl = document.getElementById('anim-step-dots');

    if (!piecesLayer || !highlightsLayer) return;

    // 1. Update Step Dots
    if (dotsEl) {
      dotsEl.innerHTML = this.steps.map((_, i) => `<span class="anim-dot ${i === idx ? 'active' : ''}"></span>`).join('');
    }

    // 2. Render Square Highlights (dots, trails, legal/forbidden rings, drops)
    highlightsLayer.innerHTML = '';
    (step.highlights || []).forEach(hl => {
      const el = document.createElement('div');
      el.className = `anim-hl hl-${hl.type || 'dot'}`;
      el.style.left = `${hl.x * 20}%`;
      el.style.top = `${hl.y * 20}%`;
      if (hl.label) el.textContent = hl.label;
      highlightsLayer.appendChild(el);
    });

    // 3. Reconcile Pieces smoothly by piece ID so CSS transitions glide them across cells!
    const activeIds = new Set((step.pieces || []).map(p => p.id));
    Array.from(piecesLayer.children).forEach(child => {
      if (!activeIds.has(child.dataset.pid)) {
        child.remove();
      }
    });

    (step.pieces || []).forEach(p => {
      let pieceEl = piecesLayer.querySelector(`[data-pid="${p.id}"]`);
      const isNew = !pieceEl;
      if (!pieceEl) {
        pieceEl = document.createElement('div');
        pieceEl.dataset.pid = p.id;
        pieceEl.innerHTML = `<span class="anim-koma-text"></span>`;
        piecesLayer.appendChild(pieceEl);
      }

      const clsList = ['anim-koma'];
      if (p.owner === 'gote') clsList.push('gote');
      if (p.promoted) clsList.push('promoted');
      if (p.jump) clsList.push('jumping');
      if (p.flip) clsList.push('flipping');
      if (p.dropIn) clsList.push('dropping');
      if (p.glow) clsList.push('glowing');
      if (p.foul) clsList.push('foul-shake');
      pieceEl.className = clsList.join(' ');

      const textSpan = pieceEl.querySelector('.anim-koma-text');
      if (textSpan) textSpan.textContent = p.kanji;

      // Snap initial position if newly added on step 0, else transition smoothly
      if (isNew && idx === 0) {
        pieceEl.style.transition = 'none';
      } else {
        pieceEl.style.transition = '';
      }

      pieceEl.style.left = `${p.x * 20 + 10}%`;
      pieceEl.style.top = `${p.y * 20 + 10}%`;

      if (isNew && idx === 0) {
        // Force reflow so subsequent steps animate smoothly
        void pieceEl.offsetWidth;
        pieceEl.style.transition = '';
      }
    });

    // 4. Update Komadai Hand Tray
    if (komadaiSlots) {
      const hand = step.hand || [];
      if (hand.length === 0) {
        const emptyTxt = this.lang === 'ja' ? 'なし' : (this.lang === 'ru' ? 'Пусто' : 'Empty');
        komadaiSlots.innerHTML = `<span class="anim-hand-empty">${emptyTxt}</span>`;
      } else {
        komadaiSlots.innerHTML = hand.map(h =>
          `<div class="anim-hand-koma ${h.active ? 'active' : ''}"><span>${h.kanji}</span></div>`
        ).join('');
      }
    }

    // 5. Update Callout Narration Banner
    if (banner) {
      const msg = step[`caption_${this.lang}`] || step.caption_en || '';
      banner.textContent = msg;
      banner.className = `anim-callout-banner ${step.bannerType || 'info'}`;
    }

    // 6. Optional subtle SFX
    if (playSound && this.audio && !this.audio.isMuted() && step.sfx) {
      try {
        if (step.sfx === 'move') this.audio.playPieceClack();
        else if (step.sfx === 'capture') this.audio.playCapture();
        else if (step.sfx === 'promo') this.audio.playPromotion();
        else if (step.sfx === 'check') this.audio.playCheck();
      } catch (e) {}
    }
  }
}
