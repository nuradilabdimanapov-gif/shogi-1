/**
 * Shogi Web - UI & Board Renderer
 * Handles rendering the 9x9 board, pieces, komadai, animations, selection, highlights, and user interactions.
 */

import {
  SENTE, GOTE,
  KING, ROOK, BISHOP, GOLD, SILVER, KNIGHT, LANCE, PAWN,
  PROM_ROOK, PROM_BISHOP, PROM_SILVER, PROM_KNIGHT, PROM_LANCE, PROM_PAWN,
  PIECE_INFO, KANJI_RANKS, KANJI_FILES
} from './engine/constants.js';
import { t } from './i18n.js';

// Movement directions for Beginner Guide Dots:
// [dx, dy] relative to upward facing piece
const MOVE_VECTORS = {
  [KING]: [[0,-1], [1,-1], [1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1]],
  [GOLD]: [[0,-1], [1,-1], [1,0], [0,1], [-1,0], [-1,-1]],
  [SILVER]: [[0,-1], [1,-1], [1,1], [-1,1], [-1,-1]],
  [KNIGHT]: [[1,-2], [-1,-2]],
  [LANCE]: [[0,-1]], // arrow up
  [PAWN]: [[0,-1]],
  [ROOK]: [[0,-1], [1,0], [0,1], [-1,0]],
  [BISHOP]: [[1,-1], [1,1], [-1,1], [-1,-1]],
  [PROM_ROOK]: [[0,-1], [1,0], [0,1], [-1,0], [1,-1], [1,1], [-1,1], [-1,-1]],
  [PROM_BISHOP]: [[1,-1], [1,1], [-1,1], [-1,-1], [0,-1], [1,0], [0,1], [-1,0]],
  [PROM_SILVER]: [[0,-1], [1,-1], [1,0], [0,1], [-1,0], [-1,-1]],
  [PROM_KNIGHT]: [[0,-1], [1,-1], [1,0], [0,1], [-1,0], [-1,-1]],
  [PROM_LANCE]: [[0,-1], [1,-1], [1,0], [0,1], [-1,0], [-1,-1]],
  [PROM_PAWN]: [[0,-1], [1,-1], [1,0], [0,1], [-1,0], [-1,-1]]
};

export class ShogiUI {
  constructor(game, audio, onUserMove) {
    this.game = game;
    this.viewingGame = null;
    this.activePly = null;
    this.onHistoryClick = null;
    this.audio = audio;
    this.onUserMove = onUserMove;

    this.selectedSquare = null; // { x, y }
    this.selectedHandPiece = null; // { pieceType, player }
    this.legalMovesCache = [];
    this.isFlipped = false; // If true, view from Gote's perspective
    
    let pieceStyle = 'kanji2';
    let theme = 'kaya';
    try {
      pieceStyle = localStorage.getItem('shogi_piece_style') || 'kanji2';
      theme = localStorage.getItem('shogi_theme') || 'kaya';
    } catch (e) {}

    this.pieceStyle = pieceStyle;
    this.theme = theme;

    this.initDOM();
  }

  initDOM() {
    this.boardEl = document.getElementById('shogi-board');
    this.senteHandEl = document.getElementById('sente-hand');
    this.goteHandEl = document.getElementById('gote-hand');
    this.moveLogEl = document.getElementById('move-log-list');
    this.statusBannerEl = document.getElementById('game-status-banner');
    this.promoModalEl = document.getElementById('promo-modal');
    this.promoYesBtn = document.getElementById('promo-yes-btn');
    this.promoNoBtn = document.getElementById('promo-no-btn');

    // Attach promotion modal listeners
    if (this.promoYesBtn) {
      this.promoYesBtn.onclick = () => this.resolvePromoModal(true);
    }
    if (this.promoNoBtn) {
      this.promoNoBtn.onclick = () => this.resolvePromoModal(false);
    }
  }

  setPieceStyle(style) {
    this.pieceStyle = style;
    try {
      localStorage.setItem('shogi_piece_style', style);
    } catch (e) {}
    this.render();
  }

