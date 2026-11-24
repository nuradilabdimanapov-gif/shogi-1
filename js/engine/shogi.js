/**
 * Shogi Web - Core Rules Engine
 * Implements complete standard Shogi rules (Promotion, Drops, Nifu, Uchifuzume, Check, Checkmate, Sennichite)
 */

import {
  SENTE, GOTE,
  KING, ROOK, BISHOP, GOLD, SILVER, KNIGHT, LANCE, PAWN,
  PROM_ROOK, PROM_BISHOP, PROM_SILVER, PROM_KNIGHT, PROM_LANCE, PROM_PAWN,
  PIECE_INFO, STEP_MOVES, SLIDING_MOVES, DRAGON_STEP, HORSE_STEP,
  getInitialBoard, KANJI_RANKS
} from './constants.js';

export class ShogiGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = getInitialBoard();
    this.turn = SENTE; // Sente moves first
    this.hands = {
      [SENTE]: { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 },
      [GOTE]:  { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 }
    };
    this.moveHistory = []; // { from, to, piece, captured, promoted, isDrop, sfen, notation, japaneseNotation }
    this.positionHistory = []; // For Sennichite detection: [hash/sfen]
    this.status = 'active'; // 'active', 'checkmate', 'stalemate', 'repetition_draw', 'foul_loss', 'resigned'
    this.winner = null; // SENTE, GOTE, or null
    this.inCheck = false;
    this.recordPosition();
  }

  clone() {
    const copy = new ShogiGame();
    copy.board = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
    copy.turn = this.turn;
    copy.hands = {
      [SENTE]: { ...this.hands[SENTE] },
      [GOTE]:  { ...this.hands[GOTE] }
    };
    copy.moveHistory = this.moveHistory.map(m => ({ ...m }));
    copy.positionHistory = [...this.positionHistory];
    copy.status = this.status;
    copy.winner = this.winner;
    copy.inCheck = this.inCheck;
    return copy;
  }

  // Reconstruct game board up to a specific ply index (0-based) for history replay
  getGameAtPly(plyIndex) {
    const replay = new ShogiGame();
    if (plyIndex < 0) return replay;
    const limit = Math.min(plyIndex + 1, this.moveHistory.length);
    for (let i = 0; i < limit; i++) {
      const m = this.moveHistory[i];
      replay.makeMove({
        from: m.from,
        to: m.to,
        promote: m.promote,
        isDrop: m.isDrop,
        pieceType: m.pieceType
      });
    }
    return replay;
  }

  // Get current board cell
  getPiece(x, y) {
    if (x < 0 || x > 8 || y < 0 || y > 8) return null;
    return this.board[y][x];
  }

  // Find King position for player
  findKing(player, board = this.board) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = board[y][x];
        if (piece && piece.type === KING && piece.player === player) {
          return { x, y };
        }
      }
    }
    return null;
  }

  // Check if square (targetX, targetY) is attacked by `byPlayer`
  isSquareAttacked(targetX, targetY, byPlayer, board = this.board) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = board[y][x];
        if (!piece || piece.player !== byPlayer) continue;

        // Check if piece at (x, y) can attack (targetX, targetY)
        if (this.canPieceAttack(piece, x, y, targetX, targetY, board)) {
          return true;
        }
      }
    }
    return false;
  }

  // Check if a piece at (x, y) attacks (targetX, targetY)
  canPieceAttack(piece, x, y, targetX, targetY, board) {
    const type = piece.type;
    const player = piece.player;
    const sign = player === SENTE ? 1 : -1;

    // Check step moves
    const steps = STEP_MOVES[type];
    if (steps) {
      for (const [dx, dy] of steps) {
        const nx = x + (sign === 1 ? dx : -dx);
        const ny = y + (sign === 1 ? dy : -dy);
        if (nx === targetX && ny === targetY) {
          return true;
        }
      }
    }

    // Check sliding moves
    const slides = SLIDING_MOVES[type];
    if (slides) {
      for (const [dx, dy] of slides) {
        const stepX = sign === 1 ? dx : -dx;
        const stepY = sign === 1 ? dy : -dy;
        let nx = x + stepX;
        let ny = y + stepY;

        while (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
          if (nx === targetX && ny === targetY) {
            return true;
          }
          if (board[ny][nx] !== null) {
            break; // Path blocked
          }
          nx += stepX;
          ny += stepY;
        }
      }
    }

    // Special: Promoted Rook (+R) has Rook slides + King 1-step diagonals
    if (type === PROM_ROOK) {
      // Rook slides
      for (const [dx, dy] of SLIDING_MOVES[ROOK]) {
        let nx = x + dx;
        let ny = y + dy;
        while (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
          if (nx === targetX && ny === targetY) return true;
          if (board[ny][nx] !== null) break;
          nx += dx;
          ny += dy;
        }
      }
      // Diagonal steps
      for (const [dx, dy] of DRAGON_STEP) {
        if (x + dx === targetX && y + dy === targetY) return true;
      }
    }

    // Special: Promoted Bishop (+B) has Bishop slides + King 1-step orthogonals
    if (type === PROM_BISHOP) {
      // Bishop slides
      for (const [dx, dy] of SLIDING_MOVES[BISHOP]) {
        let nx = x + dx;
        let ny = y + dy;
        while (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
          if (nx === targetX && ny === targetY) return true;
          if (board[ny][nx] !== null) break;
          nx += dx;
          ny += dy;
        }
      }
      // Orthogonal steps
      for (const [dx, dy] of HORSE_STEP) {
        if (x + dx === targetX && y + dy === targetY) return true;
      }
    }

    return false;
  }

  // Is player currently in check?
  isPlayerInCheck(player, board = this.board) {
    const kingPos = this.findKing(player, board);
    if (!kingPos) return false;
    const opponent = player === SENTE ? GOTE : SENTE;
    return this.isSquareAttacked(kingPos.x, kingPos.y, opponent, board);
  }

  // Generate all pseudo-legal board moves for piece at (x, y)
  getPseudoMoves(x, y, board = this.board) {
    const piece = board[y][x];
    if (!piece) return [];

    const moves = [];
    const player = piece.player;
    const sign = player === SENTE ? 1 : -1;
    const type = piece.type;

    // Helper to test and add a destination
    const tryAdd = (tx, ty) => {
      if (tx < 0 || tx > 8 || ty < 0 || ty > 8) return false;
      const dest = board[ty][tx];
      if (dest && dest.player === player) return false; // Friendly piece

      moves.push({ from: { x, y }, to: { x: tx, y: ty }, isDrop: false, pieceType: type });
      return dest === null; // Return true if empty (continue sliding), false if capture (stop sliding)
    };

    // Step moves
    const steps = STEP_MOVES[type];
    if (steps) {
      for (const [dx, dy] of steps) {
        const tx = x + (sign === 1 ? dx : -dx);
        const ty = y + (sign === 1 ? dy : -dy);
        tryAdd(tx, ty);
      }
    }

    // Sliding moves
    const slides = SLIDING_MOVES[type];
    if (slides) {
      for (const [dx, dy] of slides) {
        const stepX = sign === 1 ? dx : -dx;
        const stepY = sign === 1 ? dy : -dy;
        let tx = x + stepX;
        let ty = y + stepY;
        while (tryAdd(tx, ty)) {
          tx += stepX;
          ty += stepY;
        }
      }
    }

    // Promoted Rook
    if (type === PROM_ROOK) {
      for (const [dx, dy] of SLIDING_MOVES[ROOK]) {
        let tx = x + dx;
        let ty = y + dy;
        while (tryAdd(tx, ty)) {
          tx += dx;
          ty += dy;
        }
      }
      for (const [dx, dy] of DRAGON_STEP) {
        tryAdd(x + dx, y + dy);
      }
    }

    // Promoted Bishop
    if (type === PROM_BISHOP) {
      for (const [dx, dy] of SLIDING_MOVES[BISHOP]) {
        let tx = x + dx;
        let ty = y + dy;
        while (tryAdd(tx, ty)) {
          tx += dx;
          ty += dy;
        }
      }
      for (const [dx, dy] of HORSE_STEP) {
        tryAdd(x + dx, y + dy);
      }
    }

    return moves;
  }

  // Can this piece promote when moving from (fromY) to (toY)?
  canPromote(piece, fromY, toY) {
    if (!PIECE_INFO[piece.type].promotesTo) return false;
    const isSente = piece.player === SENTE;
    const inPromoZone = isSente ? (toY <= 2 || fromY <= 2) : (toY >= 6 || fromY >= 6);
    return inPromoZone;
  }

  // Must this piece promote when moving to toY?
  mustPromote(piece, toY) {
    const type = piece.type;
    const isSente = piece.player === SENTE;

    if (type === PAWN || type === LANCE) {
      return isSente ? toY === 0 : toY === 8;
    }
    if (type === KNIGHT) {
      return isSente ? toY <= 1 : toY >= 7;
    }
    return false;
  }

  // Check if player has an unpromoted friendly pawn in column x (Nifu rule)
  hasPawnInFile(player, x, board = this.board) {
    for (let y = 0; y < 9; y++) {
      const p = board[y][x];
      if (p && p.player === player && p.type === PAWN) {
        return true;
      }
    }
    return false;
  }

  // Generate all pseudo-legal drop moves for player
  getPseudoDrops(player, board = this.board) {
    const drops = [];
    const hand = this.hands[player];

    for (const pieceType in hand) {
      if (hand[pieceType] <= 0) continue;

      for (let y = 0; y < 9; y++) {
        // Drop restrictions by rank:
        if (pieceType === PAWN || pieceType === LANCE) {
          if (player === SENTE && y === 0) continue;
          if (player === GOTE && y === 8) continue;
        }
        if (pieceType === KNIGHT) {
          if (player === SENTE && y <= 1) continue;
          if (player === GOTE && y >= 7) continue;
        }

        for (let x = 0; x < 9; x++) {
          if (board[y][x] !== null) continue; // Square must be empty

          // Nifu rule: Pawn cannot be dropped in a file already containing player's unpromoted pawn
          if (pieceType === PAWN && this.hasPawnInFile(player, x, board)) {
            continue;
          }

          drops.push({
            isDrop: true,
            pieceType,
            to: { x, y }
          });
        }
      }
    }

    return drops;
  }

  // Get all legal moves for current player
  getLegalMoves(player = this.turn) {
    if (this.status !== 'active') return [];

    const legalMoves = [];

    // 1. Board moves
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = this.board[y][x];
        if (!piece || piece.player !== player) continue;

        const pseudoMoves = this.getPseudoMoves(x, y);
        for (const pm of pseudoMoves) {
          const promoPossible = this.canPromote(piece, y, pm.to.y);
          const mandatoryPromo = this.mustPromote(piece, pm.to.y);

          // If mandatory promote, only add promote: true
          if (mandatoryPromo) {
            if (this.isMoveSafe(pm.from, pm.to, true, false, null, player)) {
              legalMoves.push({ ...pm, promote: true });
            }
          } else if (promoPossible) {
            // Optional promote: can choose promote or not promote
            if (this.isMoveSafe(pm.from, pm.to, true, false, null, player)) {
              legalMoves.push({ ...pm, promote: true });
            }
            if (this.isMoveSafe(pm.from, pm.to, false, false, null, player)) {
              legalMoves.push({ ...pm, promote: false });
            }
          } else {
            // No promo possible
            if (this.isMoveSafe(pm.from, pm.to, false, false, null, player)) {
              legalMoves.push({ ...pm, promote: false });
            }
          }
        }
      }
    }

    // 2. Drops
    const pseudoDrops = this.getPseudoDrops(player);
    for (const pd of pseudoDrops) {
      // Check if drop leaves own king in check
      if (!this.isMoveSafe(null, pd.to, false, true, pd.pieceType, player)) {
        continue;
      }

      // Check Uchifuzume (Pawn-drop mate) rule:
      // If dropping a pawn gives check, it must NOT deliver checkmate!
      if (pd.pieceType === PAWN) {
        if (this.isUchifuzume(pd.to, player)) {
          continue; // Forbidden by Uchifuzume rule
        }
      }

      legalMoves.push({ ...pd, promote: false });
    }

    return legalMoves;
  }

  // Check if a move leaves own king safe (not in check)
  isMoveSafe(from, to, promote, isDrop, pieceType, player) {
    // Clone board state temporarily
    const tempBoard = this.board.map(r => [...r]);

    if (isDrop) {
      tempBoard[to.y][to.x] = { type: pieceType, player };
    } else {
      const p = tempBoard[from.y][from.x];
      const newType = promote ? PIECE_INFO[p.type].promotesTo : p.type;
      tempBoard[to.y][to.x] = { type: newType, player };
      tempBoard[from.y][from.x] = null;
    }

    return !this.isPlayerInCheck(player, tempBoard);
  }

  // Check if dropping a pawn at `to` results in Uchifuzume (illegal pawn-drop checkmate)
  isUchifuzume(to, player) {
    const opponent = player === SENTE ? GOTE : SENTE;
    const opponentKing = this.findKing(opponent);
    if (!opponentKing) return false;

    // Simulate drop
    const tempBoard = this.board.map(r => [...r]);
    tempBoard[to.y][to.x] = { type: PAWN, player };

    // Does this drop put the opponent King in check?
    if (!this.isPlayerInCheck(opponent, tempBoard)) {
      return false; // Not checking, so definitely not Uchifuzume
    }

    // It gives check! Now test if opponent has ANY legal moves to escape/counter
    // Temporarily apply drop to this game instance to evaluate opponent legal moves
    const origTurn = this.turn;
    const origBoardPiece = this.board[to.y][to.x];
    const origHandPawn = this.hands[player][PAWN];

    this.board[to.y][to.x] = { type: PAWN, player };
    this.hands[player][PAWN]--;
    this.turn = opponent;

    let hasAnyEscape = false;

    // 1. Can opponent move any piece to block, capture or king escape?
    outerLoop:
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = this.board[y][x];
        if (!piece || piece.player !== opponent) continue;

        const pMoves = this.getPseudoMoves(x, y);
        for (const pm of pMoves) {
          const promoPossible = this.canPromote(piece, y, pm.to.y);
          const mandatoryPromo = this.mustPromote(piece, pm.to.y);

          if (mandatoryPromo) {
            if (this.isMoveSafe(pm.from, pm.to, true, false, null, opponent)) {
              hasAnyEscape = true;
              break outerLoop;
            }
          } else {
            if (this.isMoveSafe(pm.from, pm.to, false, false, null, opponent)) {
              hasAnyEscape = true;
              break outerLoop;
            }
            if (promoPossible && this.isMoveSafe(pm.from, pm.to, true, false, null, opponent)) {
              hasAnyEscape = true;
              break outerLoop;
            }
          }
        }
      }
    }

    // 2. Can opponent drop any piece to interpose?
    if (!hasAnyEscape) {
      const pDrops = this.getPseudoDrops(opponent);
      for (const pd of pDrops) {
        if (this.isMoveSafe(null, pd.to, false, true, pd.pieceType, opponent)) {
          hasAnyEscape = true;
          break;
        }
      }
    }

    // Restore state
    this.board[to.y][to.x] = origBoardPiece;
    this.hands[player][PAWN] = origHandPawn;
    this.turn = origTurn;

    // If opponent has NO escape moves, it IS Uchifuzume!
    return !hasAnyEscape;
  }

  // Execute a move: move = { from, to, promote, isDrop, pieceType }
  makeMove(move) {
    if (this.status !== 'active') return false;

    const { from, to, promote, isDrop, pieceType } = move;
    const player = this.turn;
    const opponent = player === SENTE ? GOTE : SENTE;

    let movingPieceType = pieceType;
    let captured = null;

    if (isDrop) {
      if (this.hands[player][pieceType] <= 0) return false;
      this.hands[player][pieceType]--;
      this.board[to.y][to.x] = { type: pieceType, player };
    } else {
      const piece = this.board[from.y][from.x];
      if (!piece || piece.player !== player) return false;
      movingPieceType = piece.type;

      // Handle capture
      const destPiece = this.board[to.y][to.x];
      if (destPiece) {
        captured = destPiece.type;
        // Unpromote if captured piece was promoted
        const unpromotedType = PIECE_INFO[captured].unpromoted || captured;
        this.hands[player][unpromotedType]++;
      }

      // Handle promotion
      const finalType = promote ? PIECE_INFO[piece.type].promotesTo : piece.type;
      this.board[to.y][to.x] = { type: finalType, player };
      this.board[from.y][from.x] = null;
    }

    // Record notations
    const notation = this.formatWesternMove(move, captured);
    const japaneseNotation = this.formatJapaneseMove(move, captured);

    // Save to move history
    this.moveHistory.push({
      ...move,
      player,
      piece: movingPieceType,
      captured,
      notation,
      japaneseNotation,
      sfen: this.toSFEN()
    });

    // Toggle turn
    this.turn = opponent;

    // Check game state updates
    this.inCheck = this.isPlayerInCheck(this.turn);
    this.recordPosition();

    // Check for checkmate or repetition
    this.updateGameStatus();

    return true;
  }

  // Undo the last move
  undoMove() {
    if (this.moveHistory.length === 0) return null;

    const lastMove = this.moveHistory.pop();
    this.positionHistory.pop();

    const { from, to, player, piece, captured, promote, isDrop, pieceType } = lastMove;
    const opponent = player === SENTE ? GOTE : SENTE;

    if (isDrop) {
      // Remove dropped piece from board and put back in hand
      this.board[to.y][to.x] = null;
      this.hands[player][pieceType]++;
    } else {
      // Return piece to origin (with original unpromoted/promoted state)
      this.board[from.y][from.x] = { type: piece, player };

      // Restore captured piece if any
      if (captured) {
        const unpromotedType = PIECE_INFO[captured].unpromoted || captured;
        this.hands[player][unpromotedType]--;
        this.board[to.y][to.x] = { type: captured, player: opponent };
      } else {
        this.board[to.y][to.x] = null;
      }
    }

    this.turn = player;
    this.status = 'active';
    this.winner = null;
    this.inCheck = this.isPlayerInCheck(this.turn);

    return lastMove;
  }

  // Format move in Western Shogi notation (e.g. 7g-7f, Bx8h+, P*5e)
  formatWesternMove(move, captured) {
    const { from, to, promote, isDrop, pieceType } = move;
    const toFile = 9 - to.x;
    const toRank = String.fromCharCode('a'.charCodeAt(0) + to.y);

    if (isDrop) {
      return `${pieceType}*${toFile}${toRank}`;
    }

    const fromFile = 9 - from.x;
    const fromRank = String.fromCharCode('a'.charCodeAt(0) + from.y);
    const piece = this.board[to.y][to.x]?.type || pieceType;
    const op = captured ? 'x' : '-';
    const promoStr = promote ? '+' : '';

    return `${piece}${fromFile}${fromRank}${op}${toFile}${toRank}${promoStr}`;
  }

  // Format move in Japanese notation (e.g. ☗7六歩, ☖3四歩, ☗8八銀成, ☗5五歩打)
  formatJapaneseMove(move, captured) {
    const { from, to, promote, isDrop, pieceType, player = this.turn } = move;
    const marker = player === SENTE ? '☗' : '☖';
    const fileChar = (9 - to.x).toString();
    const rankChar = KANJI_RANKS[to.y];
    const pieceName = PIECE_INFO[pieceType]?.kanji1 || pieceType;

    let suffix = '';
    if (isDrop) {
      suffix = '打';
    } else if (promote) {
      suffix = '成';
    }

    return `${marker}${fileChar}${rankChar}${pieceName}${suffix}`;
  }

  // Record board hash for repetition checking
  recordPosition() {
    this.positionHistory.push(this.getPositionHash());
  }

  // Hash representing exact board, hands, and turn
  getPositionHash() {
    let boardStr = '';
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const p = this.board[y][x];
        if (!p) boardStr += '.';
        else boardStr += (p.player === SENTE ? p.type : p.type.toLowerCase()) + ',';
      }
    }

    const handStr = JSON.stringify(this.hands);
    return `${boardStr}|${handStr}|${this.turn}`;
  }

  // Check Sennichite (Fourfold repetition)
  checkRepetition() {
    const currentHash = this.getPositionHash();
    let count = 0;
    for (const h of this.positionHistory) {
      if (h === currentHash) count++;
    }
    return count >= 4;
  }

  // Update game status after a move
  updateGameStatus() {
    const legalMoves = this.getLegalMoves(this.turn);

    if (legalMoves.length === 0) {
      if (this.inCheck) {
        this.status = 'checkmate';
        this.winner = this.turn === SENTE ? GOTE : SENTE;
      } else {
        this.status = 'stalemate';
        this.winner = null;
      }
      return;
    }

    if (this.checkRepetition()) {
      this.status = 'repetition_draw';
      this.winner = null;
    }
  }

  // Resign
  resign(player = this.turn) {
    this.status = 'resigned';
    this.winner = player === SENTE ? GOTE : SENTE;
  }

  // Convert board to SFEN format
  toSFEN() {
    let sfen = '';
    for (let y = 0; y < 9; y++) {
      let emptyCount = 0;
      for (let x = 0; x < 9; x++) {
        const p = this.board[y][x];
        if (!p) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            sfen += emptyCount;
            emptyCount = 0;
          }
          const symbol = p.player === SENTE ? p.type : p.type.toLowerCase();
          sfen += symbol;
        }
      }
      if (emptyCount > 0) sfen += emptyCount;
      if (y < 8) sfen += '/';
    }

    // Turn
    sfen += ` ${this.turn === SENTE ? 'b' : 'w'} `;

    // Hands
    let handStr = '';
    const addHand = (pieces, isSente) => {
      for (const [type, count] of Object.entries(pieces)) {
        if (count > 0) {
          const sym = isSente ? type : type.toLowerCase();
          handStr += (count > 1 ? count : '') + sym;
        }
      }
    };
    addHand(this.hands[SENTE], true);
    addHand(this.hands[GOTE], false);
    sfen += handStr.length > 0 ? handStr : '-';

    // Move count
    sfen += ` ${this.moveHistory.length + 1}`;

    return sfen;
  }
}
