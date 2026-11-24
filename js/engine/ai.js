/**
 * Shogi Web - AI Engine
 * Provides multiple difficulty levels: Novice, Apprentice, Tactician, and Master.
 * Uses Alpha-Beta pruning with move ordering, piece-square evaluations, and hand bonuses.
 */

import {
  SENTE, GOTE,
  KING, ROOK, BISHOP, GOLD, SILVER, KNIGHT, LANCE, PAWN,
  PROM_ROOK, PROM_BISHOP, PROM_SILVER, PROM_KNIGHT, PROM_LANCE, PROM_PAWN,
  PIECE_INFO
} from './constants.js';

// Base piece values
const PIECE_VALUES = {
  [KING]: 100000,
  [PROM_ROOK]: 1400,
  [PROM_BISHOP]: 1200,
  [ROOK]: 1000,
  [BISHOP]: 850,
  [GOLD]: 550,
  [PROM_SILVER]: 540,
  [PROM_KNIGHT]: 530,
  [PROM_LANCE]: 520,
  [PROM_PAWN]: 520,
  [SILVER]: 450,
  [KNIGHT]: 350,
  [LANCE]: 320,
  [PAWN]: 100
};

// Values for pieces in hand (in Shogi, pieces in hand are often valued higher due to versatility!)
const HAND_VALUES = {
  [ROOK]: 1100,
  [BISHOP]: 950,
  [GOLD]: 600,
  [SILVER]: 500,
  [KNIGHT]: 400,
  [LANCE]: 350,
  [PAWN]: 120
};

// Position bonus grid (center squares are more valuable)
const CENTER_BONUS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 5, 5, 5, 5, 5, 5, 0],
  [0, 5, 10, 15, 15, 15, 10, 5, 0],
  [0, 5, 15, 25, 30, 25, 15, 5, 0],
  [0, 5, 15, 30, 40, 30, 15, 5, 0],
  [0, 5, 15, 25, 30, 25, 15, 5, 0],
  [0, 5, 10, 15, 15, 15, 10, 5, 0],
  [0, 5, 5, 5, 5, 5, 5, 5, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0]
];

export class ShogiAI {
  constructor(difficulty = 'tactician') {
    this.difficulty = difficulty; // 'novice', 'apprentice', 'tactician', 'master'
  }

  setDifficulty(level) {
    this.difficulty = level;
  }

