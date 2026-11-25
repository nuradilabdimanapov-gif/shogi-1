/**
 * Shogi Web - Main Application Coordinator
 * Enhanced with Multi-Language Support, Japanese BGM Synthesizer, Account & ELO Rating System.
 */

import { SENTE, GOTE } from './engine/constants.js';
import { ShogiGame } from './engine/shogi.js';
import { ShogiAI } from './engine/ai.js';
import { ShogiUI } from './ui.js';
import { AudioManager } from './audio.js';
import { TSUMESHOGI_PUZZLES } from './engine/puzzles.js';
import { TUTORIAL_LESSONS } from './engine/tutorial.js';
import { AccountManager } from './accounts.js';
import { getLanguage, setLanguage, t, updatePageText } from './i18n.js';

class ShogiApp {
  constructor() {
    this.game = new ShogiGame();
    this.audio = new AudioManager();
    this.ai = new ShogiAI('tactician');
    this.accountManager = new AccountManager();

    this.mode = 'ai'; // 'ai', 'pvp', 'puzzle', 'tutorial'
    this.humanPlayer = SENTE; // In vs AI mode: player is SENTE or GOTE
    this.isAiThinking = false;

    // Clocks
    this.timerEnabled = false;
    this.timeRemaining = { [SENTE]: 600, [GOTE]: 600 };
    this.timerInterval = null;

    // Puzzles
    this.currentPuzzleIdx = 0;
    this.puzzleStep = 0;

    // Tutorial
    this.currentLessonIdx = 0;

    // View & Match Setup State
    this.currentView = 'landing'; // 'landing' or 'game'
    this.selectedBotDifficulty = 'tactician';
    this.replayPlyIndex = null;
    this.matchmakingTimer = null;
    this.randomOpponentInfo = null;

    this.ui = new ShogiUI(this.game, this.audio, this.handleUserMove.bind(this));
    this.ui.onHistoryClick = (idx) => this.goToReplayPly(idx);
    this.ui.onExitReplay = () => this.resumeLiveGame();

    this.bindEvents();
    this.initThemeAndStyles();
    this.initAccountsUI();
    this.initOnboardingGate();
    this.updateUserDisplay();
    this.startNewGame();

    // Check URL parameters for direct room or mode
    let startOnLanding = true;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('room') || urlParams.has('play') || urlParams.has('mode')) {
        startOnLanding = false;
        if (urlParams.has('room')) this.mode = 'pvp';
      }
    } catch (e) {}

    if (startOnLanding) {
      this.showLandingView();
    } else {
      this.showGameView();
    }

    // Require registration + Google sign-in for first-time visitors
    this.checkFirstTimeVisitor();

    // Language change listener
    window.addEventListener('shogi_lang_changed', () => {
      this.ui.render();
      this.updateUserDisplay();
      this.updateLandingUserDisplay();
      if (this.mode === 'puzzle') this.loadPuzzle(this.currentPuzzleIdx);
      if (this.mode === 'tutorial') this.loadLesson(this.currentLessonIdx);
    });
  }

  initThemeAndStyles() {
    let savedTheme = 'kaya';
    let savedPieceStyle = 'kanji2';
    let savedDifficulty = 'tactician';
    try {
      savedTheme = localStorage.getItem('shogi_theme') || 'kaya';
      savedPieceStyle = localStorage.getItem('shogi_piece_style') || 'kanji2';
      savedDifficulty = localStorage.getItem('shogi_ai_difficulty') || 'tactician';
    } catch (e) {}

    this.ui.setTheme(savedTheme);
    this.ui.setPieceStyle(savedPieceStyle);
    this.ai.setDifficulty(savedDifficulty);

    // Sync select elements
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = savedTheme;
    const modalThemeSelect = document.getElementById('modal-theme-select');
    if (modalThemeSelect) modalThemeSelect.value = savedTheme;

    const pieceStyleSelect = document.getElementById('piece-style-select');
    if (pieceStyleSelect) pieceStyleSelect.value = savedPieceStyle;
    const modalPieceStyleSelect = document.getElementById('modal-piece-style-select');
    if (modalPieceStyleSelect) modalPieceStyleSelect.value = savedPieceStyle;

    const difficultySelect = document.getElementById('ai-difficulty-select');
    if (difficultySelect) difficultySelect.value = savedDifficulty;

    const langSelect = document.getElementById('setting-language-select');
    if (langSelect) langSelect.value = getLanguage();

    const muteBtn = document.getElementById('mute-toggle-btn');
    if (muteBtn) {
      muteBtn.textContent = this.audio.isMuted() ? '🔇 ' + t('btnUnmute') : '🔊 ' + t('btnSound');
    }

    const bgmBtn = document.getElementById('bgm-toggle-btn');
    if (bgmBtn) {
      bgmBtn.textContent = this.audio.isBgmPlaying ? '🎵 BGM: ON' : '🎵 BGM: OFF';
    }

    updatePageText();
  }

  bindEvents() {
    // Home Nav Button
    const homeBtn = document.getElementById('home-nav-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.showLandingView());
    }

    // Mode tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetMode = e.currentTarget.dataset.mode;
        this.switchMode(targetMode);
        this.showGameView();
      });
    });

    // Landing Page Hero Buttons
    const heroStartBtn = document.getElementById('hero-start-btn');
    if (heroStartBtn) {
      heroStartBtn.addEventListener('click', () => this.openMatchSetupModal());
    }

    const heroPuzzlesBtn = document.getElementById('hero-puzzles-btn');
    if (heroPuzzlesBtn) {
      heroPuzzlesBtn.addEventListener('click', () => {
        this.switchMode('puzzle');
        this.showGameView();
      });
    }

    const heroAcademyBtn = document.getElementById('hero-academy-btn');
    if (heroAcademyBtn) {
      heroAcademyBtn.addEventListener('click', () => {
        this.switchMode('tutorial');
        this.showGameView();
      });
    }

    const heroSettingsBtn = document.getElementById('hero-settings-btn');
    if (heroSettingsBtn) {
      heroSettingsBtn.addEventListener('click', () => this.openSettingsModal());
    }

    const landingAccountBtn = document.getElementById('landing-account-btn');
    if (landingAccountBtn) {
      landingAccountBtn.addEventListener('click', () => this.openAccountModal());
    }

    // New Game button -> opens match setup modal
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.openMatchSetupModal();
      });
    }

    // Match Setup Modal Events
    const setupCloseBtn = document.getElementById('setup-close-btn');
    if (setupCloseBtn) {
      setupCloseBtn.addEventListener('click', () => this.closeMatchSetupModal());
    }

    const choiceRobotBtn = document.getElementById('choice-robot-btn');
    if (choiceRobotBtn) {
      choiceRobotBtn.addEventListener('click', () => this.setupStep1_ChooseOpponent('robot'));
    }

    const choicePersonBtn = document.getElementById('choice-person-btn');
    if (choicePersonBtn) {
      choicePersonBtn.addEventListener('click', () => this.setupStep1_ChooseOpponent('person'));
    }

    const robotBackBtn = document.getElementById('robot-back-btn');
    if (robotBackBtn) {
      robotBackBtn.addEventListener('click', () => this.setupShowStep('1'));
    }

    const personBackBtn = document.getElementById('person-back-btn');
    if (personBackBtn) {
      personBackBtn.addEventListener('click', () => this.setupShowStep('1'));
    }

    // Difficulty cards selection
    document.querySelectorAll('.difficulty-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedBotDifficulty = card.dataset.diff || 'tactician';
      });
    });

    const startRobotBtn = document.getElementById('start-robot-game-btn');
    if (startRobotBtn) {
      startRobotBtn.addEventListener('click', () => this.startRobotMatch());
    }

    const copyLinkBtn = document.getElementById('copy-room-link-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const input = document.getElementById('friend-room-link-input');
        if (input) {
          input.select();
          navigator.clipboard.writeText(input.value).then(() => {
            const successMsg = document.getElementById('copy-success-msg');
            if (successMsg) successMsg.classList.remove('hidden');
            setTimeout(() => successMsg?.classList.add('hidden'), 2500);
          }).catch(() => {
            prompt('Copy Match Link:', input.value);
          });
        }
      });
    }

    const startFriendBtn = document.getElementById('start-friend-btn');
    if (startFriendBtn) {
      startFriendBtn.addEventListener('click', () => this.startFriendMatch());
    }

    const findRandomBtn = document.getElementById('find-random-btn');
    if (findRandomBtn) {
      findRandomBtn.addEventListener('click', () => this.startRandomMatchmaking());
    }

    const cancelRadarBtn = document.getElementById('cancel-radar-btn');
    if (cancelRadarBtn) {
      cancelRadarBtn.addEventListener('click', () => this.cancelMatchmaking());
    }

    // Move History Replay Navigation Controls
    const histFirstBtn = document.getElementById('hist-first-btn');
    if (histFirstBtn) {
      histFirstBtn.addEventListener('click', () => this.goToReplayPly(0));
    }

    const histPrevBtn = document.getElementById('hist-prev-btn');
    if (histPrevBtn) {
      histPrevBtn.addEventListener('click', () => this.stepReplay(-1));
    }

    const histNextBtn = document.getElementById('hist-next-btn');
    if (histNextBtn) {
      histNextBtn.addEventListener('click', () => this.stepReplay(1));
    }

    const histLatestBtn = document.getElementById('hist-latest-btn');
    if (histLatestBtn) {
      histLatestBtn.addEventListener('click', () => this.resumeLiveGame());
    }

    // Undo button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => this.handleUndo());
    }

    // Resign button
    const resignBtn = document.getElementById('resign-btn');
    if (resignBtn) {
      resignBtn.addEventListener('click', () => {
        if (this.game.status === 'active' && confirm(t('confirmResign'))) {
          this.game.resign(this.game.turn);
          this.stopTimer();
          this.handleGameOver();
          this.ui.render();
        }
      });
    }

    // Flip Board button
    const flipBtn = document.getElementById('flip-board-btn');
    if (flipBtn) {
      flipBtn.addEventListener('click', () => this.ui.toggleFlip());
    }

    // Language toggle in header (cycles EN -> JA -> RU)
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', () => {
        const order = ['en', 'ja', 'ru'];
        const idx = order.indexOf(getLanguage());
        const nextLang = order[(idx + 1) % order.length];
        setLanguage(nextLang);
        const modalSelect = document.getElementById('setting-language-select');
        if (modalSelect) modalSelect.value = nextLang;
      });
    }

    // Japanese BGM Toggle in Header
    const bgmToggleBtn = document.getElementById('bgm-toggle-btn');
    if (bgmToggleBtn) {
      bgmToggleBtn.addEventListener('click', () => {
        const playing = this.audio.toggleBgm();
        bgmToggleBtn.textContent = playing ? '🎵 BGM: ON' : '🎵 BGM: OFF';
        this.updateBgmModalState();
      });
    }

    // Sound effects toggle
    const muteBtn = document.getElementById('mute-toggle-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        muteBtn.textContent = isMuted ? '🔇 ' + t('btnUnmute') : '🔊 ' + t('btnSound');
        const modalSfx = document.getElementById('modal-sfx-toggle-btn');
        if (modalSfx) modalSfx.textContent = isMuted ? '🔇 SFX Muted' : '🔊 SFX Enabled';
      });
    }

    // Settings Modal
    const settingsBtn = document.getElementById('settings-open-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettingsModal());
    }

    const settingsCloseBtn = document.getElementById('settings-close-btn');
    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener('click', () => this.closeSettingsModal());
    }

    const settingsDoneBtn = document.getElementById('settings-done-btn');
    if (settingsDoneBtn) {
      settingsDoneBtn.addEventListener('click', () => this.closeSettingsModal());
    }

    const modalBgmBtn = document.getElementById('modal-bgm-toggle-btn');
    if (modalBgmBtn) {
      modalBgmBtn.addEventListener('click', () => {
        const playing = this.audio.toggleBgm();
        if (bgmToggleBtn) bgmToggleBtn.textContent = playing ? '🎵 BGM: ON' : '🎵 BGM: OFF';
        this.updateBgmModalState();
      });
    }

    const bgmSlider = document.getElementById('bgm-volume-slider');
    if (bgmSlider) {
      bgmSlider.value = this.audio.bgmVolume;
      bgmSlider.addEventListener('input', (e) => {
        this.audio.setBgmVolume(parseFloat(e.target.value));
      });
    }

    const modalSfxBtn = document.getElementById('modal-sfx-toggle-btn');
    if (modalSfxBtn) {
      modalSfxBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        if (muteBtn) muteBtn.textContent = isMuted ? '🔇 ' + t('btnUnmute') : '🔊 ' + t('btnSound');
        modalSfxBtn.textContent = isMuted ? '🔇 SFX Muted' : '🔊 SFX Enabled';
      });
    }

    // Modal Language Select
    const settingLangSelect = document.getElementById('setting-language-select');
    if (settingLangSelect) {
      settingLangSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }

    // Modal Theme Select
    const modalThemeSelect = document.getElementById('modal-theme-select');
    if (modalThemeSelect) {
      modalThemeSelect.addEventListener('change', (e) => {
        this.ui.setTheme(e.target.value);
        const mainThemeSelect = document.getElementById('theme-select');
        if (mainThemeSelect) mainThemeSelect.value = e.target.value;
      });
    }

    // Modal Piece Style Select
    const modalPieceStyleSelect = document.getElementById('modal-piece-style-select');
    if (modalPieceStyleSelect) {
      modalPieceStyleSelect.addEventListener('change', (e) => {
        this.ui.setPieceStyle(e.target.value);
        const mainPieceSelect = document.getElementById('piece-style-select');
        if (mainPieceSelect) mainPieceSelect.value = e.target.value;
      });
    }

    // Account Modal Buttons
    const accountBtn = document.getElementById('account-open-btn');
    if (accountBtn) {
      accountBtn.addEventListener('click', () => this.openAccountModal());
    }

    const accountCloseBtn = document.getElementById('account-close-btn');
    if (accountCloseBtn) {
      accountCloseBtn.addEventListener('click', () => this.closeAccountModal());
    }

    const accountContinueBtn = document.getElementById('account-continue-btn');
    if (accountContinueBtn) {
      accountContinueBtn.addEventListener('click', () => this.closeAccountModal());
    }

    // Sidebar Themes & Styles
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.ui.setTheme(e.target.value);
        if (modalThemeSelect) modalThemeSelect.value = e.target.value;
      });
    }

    const pieceStyleSelect = document.getElementById('piece-style-select');
    if (pieceStyleSelect) {
      pieceStyleSelect.addEventListener('change', (e) => {
        this.ui.setPieceStyle(e.target.value);
        if (modalPieceStyleSelect) modalPieceStyleSelect.value = e.target.value;
      });
    }

    const diffSelect = document.getElementById('ai-difficulty-select');
    if (diffSelect) {
      diffSelect.addEventListener('change', (e) => {
        this.ai.setDifficulty(e.target.value);
        try {
          localStorage.setItem('shogi_ai_difficulty', e.target.value);
        } catch (err) {}
      });
    }

    // Side selection (Sente vs Gote)
    document.querySelectorAll('input[name="player-side"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.humanPlayer = e.target.value === 'gote' ? GOTE : SENTE;
        this.startNewGame();
      });
    });

    // SFEN export button
    const exportBtn = document.getElementById('export-sfen-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const sfen = this.game.toSFEN();
        navigator.clipboard.writeText(sfen).then(() => {
          alert(`SFEN copied to clipboard:\n${sfen}`);
        }).catch(() => {
          prompt('Game SFEN:', sfen);
        });
      });
    }

    // Puzzle Navigation
    const prevPuzzleBtn = document.getElementById('puzzle-prev-btn');
    if (prevPuzzleBtn) {
      prevPuzzleBtn.addEventListener('click', () => this.changePuzzle(-1));
    }
    const nextPuzzleBtn = document.getElementById('puzzle-next-btn');
    if (nextPuzzleBtn) {
      nextPuzzleBtn.addEventListener('click', () => this.changePuzzle(1));
    }
    const resetPuzzleBtn = document.getElementById('puzzle-reset-btn');
    if (resetPuzzleBtn) {
      resetPuzzleBtn.addEventListener('click', () => this.loadPuzzle(this.currentPuzzleIdx));
    }

    // Tutorial Navigation
    const prevLessonBtn = document.getElementById('lesson-prev-btn');
    if (prevLessonBtn) {
      prevLessonBtn.addEventListener('click', () => this.changeLesson(-1));
    }
    const nextLessonBtn = document.getElementById('lesson-next-btn');
    if (nextLessonBtn) {
      nextLessonBtn.addEventListener('click', () => this.changeLesson(1));
    }
    const finishLessonBtn = document.getElementById('lesson-finish-btn');
    if (finishLessonBtn) {
      finishLessonBtn.addEventListener('click', () => {
        this.accountManager.markTutorialCompleted();
        this.showLandingView();
      });
    }
  }

  // --- Landing View & Game View Toggling ---
  showLandingView() {
    this.currentView = 'landing';
    document.getElementById('landing-view')?.classList.remove('hidden');
    document.getElementById('game-view')?.classList.add('hidden');
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    this.updateLandingUserDisplay();
  }

  showGameView() {
    this.currentView = 'game';
    document.getElementById('landing-view')?.classList.add('hidden');
    document.getElementById('game-view')?.classList.remove('hidden');
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.mode);
    });
  }

  getLocalizedRankTitle(rank) {
    const lang = getLanguage();
    if (lang === 'ja') return rank.titleJa;
    if (lang === 'ru') return rank.titleRu || rank.titleEn;
    return rank.titleEn;
  }

  checkFirstTimeVisitor() {
    let onboarded = false;
    try {
      onboarded = localStorage.getItem('shogi_onboarded') === 'true';
    } catch (e) {}

    if (!this.accountManager.isLoggedIn() && !onboarded) {
      const gate = document.getElementById('onboarding-gate');
      if (gate) gate.classList.remove('hidden');
    }
  }

  initOnboardingGate() {
    const gate = document.getElementById('onboarding-gate');
    const googleModal = document.getElementById('google-signin-modal');
    const googleBtn = document.getElementById('onboard-google-btn');
    const googleCloseBtn = document.getElementById('google-modal-close-btn');
    const googleForm = document.getElementById('google-profile-form');
    const localForm = document.getElementById('onboard-local-form');
    let selectedAvatar = '将';

    // Sync active language pill
    const syncLangPills = (lang) => {
      document.querySelectorAll('.onboard-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
    };
    syncLangPills(getLanguage());

    document.querySelectorAll('.onboard-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang || 'en';
        setLanguage(lang);
        syncLangPills(lang);
        const modalSelect = document.getElementById('setting-language-select');
        if (modalSelect) modalSelect.value = lang;
      });
    });

    googleBtn?.addEventListener('click', () => {
      googleModal?.classList.add('visible');
    });

    googleCloseBtn?.addEventListener('click', () => {
      googleModal?.classList.remove('visible');
    });

    document.querySelectorAll('.avatar-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAvatar = btn.dataset.avatar || '将';
      });
    });

    const completeRegistrationAndStartTutorial = () => {
      try {
        localStorage.setItem('shogi_onboarded', 'true');
      } catch (e) {}
      googleModal?.classList.remove('visible');
      gate?.classList.add('hidden');
      this.updateUserDisplay();
      this.updateLandingUserDisplay();
      // Launch interactive tutorial in chosen language
      this.currentLessonIdx = 0;
      this.switchMode('tutorial');
      this.showGameView();
    };

    googleForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('google-email-input')?.value || '';
      const name = document.getElementById('google-name-input')?.value || '';
      const errEl = document.getElementById('google-error-msg');
      const res = this.accountManager.loginWithGoogle({ email, name, avatar: selectedAvatar });
      if (res.success) {
        if (errEl) errEl.classList.add('hidden');
        completeRegistrationAndStartTutorial();
      } else if (errEl) {
        errEl.textContent = res.error;
        errEl.classList.remove('hidden');
      }
    });

    localForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('onboard-username')?.value || '';
      const password = document.getElementById('onboard-password')?.value || '';
      const errEl = document.getElementById('onboard-error-msg');
      const res = this.accountManager.register(username, password);
      if (res.success) {
        if (errEl) errEl.classList.add('hidden');
        completeRegistrationAndStartTutorial();
      } else if (errEl) {
        errEl.textContent = res.error;
        errEl.classList.remove('hidden');
      }
    });
  }

  updateLandingUserDisplay() {
    const textEl = document.getElementById('landing-user-text');
    const user = this.accountManager.getCurrentUser();
    if (textEl) {
      if (user) {
        const rank = this.accountManager.getRank(user.rating);
        const rankTitle = this.getLocalizedRankTitle(rank);
        textEl.innerHTML = `${user.avatar || '👤'} <strong>${user.username}</strong> · ${user.rating} (${rankTitle})`;
      } else {
        textEl.textContent = t('accountRequireNotice');
      }
    }
  }

  // --- Match Setup & Opponent Choice Modal ---
  openMatchSetupModal() {
    const modal = document.getElementById('match-setup-modal');
    if (!modal) return;
    this.setupShowStep('1');
    modal.classList.add('visible');
  }

  closeMatchSetupModal() {
    const modal = document.getElementById('match-setup-modal');
    if (modal) modal.classList.remove('visible');
    if (this.matchmakingTimer) {
      clearTimeout(this.matchmakingTimer);
      this.matchmakingTimer = null;
    }
  }

  setupShowStep(stepId) {
    document.getElementById('setup-step-1')?.classList.toggle('hidden', stepId !== '1');
    document.getElementById('setup-step-robot')?.classList.toggle('hidden', stepId !== 'robot');
    document.getElementById('setup-step-person')?.classList.toggle('hidden', stepId !== 'person');
    document.getElementById('setup-step-radar')?.classList.toggle('hidden', stepId !== 'radar');
  }

  setupStep1_ChooseOpponent(type) {
    if (type === 'robot') {
      this.setupShowStep('robot');
      document.querySelectorAll('.difficulty-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.diff === this.selectedBotDifficulty);
      });
    } else if (type === 'person') {
      this.setupShowStep('person');
      const code = 'shogi-' + Math.floor(1000 + Math.random() * 9000);
      const urlInput = document.getElementById('friend-room-link-input');
      if (urlInput) {
        const baseUrl = window.location.origin + window.location.pathname;
        urlInput.value = `${baseUrl}?room=${code}`;
      }
      document.getElementById('copy-success-msg')?.classList.add('hidden');
    }
  }

  startRobotMatch() {
    this.mode = 'ai';
    this.ai.setDifficulty(this.selectedBotDifficulty);

    const sideRadio = document.querySelector('input[name="setup-player-side"]:checked');
    const sideVal = sideRadio ? sideRadio.value : 'sente';
    if (sideVal === 'random') {
      this.humanPlayer = Math.random() < 0.5 ? SENTE : GOTE;
    } else {
      this.humanPlayer = sideVal === 'gote' ? GOTE : SENTE;
    }

    this.randomOpponentInfo = null;
    this.closeMatchSetupModal();
    this.showGameView();
    this.startNewGame();
  }

  startFriendMatch() {
    this.mode = 'pvp';
    this.randomOpponentInfo = null;
    this.closeMatchSetupModal();
    this.showGameView();
    this.startNewGame();
  }

  startRandomMatchmaking() {
    this.setupShowStep('radar');
    const radarText = document.getElementById('radar-status-text');
    const radarSub = document.getElementById('radar-subtext');
    const matchCard = document.getElementById('match-found-card');
    if (radarText) radarText.textContent = t('radarSearching');
    if (radarSub) radarSub.textContent = t('radarScanning');
    if (matchCard) matchCard.classList.add('hidden');

    const randomOpponents = [
      { name: 'Kenji_81', delta: 25, title: '5-Kyu' },
      { name: 'Sora_Meijin', delta: -15, title: '6-Kyu' },
      { name: 'Ryu_Dragon', delta: 40, title: '4-Kyu' },
      { name: 'Aoi_Tactics', delta: -30, title: '6-Kyu' },
      { name: 'Yuki_Shogi', delta: 10, title: '5-Kyu' },
      { name: 'Takeshi_Dan', delta: 80, title: '2-Dan' }
    ];
    const chosen = randomOpponents[Math.floor(Math.random() * randomOpponents.length)];
    const user = this.accountManager.getCurrentUser();
    const userRating = user ? user.rating : 1200;
    const oppRating = Math.max(800, userRating + chosen.delta);

    this.randomOpponentInfo = {
      name: chosen.name,
      rating: oppRating,
      title: chosen.title
    };

    // After 2.2 seconds, announce match found!
    this.matchmakingTimer = setTimeout(() => {
      if (radarText) radarText.textContent = t('radarFound');
      if (radarSub) radarSub.textContent = '';
      if (matchCard) matchCard.classList.remove('hidden');

      const p1Name = document.getElementById('found-p1-name');
      const p1Rating = document.getElementById('found-p1-rating');
      const p2Name = document.getElementById('found-p2-name');
      const p2Rating = document.getElementById('found-p2-rating');
      if (p1Name) p1Name.textContent = user ? user.username : 'You';
      if (p1Rating) p1Rating.textContent = `${userRating} ELO`;
      if (p2Name) p2Name.textContent = chosen.name;
      if (p2Rating) p2Rating.textContent = `${oppRating} ELO (${chosen.title})`;

      this.audio.playPieceClack();

      // After 2 seconds countdown, start match!
      this.matchmakingTimer = setTimeout(() => {
        this.closeMatchSetupModal();
        this.mode = 'ai';
        if (oppRating < 1150) this.ai.setDifficulty('novice');
        else if (oppRating < 1400) this.ai.setDifficulty('apprentice');
        else if (oppRating < 1650) this.ai.setDifficulty('tactician');
        else this.ai.setDifficulty('master');

        this.humanPlayer = SENTE;
        this.showGameView();
        this.startNewGame();

        const goteName = document.getElementById('gote-player-name');
        if (goteName) goteName.textContent = `${chosen.name} (${oppRating} · ${chosen.title})`;
      }, 1900);
    }, 2200);
  }

  cancelMatchmaking() {
    if (this.matchmakingTimer) {
      clearTimeout(this.matchmakingTimer);
      this.matchmakingTimer = null;
    }
    this.setupShowStep('person');
  }

  // --- Move History Replay Navigation ---
  goToReplayPly(ply) {
    if (this.game.moveHistory.length === 0) return;
    const clamped = Math.max(0, Math.min(ply, this.game.moveHistory.length - 1));
    this.replayPlyIndex = clamped;
    const snapGame = this.game.getGameAtPly(clamped);
    this.ui.viewingGame = snapGame;
    this.ui.activePly = clamped;
    const lastM = this.game.moveHistory[clamped];
    this.ui.render(lastM);
    this.updateHistoryIndicator();
  }

  stepReplay(delta) {
    if (this.game.moveHistory.length === 0) return;
    let target = this.replayPlyIndex !== null ? this.replayPlyIndex + delta : this.game.moveHistory.length - 1 + delta;
    if (target < 0) target = 0;
    if (target >= this.game.moveHistory.length) {
      this.resumeLiveGame();
      return;
    }
    this.goToReplayPly(target);
  }

  resumeLiveGame() {
    this.replayPlyIndex = null;
    this.ui.viewingGame = null;
    this.ui.activePly = null;
    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1] || null;
    this.ui.render(lastMove);
    this.updateHistoryIndicator();
  }

  updateHistoryIndicator() {
    const el = document.getElementById('hist-step-text');
    if (!el) return;
    if (this.replayPlyIndex !== null) {
      el.textContent = `#${this.replayPlyIndex + 1} / ${this.game.moveHistory.length}`;
      el.style.color = 'var(--accent-gold)';
    } else {
      el.textContent = 'Latest';
      el.style.color = '#4ade80';
    }
  }

  // --- Settings Modal Methods ---
  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      this.updateBgmModalState();
      modal.classList.add('visible');
    }
  }

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('visible');
  }

  updateBgmModalState() {
    const btn = document.getElementById('modal-bgm-toggle-btn');
    const text = document.getElementById('bgm-status-text');
    if (btn && text) {
      if (this.audio.isBgmPlaying) {
        btn.textContent = '⏸ Pause BGM';
        text.textContent = 'Playing';
        text.style.color = '#4ade80';
      } else {
        btn.textContent = '▶ Play BGM';
        text.textContent = 'Paused';
        text.style.color = '#94a3b8';
      }
    }
  }

  // --- Account & Authentication UI ---
  initAccountsUI() {
    const registerTab = document.getElementById('tab-auth-register');
    const loginTab = document.getElementById('tab-auth-login');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authForm = document.getElementById('account-form');
    const switchAccountBtn = document.getElementById('account-switch-btn');

    let isRegisterMode = true;

    const setMode = (register) => {
      isRegisterMode = register;
      registerTab?.classList.toggle('active', register);
      loginTab?.classList.toggle('active', !register);
      if (authSubmitBtn) {
        authSubmitBtn.textContent = register ? t('accountSubmitCreate') : t('accountSubmitLogin');
      }
      const errorMsg = document.getElementById('auth-error-msg');
      if (errorMsg) errorMsg.classList.add('hidden');
    };

    registerTab?.addEventListener('click', () => setMode(true));
    loginTab?.addEventListener('click', () => setMode(false));

    authForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('auth-username');
      const passwordInput = document.getElementById('auth-password');
      const errorMsg = document.getElementById('auth-error-msg');

      const username = usernameInput?.value || '';
      const password = passwordInput?.value || '';

      const res = isRegisterMode 
        ? this.accountManager.register(username, password)
        : this.accountManager.login(username, password);

      if (res.success) {
        this.updateUserDisplay();
        this.closeAccountModal();
      } else {
        if (errorMsg) {
          errorMsg.textContent = res.error;
          errorMsg.classList.remove('hidden');
        }
      }
    });

    switchAccountBtn?.addEventListener('click', () => {
      this.accountManager.logout();
      this.updateUserDisplay();
      this.openAccountModal(false);
    });
  }

  openAccountModal(isRequiredPrompt = false) {
    const modal = document.getElementById('account-modal');
    if (!modal) return;

    const profileView = document.getElementById('account-profile-view');
    const authView = document.getElementById('account-auth-view');
    const noticeText = document.getElementById('account-notice-text');

    if (noticeText) {
      noticeText.textContent = isRequiredPrompt ? t('accountRequireNotice') : t('accountGuestPrompt');
    }

    if (this.accountManager.isLoggedIn()) {
      profileView?.classList.remove('hidden');
      authView?.classList.add('hidden');

      const user = this.accountManager.getCurrentUser();
      const rank = this.accountManager.getRank(user.rating);

      document.getElementById('profile-username').textContent = user.username;
      document.getElementById('profile-rating').textContent = user.rating;
      document.getElementById('profile-rank-badge').textContent = rank.badge;
      document.getElementById('profile-rank-title').textContent = this.getLocalizedRankTitle(rank);
      document.getElementById('profile-wins').textContent = user.wins || 0;
      document.getElementById('profile-losses').textContent = user.losses || 0;

      const total = (user.wins || 0) + (user.losses || 0) + (user.draws || 0);
      const rate = total > 0 ? Math.round(((user.wins || 0) / total) * 100) : 0;
      document.getElementById('profile-winrate').textContent = `${rate}%`;
    } else {
      profileView?.classList.add('hidden');
      authView?.classList.remove('hidden');
    }

    modal.classList.add('visible');
  }

  closeAccountModal() {
    const modal = document.getElementById('account-modal');
    if (modal) modal.classList.remove('visible');
  }

  updateUserDisplay() {
    const userLabel = document.getElementById('header-user-label');
    const sentePlayerName = document.getElementById('sente-player-name');
    const gotePlayerName = document.getElementById('gote-player-name');

    const user = this.accountManager.getCurrentUser();
    const isJa = getLanguage() === 'ja';

    if (user) {
      const rank = this.accountManager.getRank(user.rating);
      const rankTitle = this.getLocalizedRankTitle(rank);
      if (userLabel) userLabel.textContent = `${user.username} [${user.rating}]`;

      if (this.mode === 'ai') {
        if (this.humanPlayer === SENTE) {
          if (sentePlayerName) sentePlayerName.textContent = `${user.username} (${user.rating} · ${rankTitle})`;
          if (gotePlayerName) {
            gotePlayerName.textContent = this.randomOpponentInfo 
              ? `${this.randomOpponentInfo.name} [${this.randomOpponentInfo.rating} · ${this.randomOpponentInfo.title}]`
              : `${t('aiOpponent')} [${this.getAiRating()}]`;
          }
        } else {
          if (gotePlayerName) gotePlayerName.textContent = `${user.username} (${user.rating} · ${rankTitle})`;
          if (sentePlayerName) {
            sentePlayerName.textContent = this.randomOpponentInfo 
              ? `${this.randomOpponentInfo.name} [${this.randomOpponentInfo.rating} · ${this.randomOpponentInfo.title}]`
              : `${t('aiOpponent')} [${this.getAiRating()}]`;
          }
        }
      } else {
        if (sentePlayerName) sentePlayerName.textContent = `${user.username} (${user.rating})`;
        if (gotePlayerName) gotePlayerName.textContent = `Player 2`;
      }
    } else {
      if (userLabel) userLabel.textContent = t('btnSignIn');
      if (sentePlayerName) sentePlayerName.textContent = t('guestUser');
      if (gotePlayerName) gotePlayerName.textContent = this.mode === 'ai' ? t('aiOpponent') : 'Player 2';
    }
  }

  getAiRating() {
    const diff = this.ai.difficulty;
    if (diff === 'novice') return 1000;
    if (diff === 'apprentice') return 1250;
    if (diff === 'tactician') return 1500;
    if (diff === 'master') return 1750;
    return 1200;
  }

  handleGameOver() {
    if (this.mode !== 'ai' || !this.accountManager.isLoggedIn()) return;

    let outcome = null;
    if (this.game.status === 'checkmate' || this.game.status === 'resigned') {
      outcome = this.game.winner === this.humanPlayer ? 1.0 : 0.0;
    } else if (this.game.status === 'repetition_draw' || this.game.status === 'stalemate') {
      outcome = 0.5;
    }

    if (outcome !== null) {
      const result = this.accountManager.updateGameResult(outcome, this.getAiRating());
      this.updateUserDisplay();

      if (result) {
        const deltaStr = result.delta >= 0 ? `+${result.delta}` : `${result.delta}`;
        const toast = document.createElement('div');
        toast.className = 'status-alert alert-winner';
        toast.style.marginTop = '10px';
        toast.innerHTML = `⭐ <strong>Rating Update:</strong> ${deltaStr} (New Rating: <strong>${result.newRating}</strong> · ${result.rank.titleJa})`;
        document.getElementById('game-status-banner')?.appendChild(toast);
      }
    }
  }

  // --- Switch Modes ---
  switchMode(newMode) {
    this.mode = newMode;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    document.getElementById('ai-config-panel')?.classList.toggle('hidden', newMode !== 'ai');
    document.getElementById('puzzle-panel')?.classList.toggle('hidden', newMode !== 'puzzle');
    document.getElementById('tutorial-panel')?.classList.toggle('hidden', newMode !== 'tutorial');

    if (newMode === 'puzzle') {
      this.loadPuzzle(this.currentPuzzleIdx);
    } else if (newMode === 'tutorial') {
      this.loadLesson(this.currentLessonIdx);
    } else {
      this.startNewGame();
    }
  }

  startNewGame() {
    this.game.reset();
    this.isAiThinking = false;
    this.stopTimer();
    this.resumeLiveGame();

    this.timeRemaining = { [SENTE]: 600, [GOTE]: 600 };
    this.updateClockDisplays();
    this.updateUserDisplay();

    if (this.mode === 'ai') {
      this.ui.isFlipped = (this.humanPlayer === GOTE);
    } else {
      this.ui.isFlipped = false;
    }

    this.ui.clearSelection();
    this.ui.render();

    if (this.mode === 'ai' && this.humanPlayer === GOTE) {
      this.triggerAiMove();
    }
  }

  async handleUserMove(move) {
    // If Japanese BGM was initialized, attempt gentle start on user first interaction
    if (!this.audio.bgmMuted && !this.audio.isBgmPlaying) {
      this.audio.startBgm();
      const bgmBtn = document.getElementById('bgm-toggle-btn');
      if (bgmBtn) bgmBtn.textContent = '🎵 BGM: ON';
    }

    if (this.mode === 'puzzle') {
      this.handlePuzzleMove(move);
      return;
    }

    const success = this.game.makeMove(move);
    if (!success) return;

    this.ui.render(move);

    if (this.game.status !== 'active') {
      this.stopTimer();
      this.handleGameOver();
      return;
    }

    if (this.timerEnabled) {
      this.startTimer();
    }

    if (this.mode === 'ai' && this.game.turn !== this.humanPlayer) {
      await this.triggerAiMove();
    }
  }

  async triggerAiMove() {
    if (this.isAiThinking || this.game.status !== 'active') return;

    this.isAiThinking = true;
    this.setAiThinkingUI(true);

    try {
      const bestMove = await this.ai.getBestMove(this.game);
      if (bestMove && this.game.status === 'active') {
        const destPiece = !bestMove.isDrop ? this.game.getPiece(bestMove.to.x, bestMove.to.y) : null;

        if (bestMove.promote) {
          this.audio.playPromotion();
        } else if (destPiece) {
          this.audio.playCapture();
        } else if (bestMove.isDrop) {
          this.audio.playDrop();
        } else {
          this.audio.playPieceClack();
        }

        this.game.makeMove(bestMove);
        this.ui.render(bestMove);

        if (this.game.status !== 'active') {
          this.stopTimer();
          this.handleGameOver();
        }
      }
    } catch (err) {
      console.error('AI Move Error:', err);
    } finally {
      this.isAiThinking = false;
      this.setAiThinkingUI(false);
    }
  }

  setAiThinkingUI(thinking) {
    const indicator = document.getElementById('ai-thinking-indicator');
    if (indicator) {
      indicator.classList.toggle('visible', thinking);
    }
  }

  handleUndo() {
    if (this.isAiThinking) return;

    if (this.mode === 'ai') {
      if (this.game.moveHistory.length >= 2) {
        this.game.undoMove();
        this.game.undoMove();
      } else if (this.game.moveHistory.length === 1 && this.humanPlayer === SENTE) {
        this.game.undoMove();
      }
    } else {
      this.game.undoMove();
    }

    this.ui.clearSelection();
    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1] || null;
    this.ui.render(lastMove);
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.game.status !== 'active') {
        this.stopTimer();
        return;
      }
      const turn = this.game.turn;
      this.timeRemaining[turn]--;

      if (this.timeRemaining[turn] <= 0) {
        this.timeRemaining[turn] = 0;
        this.stopTimer();
        this.game.status = 'checkmate';
        this.game.winner = turn === SENTE ? GOTE : SENTE;
        this.handleGameOver();
        this.ui.render();
      }

      this.updateClockDisplays();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateClockDisplays() {
    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const senteClock = document.getElementById('sente-clock');
    if (senteClock) senteClock.textContent = formatTime(this.timeRemaining[SENTE]);

    const goteClock = document.getElementById('gote-clock');
    if (goteClock) goteClock.textContent = formatTime(this.timeRemaining[GOTE]);
  }

  // Puzzles
  loadPuzzle(idx) {
    if (idx < 0) idx = 0;
    if (idx >= TSUMESHOGI_PUZZLES.length) idx = TSUMESHOGI_PUZZLES.length - 1;

    this.currentPuzzleIdx = idx;
    this.puzzleStep = 0;
    const puzzle = TSUMESHOGI_PUZZLES[idx];

    const data = puzzle.setup();
    this.game.board = data.board;
    this.game.hands = data.hands;
    this.game.turn = data.turn;
    this.game.moveHistory = [];
    this.game.positionHistory = [];
    this.game.status = 'active';
    this.game.winner = null;
    this.game.inCheck = false;

    this.currentPuzzleData = data;
    this.currentPuzzleDef = puzzle;

    const titleEl = document.getElementById('puzzle-title');
    if (titleEl) titleEl.textContent = `${puzzle.title} (${puzzle.type})`;

    const descEl = document.getElementById('puzzle-desc');
    if (descEl) descEl.textContent = puzzle.description;

    const feedbackEl = document.getElementById('puzzle-feedback');
    if (feedbackEl) feedbackEl.innerHTML = `<span class="puzzle-hint">${t('puzzleHint')} ${puzzle.hint}</span>`;

    this.ui.isFlipped = false;
    this.ui.clearSelection();
    this.ui.render();
  }

  changePuzzle(delta) {
    this.loadPuzzle(this.currentPuzzleIdx + delta);
  }

  handlePuzzleMove(userMove) {
    const puzzle = this.currentPuzzleDef;
    const data = this.currentPuzzleData;
    const feedbackEl = document.getElementById('puzzle-feedback');

    if (data.solutions) {
      const match = data.solutions.some(sol => {
        if (sol.isDrop !== userMove.isDrop) return false;
        if (sol.isDrop) {
          return sol.pieceType === userMove.pieceType && sol.to.x === userMove.to.x && sol.to.y === userMove.to.y;
        } else {
          return sol.from.x === userMove.from.x && sol.from.y === userMove.from.y && sol.to.x === userMove.to.x && sol.to.y === userMove.to.y;
        }
      });

      if (match) {
        this.game.makeMove(userMove);
        this.ui.render(userMove);
        this.audio.playVictory();
        if (feedbackEl) {
          feedbackEl.innerHTML = `<span class="puzzle-success">${t('puzzleSuccess')}</span>`;
        }
      } else {
        if (feedbackEl) {
          feedbackEl.innerHTML = `<span class="puzzle-fail">${t('puzzleFail')}</span>`;
        }
      }
      return;
    }

    if (data.sequence) {
      const expectedStep = data.sequence[this.puzzleStep];
      if (!expectedStep || !expectedStep.move) return;

      const exp = expectedStep.move;
      const isMatch = (
        exp.isDrop === userMove.isDrop &&
        (!exp.isDrop ? (exp.from.x === userMove.from.x && exp.from.y === userMove.from.y) : (exp.pieceType === userMove.pieceType)) &&
        exp.to.x === userMove.to.x && exp.to.y === userMove.to.y
      );

      if (isMatch) {
        this.game.makeMove(userMove);
        this.ui.render(userMove);
        this.puzzleStep++;

        if (this.puzzleStep < data.sequence.length) {
          const defStep = data.sequence[this.puzzleStep];
          setTimeout(() => {
            const defMove = { ...defStep.response, isDrop: false, promote: false, pieceType: this.game.board[defStep.response.from.y][defStep.response.from.x]?.type };
            this.game.makeMove(defMove);
            this.ui.render(defMove);
            this.audio.playPieceClack();
            this.puzzleStep++;
            if (feedbackEl) {
              feedbackEl.innerHTML = `<span class="puzzle-info">${t('puzzleInfo')}</span>`;
            }
          }, 400);
        } else {
          this.audio.playVictory();
          if (feedbackEl) {
            feedbackEl.innerHTML = `<span class="puzzle-success">${t('puzzleSuccess')}</span>`;
          }
        }
      } else {
        if (feedbackEl) {
          feedbackEl.innerHTML = `<span class="puzzle-fail">${t('puzzleFail')}</span>`;
        }
      }
    }
  }

  // Tutorial
  loadLesson(idx) {
    if (idx < 0) idx = 0;
    if (idx >= TUTORIAL_LESSONS.length) idx = TUTORIAL_LESSONS.length - 1;

    this.currentLessonIdx = idx;
    const lesson = TUTORIAL_LESSONS[idx];
    const lang = getLanguage();

    const title = lesson[`title_${lang}`] || lesson.title_en || lesson.title || '';
    const subtitle = lesson[`subtitle_${lang}`] || lesson.subtitle_en || lesson.subtitle || '';
    const badge = lesson[`badge_${lang}`] || lesson.badge_en || lesson.badge || '';
    const content = lesson[`content_${lang}`] || lesson.content_en || lesson.content || '';

    const titleEl = document.getElementById('lesson-title');
    if (titleEl) titleEl.textContent = `${title} — ${subtitle}`;

    const badgeEl = document.getElementById('lesson-badge');
    if (badgeEl) badgeEl.textContent = badge;

    const contentEl = document.getElementById('lesson-content');
    if (contentEl) contentEl.innerHTML = content;

    const pageEl = document.getElementById('lesson-page-indicator');
    if (pageEl) pageEl.textContent = `${idx + 1} / ${TUTORIAL_LESSONS.length}`;

    const isLast = idx === TUTORIAL_LESSONS.length - 1;
    document.getElementById('lesson-next-btn')?.classList.toggle('hidden', isLast);
    document.getElementById('lesson-finish-btn')?.classList.toggle('hidden', !isLast);

    // Load interactive board demonstration for this lesson
    if (typeof lesson.setupBoard === 'function') {
      const demo = lesson.setupBoard();
      if (demo) {
        this.game.board = demo.board;
        this.game.hands = demo.hands;
        this.game.turn = demo.turn;
        this.game.moveHistory = [];
        this.game.positionHistory = [];
        this.game.status = 'active';
        this.game.winner = null;
        this.game.inCheck = false;
      } else {
        this.game.reset();
      }
      this.ui.isFlipped = false;
      this.ui.clearSelection();
      this.ui.render();
    }
  }

  changeLesson(delta) {
    this.loadLesson(this.currentLessonIdx + delta);
  }
}

// Instantiate on DOM ready if in browser
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.shogiApp = new ShogiApp();
  });
}
