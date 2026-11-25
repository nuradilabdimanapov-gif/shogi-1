/**
 * Shogi Web - Post-Game Move Analyzer
 * Evaluates every ply of a finished game and classifies moves into:
 * Brilliant (!!), Great (!), Medium (✓), Bad (?!), Terrible (??)
 */

import { SENTE, GOTE } from './constants.js';
import { ShogiGame } from './shogi.js';
import { ShogiAI } from './ai.js';

export const MOVE_QUALITIES = {
  brilliant: { symbol: '!!', color: '#22d3ee', label_en: 'Brilliant', label_ja: '妙手', label_ru: 'Блестящий' },
  great:     { symbol: '!',  color: '#3b82f6', label_en: 'Great',     label_ja: '好手', label_ru: 'Отличный' },
  medium:    { symbol: '✓',  color: '#4ade80', label_en: 'Medium',    label_ja: '普通', label_ru: 'Хороший' },
  bad:       { symbol: '?!', color: '#f59e0b', label_en: 'Bad',       label_ja: '疑問手', label_ru: 'Неточный' },
  terrible:  { symbol: '??', color: '#ef4444', label_en: 'Terrible',  label_ja: '悪手', label_ru: 'Зевок' }
};

export class GameAnalyzer {
  constructor() {
    this.ai = new ShogiAI('apprentice');
  }

  scoreMove(game, move, player) {
    const cloned = game.clone();
    cloned.makeMove(move);

    if (cloned.status === 'checkmate') {
      return 50000;
    }

    // Evaluate from SENTE perspective, then flip if player is GOTE
    let score = this.ai.evaluatePosition(cloned);
    if (player === GOTE) score = -score;

    // Bonus for giving check
    if (cloned.inCheck) score += 35;

    return score;
  }

  movesMatch(a, b) {
    if (!a || !b) return false;
    if (Boolean(a.isDrop) !== Boolean(b.isDrop)) return false;
    if (a.isDrop) {
      return a.pieceType === b.pieceType && a.to.x === b.to.x && a.to.y === b.to.y;
    }
    return (
      a.from && b.from &&
      a.from.x === b.from.x && a.from.y === b.from.y &&
      a.to.x === b.to.x && a.to.y === b.to.y &&
      Boolean(a.promote) === Boolean(b.promote)
    );
  }

  analyzeGame(moveHistory) {
    const sim = new ShogiGame();
    const results = [];

    const counts = {
      [SENTE]: { brilliant: 0, great: 0, medium: 0, bad: 0, terrible: 0, totalLoss: 0, totalMoves: 0 },
      [GOTE]:  { brilliant: 0, great: 0, medium: 0, bad: 0, terrible: 0, totalLoss: 0, totalMoves: 0 }
    };

    for (let ply = 0; ply < moveHistory.length; ply++) {
      const played = moveHistory[ply];
      const player = sim.turn;
      const legalMoves = sim.getLegalMoves(player);

      let bestScore = -Infinity;
      let secondBestScore = -Infinity;
      let bestMove = null;
      let playedScore = null;

      // Sample up to 45 top tactical/legal moves for speed while always including the played move
      let candidates = legalMoves;
      if (legalMoves.length > 45) {
        candidates = this.ai.orderMoves(sim, legalMoves).slice(0, 45);
        if (!candidates.some(m => this.movesMatch(m, played))) {
          candidates.push(played);
        }
      }

      for (const m of candidates) {
        const s = this.scoreMove(sim, m, player);
        if (s > bestScore) {
          secondBestScore = bestScore;
          bestScore = s;
          bestMove = m;
        } else if (s > secondBestScore) {
          secondBestScore = s;
        }
        if (this.movesMatch(m, played)) {
          playedScore = s;
        }
      }

      if (playedScore === null) {
        playedScore = this.scoreMove(sim, played, player);
      }

      const cpLoss = Math.max(0, bestScore - playedScore);
      const isOnlyMove = (bestScore - secondBestScore) >= 160 && cpLoss <= 15;
      const isMate = playedScore >= 40000;

      // Check if move is a bold tactical capture/check into a contested square
      let isSacrificeTactic = false;
      if (!played.isDrop && cpLoss <= 20 && ply >= 4) {
        const destBefore = sim.getPiece(played.to.x, played.to.y);
        if (destBefore && destBefore.player !== player && bestScore > 120) {
          isSacrificeTactic = true;
        }
      }

      let quality = 'medium';
      if ((isOnlyMove || isMate || (isSacrificeTactic && played.promote)) && cpLoss <= 15) {
        quality = 'brilliant';
      } else if (cpLoss <= 25) {
        quality = 'great';
      } else if (cpLoss <= 95) {
        quality = 'medium';
      } else if (cpLoss <= 240) {
        quality = 'bad';
      } else {
        quality = 'terrible';
      }

      // Compute Sente-perspective eval after the move
      sim.makeMove({
        from: played.from,
        to: played.to,
        promote: played.promote,
        isDrop: played.isDrop,
        pieceType: played.pieceType
      });

      const senteEval = sim.status === 'checkmate'
        ? (sim.winner === SENTE ? 9999 : -9999)
        : this.ai.evaluatePosition(sim);

      counts[player][quality]++;
      counts[player].totalLoss += Math.min(cpLoss, 500);
      counts[player].totalMoves++;

      results.push({
        ply,
        player,
        quality,
        symbol: MOVE_QUALITIES[quality].symbol,
        color: MOVE_QUALITIES[quality].color,
        cpLoss: Math.round(cpLoss),
        senteEval: Math.round(senteEval),
        bestMoveNotation: bestMove ? sim.formatNotation(bestMove, null) : ''
      });
    }

    const calcAccuracy = (c) => {
      if (c.totalMoves === 0) return 100;
      const avgLoss = c.totalLoss / c.totalMoves;
      return Math.max(10, Math.min(99.9, Math.round((100 - avgLoss * 0.22) * 10) / 10));
    };

    return {
      moves: results,
      summary: {
        senteAccuracy: calcAccuracy(counts[SENTE]),
        goteAccuracy: calcAccuracy(counts[GOTE]),
        senteCounts: counts[SENTE],
        goteCounts: counts[GOTE]
      }
    };
  }
}
