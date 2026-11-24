/**
 * Shogi Web - Tsumeshogi Puzzles Database
 * Mate-in-1 and Mate-in-3 classic tactical problems with automated verification.
 */

import {
  SENTE, GOTE,
  KING, ROOK, BISHOP, GOLD, SILVER, KNIGHT, LANCE, PAWN,
  PROM_ROOK, PROM_BISHOP, PROM_SILVER, PROM_KNIGHT, PROM_LANCE, PROM_PAWN
} from './constants.js';

export const TSUMESHOGI_PUZZLES = [
  {
    id: 1,
    title: 'The Golden Crown (Atama-kin / 頭金)',
    type: 'Mate in 1',
    difficulty: 'Beginner',
    hint: 'Drop your Gold directly in front of the enemy King, protected by your Rook.',
    description: 'The most fundamental mating pattern in Shogi: dropping a Gold directly in front of the King.',
    setup: () => {
      const board = Array(9).fill(null).map(() => Array(9).fill(null));
      // Gote King at 1a (x=8, y=0)
      board[0][8] = { type: KING, player: GOTE };
      // Sente Rook at 1d (x=8, y=3) with open file
      board[3][8] = { type: ROOK, player: SENTE };
      // Gote pawn at 2c (x=7, y=2)
      board[2][7] = { type: PAWN, player: GOTE };

      const hands = {
        [SENTE]: { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 1, [BISHOP]: 0, [ROOK]: 0 },
        [GOTE]:  { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 }
      };

      return {
        board,
        hands,
        turn: SENTE,
        solutions: [
          // Drop Gold at 1b (x=8, y=1)
          { isDrop: true, pieceType: GOLD, to: { x: 8, y: 1 } }
        ]
      };
    }
  },
  {
    id: 2,
    title: 'Dragon Strike (Ryu no Oute)',
    type: 'Mate in 1',
    difficulty: 'Beginner',
    hint: 'Use your Promoted Rook (Dragon) to cut off all escape routes.',
    description: 'Promoted Rooks (Dragons) control orthogonals and diagonals, creating tight mating nets.',
    setup: () => {
      const board = Array(9).fill(null).map(() => Array(9).fill(null));
      // Gote King at 2a (x=7, y=0)
      board[0][7] = { type: KING, player: GOTE };
      // Friendly Sente Silver at 1a (x=8, y=0)
      board[0][8] = { type: SILVER, player: SENTE };
      // Sente Dragon at 4b (x=5, y=1)
      board[1][5] = { type: PROM_ROOK, player: SENTE };

      const hands = {
        [SENTE]: { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 },
        [GOTE]:  { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 }
      };

      return {
        board,
        hands,
        turn: SENTE,
        solutions: [
          // Move Dragon from 4b (5, 1) to 2b (7, 1)
          { isDrop: false, from: { x: 5, y: 1 }, to: { x: 7, y: 1 } }
        ]
      };
    }
  },
  {
    id: 3,
    title: 'The Silver Pincer',
    type: 'Mate in 1',
    difficulty: 'Beginner',
    hint: 'Silver can move diagonally backward to check and block simultaneously.',
    description: 'A key difference between Silver and Gold is that Silver can retreat diagonally.',
    setup: () => {
      const board = Array(9).fill(null).map(() => Array(9).fill(null));
      // Gote King at 2a (x=7, y=0)
      board[0][7] = { type: KING, player: GOTE };
      // Sente Horse (+B) at 4c (x=5, y=2)
      board[2][5] = { type: PROM_BISHOP, player: SENTE };

      const hands = {
        [SENTE]: { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 1, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 },
        [GOTE]:  { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 }
      };

      return {
        board,
        hands,
        turn: SENTE,
        solutions: [
          // Drop Silver at 2b (x=7, y=1)
          { isDrop: true, pieceType: SILVER, to: { x: 7, y: 1 } }
        ]
      };
    }
  },
  {
    id: 4,
    title: 'Silver Sacrifice Mating Net',
    type: 'Mate in 3',
    difficulty: 'Intermediate',
    hint: 'First sacrifice the Silver to lure the King to rank 1, then deliver the final Gold drop.',
    description: 'A standard tactical pattern: draw the King into the corner, then strike with in-hand Gold.',
    setup: () => {
      const board = Array(9).fill(null).map(() => Array(9).fill(null));
      // Gote King at 2b (x=7, y=1)
      board[1][7] = { type: KING, player: GOTE };
      // Gote pawn at 1c (x=8, y=2)
      board[2][8] = { type: PAWN, player: GOTE };
      // Sente Lance at 1i (x=8, y=8)
      board[8][8] = { type: LANCE, player: SENTE };

      const hands = {
        [SENTE]: { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 1, [GOLD]: 1, [BISHOP]: 0, [ROOK]: 0 },
        [GOTE]:  { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 }
      };

      return {
        board,
        hands,
        turn: SENTE,
        sequence: [
          // Step 1: Drop Silver at 2a (7, 0)
          { move: { isDrop: true, pieceType: SILVER, to: { x: 7, y: 0 } } },
          // Defense: King takes Silver at 2a (7, 0)
          { response: { from: { x: 7, y: 1 }, to: { x: 7, y: 0 } } },
          // Step 3: Drop Gold at 2b (7, 1) - Mate!
          { move: { isDrop: true, pieceType: GOLD, to: { x: 7, y: 1 } } }
        ]
      };
    }
  },
  {
    id: 5,
    title: 'Knight Jump Ambush',
    type: 'Mate in 3',
    difficulty: 'Intermediate',
    hint: 'Drop a Knight to jump the defense, forcing the King away, then finish with Gold.',
    description: 'Knights are the only pieces that can jump over other pieces.',
    setup: () => {
      const board = Array(9).fill(null).map(() => Array(9).fill(null));
      // Gote King at 3a (x=6, y=0)
      board[0][6] = { type: KING, player: GOTE };
      // Gote Gold at 4a (x=5, y=0)
      board[0][5] = { type: GOLD, player: GOTE };
      // Gote Silver at 2a (x=7, y=0)
      board[0][7] = { type: SILVER, player: GOTE };
      // Sente Tokin at 4c (x=5, y=2)
      board[2][5] = { type: PROM_PAWN, player: SENTE };

      const hands = {
        [SENTE]: { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 1, [SILVER]: 0, [GOLD]: 1, [BISHOP]: 0, [ROOK]: 0 },
        [GOTE]:  { [PAWN]: 0, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 }
      };

      return {
        board,
        hands,
        turn: SENTE,
        sequence: [
          // Step 1: Drop Knight at 2c (7, 2)
          { move: { isDrop: true, pieceType: KNIGHT, to: { x: 7, y: 2 } } },
          // Defense: King escapes to 3b (6, 1)
          { response: { from: { x: 6, y: 0 }, to: { x: 6, y: 1 } } },
          // Step 3: Drop Gold at 3c (6, 2) - Mate!
          { move: { isDrop: true, pieceType: GOLD, to: { x: 6, y: 2 } } }
        ]
      };
    }
  }
];