  // Evaluate static board position from Sente perspective (+ is good for Sente, - is good for Gote)
  evaluatePosition(game) {
    if (game.status === 'checkmate') {
      return game.winner === SENTE ? 999999 : -999999;
    }

    let score = 0;
    const board = game.board;

    // 1. Board material and positional bonuses
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const p = board[y][x];
        if (!p) continue;

        const val = PIECE_VALUES[p.type] || 0;
        const center = CENTER_BONUS[y][x];
        const pieceScore = val + center;

        // Bonus for advanced pawns/lances approaching promotion zone
        let advanceBonus = 0;
        if (p.type === PAWN || p.type === LANCE) {
          advanceBonus = p.player === SENTE ? (8 - y) * 8 : y * 8;
        }

        const totalPiece = pieceScore + advanceBonus;
        if (p.player === SENTE) {
          score += totalPiece;
        } else {
          score -= totalPiece;
        }
      }
    }

    // 2. Hand piece values
    for (const [ptype, count] of Object.entries(game.hands[SENTE])) {
      score += (HAND_VALUES[ptype] || 0) * count;
    }
    for (const [ptype, count] of Object.entries(game.hands[GOTE])) {
      score -= (HAND_VALUES[ptype] || 0) * count;
    }

    // 3. King safety heuristic (proximity of defenders to King)
    const senteKing = game.findKing(SENTE, board);
    const goteKing = game.findKing(GOTE, board);

    if (senteKing) {
      let defenders = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = senteKing.x + dx;
          const ny = senteKing.y + dy;
          if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
            const p = board[ny][nx];
            if (p && p.player === SENTE && (p.type === GOLD || p.type === SILVER)) {
              defenders++;
            }
          }
        }
      }
      score += defenders * 40;
    }

    if (goteKing) {
      let defenders = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = goteKing.x + dx;
          const ny = goteKing.y + dy;
          if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
            const p = board[ny][nx];
            if (p && p.player === GOTE && (p.type === GOLD || p.type === SILVER)) {
              defenders++;
            }
          }
        }
      }
      score -= defenders * 40;
    }

    return score;
  }

  // Order moves for better Alpha-Beta pruning (captures, promotions, checks first)
  orderMoves(moves, game) {
    return moves.slice().sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Board move captures
      if (!a.isDrop) {
        const destA = game.board[a.to.y][a.to.x];
        if (destA) scoreA += (PIECE_VALUES[destA.type] || 0) * 2;
        if (a.promote) scoreA += 300;
      }
      if (!b.isDrop) {
        const destB = game.board[b.to.y][b.to.x];
        if (destB) scoreB += (PIECE_VALUES[destB.type] || 0) * 2;
        if (b.promote) scoreB += 300;
      }

      // Drop moves into enemy territory
      if (a.isDrop) {
        const inEnemy = game.turn === SENTE ? a.to.y <= 2 : a.to.y >= 6;
        if (inEnemy) scoreA += 50;
      }
      if (b.isDrop) {
        const inEnemy = game.turn === SENTE ? b.to.y <= 2 : b.to.y >= 6;
        if (inEnemy) scoreB += 50;
      }

      return scoreB - scoreA;
    });
  }

  // Alpha-Beta Minimax search
  alphaBeta(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.status !== 'active') {
      return { score: this.evaluatePosition(game), move: null };
    }

    const legalMoves = game.getLegalMoves();
    if (legalMoves.length === 0) {
      if (game.inCheck) {
        return { score: isMaximizing ? -999999 + (10 - depth) : 999999 - (10 - depth), move: null };
      }
      return { score: 0, move: null }; // Stalemate
    }

    const orderedMoves = this.orderMoves(legalMoves, game);
    let bestMove = orderedMoves[0];

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of orderedMoves) {
        game.makeMove(move);
        const evaluation = this.alphaBeta(game, depth - 1, alpha, beta, false).score;
        game.undoMove();

        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestMove = move;
        }
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Pruning
      }
      return { score: maxEval, move: bestMove };
    } else {
      let minEval = Infinity;
      for (const move of orderedMoves) {
        game.makeMove(move);
        const evaluation = this.alphaBeta(game, depth - 1, alpha, beta, true).score;
        game.undoMove();

        if (evaluation < minEval) {
          minEval = evaluation;
          bestMove = move;
        }
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Pruning
      }
      return { score: minEval, move: bestMove };
    }
  }

  // Calculate best move asynchronously with configurable delay for natural feel
  async getBestMove(game) {
    const legalMoves = game.getLegalMoves();
    if (legalMoves.length === 0) return null;

    const player = game.turn;
    const isMaximizing = player === SENTE;

    // Small delay to simulate thinking
    await new Promise(res => setTimeout(res, 250));

    // 1. Novice level: 75% random with preference for captures
    if (this.difficulty === 'novice') {
      const captures = legalMoves.filter(m => !m.isDrop && game.board[m.to.y][m.to.x] !== null);
      if (captures.length > 0 && Math.random() < 0.6) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // 2. Apprentice level: 1-ply search with evaluation
    if (this.difficulty === 'apprentice') {
      const cloned = game.clone();
      let bestMove = legalMoves[0];
      let bestScore = isMaximizing ? -Infinity : Infinity;

      for (const move of legalMoves) {
        cloned.makeMove(move);
        const score = this.evaluatePosition(cloned) + (Math.random() * 40 - 20); // Minor noise
        cloned.undoMove();

        if (isMaximizing ? score > bestScore : score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    // 3. Tactician level: Alpha-Beta depth 2
    if (this.difficulty === 'tactician') {
      const cloned = game.clone();
      const result = this.alphaBeta(cloned, 2, -Infinity, Infinity, isMaximizing);
      return result.move || legalMoves[0];
    }

    // 4. Master level: Alpha-Beta depth 3 with candidate move limit
    if (this.difficulty === 'master') {
      const cloned = game.clone();
      // To keep search fast in browser JS, limit depth 3 to top candidate moves
      const ordered = this.orderMoves(legalMoves, cloned).slice(0, 24);
      let bestMove = ordered[0];
      let bestScore = isMaximizing ? -Infinity : Infinity;
      let alpha = -Infinity;
      let beta = Infinity;

      for (const move of ordered) {
        cloned.makeMove(move);
        const result = this.alphaBeta(cloned, 2, alpha, beta, !isMaximizing);
        cloned.undoMove();

        if (isMaximizing) {
          if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = move;
          }
          alpha = Math.max(alpha, result.score);
        } else {
          if (result.score < bestScore) {
            bestScore = result.score;
            bestMove = move;
          }
          beta = Math.min(beta, result.score);
        }
        if (beta <= alpha) break;
      }

      return bestMove;
    }

    return legalMoves[0];
  }
}
