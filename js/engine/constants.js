/**
 * Shogi Web - Constants and Game Definitions
 */

// Players
export const SENTE = 0; // Black (First to move, moves upwards, bottom)
export const GOTE = 1;  // White (Second to move, moves downwards, top)

// Piece Types
export const KING = 'K';
export const ROOK = 'R';
export const BISHOP = 'B';
export const GOLD = 'G';
export const SILVER = 'S';
export const KNIGHT = 'N';
export const LANCE = 'L';
export const PAWN = 'P';

// Promoted Pieces
export const PROM_ROOK = '+R';     // Dragon (竜王)
export const PROM_BISHOP = '+B';   // Horse (竜馬)
export const PROM_SILVER = '+S';   // Narigin (成銀)
export const PROM_KNIGHT = '+N';   // Narikei (成桂)
export const PROM_LANCE = '+L';    // Narikyo (成香)
export const PROM_PAWN = '+P';     // Tokin (と金)

// Piece Metadata
export const PIECE_INFO = {
  [KING]: {
    name: 'King',
    kanjiSente: '王将',
    kanjiGote: '玉将',
    kanji1: '王',
    kanji1Gote: '玉',
    symbol: 'K',
    promotesTo: null,
    value: 10000,
    drops: false
  },
  [ROOK]: {
    name: 'Rook',
    kanjiSente: '飛車',
    kanjiGote: '飛車',
    kanji1: '飛',
    symbol: 'R',
    promotesTo: PROM_ROOK,
    value: 1000,
    drops: true
  },
  [PROM_ROOK]: {
    name: 'Dragon',
    kanjiSente: '竜王',
    kanjiGote: '竜王',
    kanji1: '竜',
    symbol: '+R',
    unpromoted: ROOK,
    value: 1300,
    drops: false
  },
  [BISHOP]: {
    name: 'Bishop',
    kanjiSente: '角行',
    kanjiGote: '角行',
    kanji1: '角',
    symbol: 'B',
    promotesTo: PROM_BISHOP,
    value: 850,
    drops: true
  },
  [PROM_BISHOP]: {
    name: 'Horse',
    kanjiSente: '竜馬',
    kanjiGote: '竜馬',
    kanji1: '馬',
    symbol: '+B',
    unpromoted: BISHOP,
    value: 1150,
    drops: false
  },
  [GOLD]: {
    name: 'Gold General',
    kanjiSente: '金将',
    kanjiGote: '金将',
    kanji1: '金',
    symbol: 'G',
    promotesTo: null,
    value: 550,
    drops: true
  },
  [SILVER]: {
    name: 'Silver General',
    kanjiSente: '銀将',
    kanjiGote: '銀将',
    kanji1: '銀',
    symbol: 'S',
    promotesTo: PROM_SILVER,
    value: 450,
    drops: true
  },
  [PROM_SILVER]: {
    name: 'Promoted Silver',
    kanjiSente: '成銀',
    kanjiGote: '成銀',
    kanji1: '全',
    symbol: '+S',
    unpromoted: SILVER,
    value: 540,
    drops: false
  },
  [KNIGHT]: {
    name: 'Knight',
    kanjiSente: '桂馬',
    kanjiGote: '桂馬',
    kanji1: '桂',
    symbol: 'N',
    promotesTo: PROM_KNIGHT,
    value: 350,
    drops: true
  },
  [PROM_KNIGHT]: {
    name: 'Promoted Knight',
    kanjiSente: '成桂',
    kanjiGote: '成桂',
    kanji1: '圭',
    symbol: '+N',
    unpromoted: KNIGHT,
    value: 530,
    drops: false
  },
  [LANCE]: {
    name: 'Lance',
    kanjiSente: '香車',
    kanjiGote: '香車',
    kanji1: '香',
    symbol: 'L',
    promotesTo: PROM_LANCE,
    value: 320,
    drops: true
  },
  [PROM_LANCE]: {
    name: 'Promoted Lance',
    kanjiSente: '成香',
    kanjiGote: '成香',
    kanji1: '杏',
    symbol: '+L',
    unpromoted: LANCE,
    value: 520,
    drops: false
  },
  [PAWN]: {
    name: 'Pawn',
    kanjiSente: '歩兵',
    kanjiGote: '歩兵',
    kanji1: '歩',
    symbol: 'P',
    promotesTo: PROM_PAWN,
    value: 100,
    drops: true
  },
  [PROM_PAWN]: {
    name: 'Tokin',
    kanjiSente: 'と金',
    kanjiGote: 'と金',
    kanji1: 'と',
    symbol: '+P',
    unpromoted: PAWN,
    value: 520,
    drops: false
  }
};

// Kanji numbers for ranks (1-9)
export const KANJI_RANKS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const KANJI_FILES = ['１', '２', '３', '４', '５', '６', '７', '８', '９'];