  setTheme(theme) {
    this.theme = theme;
    try {
      localStorage.setItem('shogi_theme', theme);
    } catch (e) {}
    if (typeof document !== 'undefined' && document.body) {
      document.body.className = `theme-${theme}`;
    }
  }

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
    this.render();
  }

  getActiveGame() {
    return this.viewingGame || this.game;
  }

  // Render the entire board and stands
  render(lastMove = null) {
    this.renderBoard(lastMove);
    this.renderHands();
    this.renderStatus();
    this.renderMoveLog();
  }

  // Render 9x9 board grid
  renderBoard(lastMove = null) {
    if (!this.boardEl) return;
    this.boardEl.innerHTML = '';

    const game = this.getActiveGame();
    const kingInCheckPos = game.inCheck ? game.findKing(game.turn) : null;

    // Render cells according to orientation
    for (let r = 0; r < 9; r++) {
      const y = this.isFlipped ? 8 - r : r;

      for (let c = 0; c < 9; c++) {
        const x = this.isFlipped ? 8 - c : c;

        const cellEl = document.createElement('div');
        cellEl.className = 'board-cell';
        cellEl.dataset.x = x;
        cellEl.dataset.y = y;

        // Coordinates display on edges
        if (c === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-label rank-label';
          rankLabel.textContent = KANJI_RANKS[y];
          cellEl.appendChild(rankLabel);
        }
        if (r === 8) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-label file-label';
          fileLabel.textContent = (9 - x).toString();
          cellEl.appendChild(fileLabel);
        }

        // Hoshi (Star dots) on board: (2,2), (2,5), (5,2), (5,5) in 0-indexed coords
        if ((x === 2 || x === 5) && (y === 2 || y === 5)) {
          const hoshi = document.createElement('div');
          hoshi.className = 'board-hoshi';
          cellEl.appendChild(hoshi);
        }

        // Highlights
        if (this.selectedSquare && this.selectedSquare.x === x && this.selectedSquare.y === y) {
          cellEl.classList.add('selected');
        }

        if (lastMove) {
          if (!lastMove.isDrop && lastMove.from && lastMove.from.x === x && lastMove.from.y === y) {
            cellEl.classList.add('last-move-from');
          }
          if (lastMove.to && lastMove.to.x === x && lastMove.to.y === y) {
            cellEl.classList.add('last-move-to');
          }
        }

        // King in check highlight
        if (kingInCheckPos && kingInCheckPos.x === x && kingInCheckPos.y === y) {
          cellEl.classList.add('in-check');
        }

        // Check if this square is a valid target move
        const isTarget = this.legalMovesCache.some(m => m.to.x === x && m.to.y === y);
        if (isTarget) {
          const destPiece = game.getPiece(x, y);
          if (destPiece) {
            cellEl.classList.add('legal-capture');
          } else {
            cellEl.classList.add('legal-move');
          }
        }

        // Render piece
        const piece = game.getPiece(x, y);
        if (piece) {
          const pieceEl = this.createPieceElement(piece);
          cellEl.appendChild(pieceEl);
        }

        // Click handler
        cellEl.onclick = () => this.handleCellClick(x, y);

        this.boardEl.appendChild(cellEl);
      }
    }
  }

  // Create visual piece element
  createPieceElement(piece, isStand = false) {
    const el = document.createElement('div');
    const isPromoted = piece.type.startsWith('+');
    const isSente = piece.player === SENTE;

    el.className = `shogi-piece ${isSente ? 'sente' : 'gote'} ${isPromoted ? 'promoted' : ''}`;
    if (this.isFlipped) {
      el.classList.add('view-flipped');
    }

    // Piece Text
    const textEl = document.createElement('div');
    textEl.className = 'piece-text';

    const info = PIECE_INFO[piece.type];

    if (this.pieceStyle === 'kanji2') {
      textEl.textContent = isSente ? info.kanjiSente : info.kanjiGote;
    } else if (this.pieceStyle === 'kanji1') {
      textEl.textContent = (isSente || !info.kanji1Gote) ? info.kanji1 : info.kanji1Gote;
    } else if (this.pieceStyle === 'western') {
      textEl.innerHTML = `<span class="western-sym">${info.symbol}</span><span class="western-name">${info.name.slice(0, 3)}</span>`;
    } else if (this.pieceStyle === 'guide') {
      // Guide style: Kanji + visual movement indicator dots
      textEl.textContent = info.kanji1;
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'guide-dots-container';

      const vectors = MOVE_VECTORS[piece.type] || [];
      vectors.forEach(([dx, dy]) => {
        const dot = document.createElement('span');
        dot.className = `guide-dot dot-dx${dx}-dy${dy}`;
        dotsContainer.appendChild(dot);
      });
      el.appendChild(dotsContainer);
    }

    el.appendChild(textEl);
    return el;
  }

  // Render Captured Piece Stands (Komadai)
  renderHands() {
    this.renderPlayerHand(SENTE, this.senteHandEl);
    this.renderPlayerHand(GOTE, this.goteHandEl);
  }

  renderPlayerHand(player, containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const game = this.getActiveGame();
    const hand = game.hands[player];
    const isCurrentPlayer = game.turn === player;

    const pieceOrder = [ROOK, BISHOP, GOLD, SILVER, KNIGHT, LANCE, PAWN];

    pieceOrder.forEach(type => {
      const count = hand[type];
      if (count <= 0) return;

      const itemEl = document.createElement('div');
      itemEl.className = `komadai-item ${isCurrentPlayer ? 'active-player' : ''}`;

      if (this.selectedHandPiece && this.selectedHandPiece.player === player && this.selectedHandPiece.pieceType === type) {
        itemEl.classList.add('selected');
      }

      const pieceEl = this.createPieceElement({ type, player }, true);
      itemEl.appendChild(pieceEl);

      if (count > 1) {
        const countBadge = document.createElement('span');
        countBadge.className = 'piece-count-badge';
        countBadge.textContent = count;
        itemEl.appendChild(countBadge);
      }

      // Hand piece click handler
      itemEl.onclick = (e) => {
        e.stopPropagation();
        this.handleHandPieceClick(type, player);
      };

      containerEl.appendChild(itemEl);
    });

    if (containerEl.children.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'komadai-empty';
      emptyNote.textContent = 'None';
      containerEl.appendChild(emptyNote);
    }
  }

  // Handle cell click on board
  async handleCellClick(x, y) {
    if (this.game.status !== 'active') return;

    // 1. If a hand piece is selected, attempt drop
    if (this.selectedHandPiece) {
      if (this.selectedHandPiece.player !== this.game.turn) {
        this.clearSelection();
        return;
      }

      const matchingDrop = this.legalMovesCache.find(m => m.isDrop && m.pieceType === this.selectedHandPiece.pieceType && m.to.x === x && m.to.y === y);
      if (matchingDrop) {
        this.clearSelection();
        this.audio.playDrop();
        await this.onUserMove(matchingDrop);
        return;
      } else {
        // Clicked invalid square; cancel or select piece on board if friendly
        const clickedPiece = this.game.getPiece(x, y);
        if (clickedPiece && clickedPiece.player === this.game.turn) {
          this.selectBoardSquare(x, y);
        } else {
          this.clearSelection();
          this.render();
        }
        return;
      }
    }

    // 2. If a board piece is already selected, attempt move
    if (this.selectedSquare) {
      const matchingMoves = this.legalMovesCache.filter(m => !m.isDrop && m.from.x === this.selectedSquare.x && m.from.y === this.selectedSquare.y && m.to.x === x && m.to.y === y);

      if (matchingMoves.length > 0) {
        // Valid move!
        const fromX = this.selectedSquare.x;
        const fromY = this.selectedSquare.y;
        this.clearSelection();

        // Check if promotion choice is needed
        let chosenMove = matchingMoves[0];
        if (matchingMoves.length === 2) {
          // One is promote: true, other is promote: false -> ask user!
          const wantsPromo = await this.promptPromotion();
          chosenMove = matchingMoves.find(m => m.promote === wantsPromo) || matchingMoves[0];
        }

        const isCapture = this.game.getPiece(x, y) !== null;
        if (chosenMove.promote) {
          this.audio.playPromotion();
        } else if (isCapture) {
          this.audio.playCapture();
        } else {
          this.audio.playPieceClack();
        }

        await this.onUserMove(chosenMove);
        return;
      }
    }

    // 3. Otherwise, select the piece at (x, y) if friendly
    const piece = this.game.getPiece(x, y);
    if (piece && piece.player === this.game.turn) {
      this.selectBoardSquare(x, y);
    } else {
      this.clearSelection();
      this.render();
    }
  }

  // Handle hand piece selection
  handleHandPieceClick(pieceType, player) {
    if (this.game.status !== 'active') return;
    if (player !== this.game.turn) return;

    if (this.selectedHandPiece && this.selectedHandPiece.pieceType === pieceType) {
      this.clearSelection();
      this.render();
      return;
    }

    this.selectedSquare = null;
    this.selectedHandPiece = { pieceType, player };

    // Filter legal moves for this drop
    const allLegal = this.game.getLegalMoves(this.game.turn);
    this.legalMovesCache = allLegal.filter(m => m.isDrop && m.pieceType === pieceType);

    this.render();
  }

  // Select board piece and compute legal destinations
  selectBoardSquare(x, y) {
    this.selectedSquare = { x, y };
    this.selectedHandPiece = null;

    const allLegal = this.game.getLegalMoves(this.game.turn);
    this.legalMovesCache = allLegal.filter(m => !m.isDrop && m.from.x === x && m.from.y === y);

    this.render();
  }

  clearSelection() {
    this.selectedSquare = null;
    this.selectedHandPiece = null;
    this.legalMovesCache = [];
  }

  // Promotion choice modal (returns Promise resolving to boolean)
  promptPromotion() {
    return new Promise(resolve => {
      this.promoResolver = resolve;
      if (this.promoModalEl) {
        this.promoModalEl.classList.add('visible');
      } else {
        // Fallback to window confirm if modal not present
        resolve(window.confirm('Promote this piece? (成りますか？)'));
      }
    });
  }

  resolvePromoModal(promote) {
    if (this.promoModalEl) {
      this.promoModalEl.classList.remove('visible');
    }
    if (this.promoResolver) {
      this.promoResolver(promote);
      this.promoResolver = null;
    }
  }

  // Render game status banner
  renderStatus() {
    if (!this.statusBannerEl) return;

    if (this.viewingGame !== null) {
      const stepNum = this.activePly !== null ? this.activePly + 1 : 0;
      const totalMoves = this.game.moveHistory.length;
      this.statusBannerEl.innerHTML = `
        <div class="status-turn" style="border-left: 3px solid var(--accent-gold);">
          <strong>📜 ${t('viewingMove') || 'Viewing Move'}:</strong>
          <span class="turn-badge badge-sente">#${stepNum} / ${totalMoves}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 8px;">(Click 'Latest ⏭' to resume)</span>
        </div>`;
      return;
    }

    const turnPlayer = this.game.turn === SENTE ? t('turnSente') : t('turnGote');
    const status = this.game.status;

    let html = '';
    if (status === 'checkmate') {
      const winnerName = this.game.winner === SENTE ? t('turnSente') : t('turnGote');
      html = `<div class="status-alert alert-winner">🏆 <strong>${t('statusCheckmate')}</strong> ${winnerName} ${t('statusWins')}</div>`;
      this.audio.playVictory();
    } else if (status === 'resigned') {
      const winnerName = this.game.winner === SENTE ? t('turnSente') : t('turnGote');
      html = `<div class="status-alert alert-winner">🏳️ <strong>${t('statusResign')}</strong> — ${winnerName} ${t('statusWins')}</div>`;
    } else if (status === 'repetition_draw') {
      html = `<div class="status-alert alert-draw">⚖️ <strong>${t('statusRepetition')}</strong></div>`;
    } else if (status === 'stalemate') {
      html = `<div class="status-alert alert-draw">⚖️ <strong>${t('statusStalemate')}</strong></div>`;
    } else {
      if (this.game.inCheck) {
        html = `<div class="status-alert alert-check">⚠️ <strong>${t('statusCheck')}</strong> ${turnPlayer} ${t('turnToMove')}</div>`;
        this.audio.playCheck();
      } else {
        html = `<div class="status-turn"><strong>Turn:</strong> <span class="turn-badge ${this.game.turn === SENTE ? 'badge-sente' : 'badge-gote'}">${turnPlayer}</span></div>`;
      }
    }

    this.statusBannerEl.innerHTML = html;
  }

  // Render move history log
  renderMoveLog() {
    if (!this.moveLogEl) return;
    this.moveLogEl.innerHTML = '';

    const history = this.game.moveHistory;
    if (history.length === 0) {
      this.moveLogEl.innerHTML = '<li class="move-log-empty">No moves yet. Make your opening move!</li>';
      return;
    }

    history.forEach((m, idx) => {
      const li = document.createElement('li');
      li.className = `move-log-item ${idx % 2 === 0 ? 'sente-move' : 'gote-move'}`;
      const isSelected = (this.activePly !== null ? this.activePly === idx : idx === history.length - 1);
      if (isSelected) {
        li.classList.add('current');
      }

      const numSpan = document.createElement('span');
      numSpan.className = 'move-num';
      numSpan.textContent = `${idx + 1}.`;

      const notationSpan = document.createElement('span');
      notationSpan.className = 'move-notation';
      notationSpan.innerHTML = `<strong>${m.japaneseNotation}</strong> <small class="text-muted">(${m.notation})</small>`;

      li.appendChild(numSpan);
      li.appendChild(notationSpan);

      li.style.cursor = 'pointer';
      li.title = 'Click to view board at this move';
      li.onclick = () => {
        if (this.onHistoryClick) {
          this.onHistoryClick(idx);
        }
      };

      this.moveLogEl.appendChild(li);
    });

    // Auto-scroll to current move
    const currentItem = this.moveLogEl.querySelector('.move-log-item.current');
    if (currentItem) {
      currentItem.scrollIntoView({ block: 'nearest' });
    }
  }
}