// Movement direction vectors
// Board is indexed [y][x] where:
// y: 0 to 8 (Rank 1 to 9)
// x: 0 to 8 (File 9 to 1: x=0 is File 9, x=8 is File 1)
// For Sente, "forward" is y - 1 (dy = -1). For Gote, "forward" is y + 1 (dy = +1).

export const STEP_MOVES = {
  // King: 8 directions, 1 step
  [KING]: [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ],
  // Gold (relative to Sente forward dy = -1):
  // Forward, forward-left, forward-right, left, right, backward
  [GOLD]: [
    [0, -1], [-1, -1], [1, -1],
    [-1, 0],           [1, 0],
             [0, 1]
  ],
  // Silver (relative to Sente):
  // Forward, 4 diagonals
  [SILVER]: [
    [0, -1], [-1, -1], [1, -1],
    [-1, 1],           [1, 1]
  ],
  // Pawn (relative to Sente): 1 step forward
  [PAWN]: [
    [0, -1]
  ],
  // Knight (relative to Sente): 2 forward, 1 left or right
  [KNIGHT]: [
    [-1, -2], [1, -2]
  ]
};

// Sliding moves (delta per step, repeated until edge or piece)
export const SLIDING_MOVES = {
  // Lance (Sente: forward only)
  [LANCE]: [
    [0, -1]
  ],
  // Bishop: 4 diagonals
  [BISHOP]: [
    [-1, -1], [1, -1],
    [-1, 1],  [1, 1]
  ],
  // Rook: 4 orthogonals
  [ROOK]: [
    [0, -1], [0, 1],
    [-1, 0], [1, 0]
  ]
};

// Promoted pieces share movements:
// Tokin, Promoted Silver, Promoted Knight, Promoted Lance all move exactly like Gold!
STEP_MOVES[PROM_PAWN] = STEP_MOVES[GOLD];
STEP_MOVES[PROM_SILVER] = STEP_MOVES[GOLD];
STEP_MOVES[PROM_KNIGHT] = STEP_MOVES[GOLD];
STEP_MOVES[PROM_LANCE] = STEP_MOVES[GOLD];

// Dragon (+R): Rook sliding + King 1-step diagonals
export const DRAGON_STEP = [
  [-1, -1], [1, -1],
  [-1, 1],  [1, 1]
];

// Horse (+B): Bishop sliding + King 1-step orthogonals
export const HORSE_STEP = [
  [0, -1], [0, 1],
  [-1, 0], [1, 0]
];

// Initial Board Layout (standard 9x9)
// null means empty square
// Piece object format: { type: 'K', player: SENTE }
export function getInitialBoard() {
  const board = Array(9).fill(null).map(() => Array(9).fill(null));

  // Gote back rank (Rank 1 / y=0)
  board[0][0] = { type: LANCE, player: GOTE };
  board[0][1] = { type: KNIGHT, player: GOTE };
  board[0][2] = { type: SILVER, player: GOTE };
  board[0][3] = { type: GOLD, player: GOTE };
  board[0][4] = { type: KING, player: GOTE };
  board[0][5] = { type: GOLD, player: GOTE };
  board[0][6] = { type: SILVER, player: GOTE };
  board[0][7] = { type: KNIGHT, player: GOTE };
  board[0][8] = { type: LANCE, player: GOTE };

  // Gote rank 2 (y=1): Bishop at 2b (x=7), Rook at 8b (x=1)
  board[1][1] = { type: ROOK, player: GOTE };   // File 8 (x=1)
  board[1][7] = { type: BISHOP, player: GOTE }; // File 2 (x=7)

  // Gote rank 3 (y=2): Pawns
  for (let x = 0; x < 9; x++) {
    board[2][x] = { type: PAWN, player: GOTE };
  }

  // Sente rank 7 (y=6): Pawns
  for (let x = 0; x < 9; x++) {
    board[6][x] = { type: PAWN, player: SENTE };
  }

  // Sente rank 8 (y=7): Bishop at 8h (x=1), Rook at 2h (x=7)
  board[7][1] = { type: BISHOP, player: SENTE }; // File 8 (x=1)
  board[7][7] = { type: ROOK, player: SENTE };   // File 2 (x=7)

  // Sente rank 9 (y=8): Back rank
  board[8][0] = { type: LANCE, player: SENTE };
  board[8][1] = { type: KNIGHT, player: SENTE };
  board[8][2] = { type: SILVER, player: SENTE };
  board[8][3] = { type: GOLD, player: SENTE };
  board[8][4] = { type: KING, player: SENTE };
  board[8][5] = { type: GOLD, player: SENTE };
  board[8][6] = { type: SILVER, player: SENTE };
  board[8][7] = { type: KNIGHT, player: SENTE };
  board[8][8] = { type: LANCE, player: SENTE };

  return board;
}
