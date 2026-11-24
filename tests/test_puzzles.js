/**
 * Shogi Puzzles & Checkmate Verification Tests
 */

if (typeof window === 'undefined') {
  globalThis.window = globalThis;
  globalThis.localStorage = { getItem: () => null, setItem: () => null };
  globalThis.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => null };
}

load('js/bundle.js');

function assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
  print('  ✓ ' + message);
}

print('=== Running Checkmate & Tsumeshogi Tests ===\n');

// Test 1: Puzzle 1 - Atama-kin (Head King Mate)
print('1. Verifying Tsumeshogi Puzzle 1 (Head King Mate in 1):');
const p1 = TSUMESHOGI_PUZZLES[0];
const setup1 = p1.setup();

const g1 = new ShogiGame();
g1.board = setup1.board;
g1.hands = setup1.hands;
g1.turn = setup1.turn;

// Solution: Drop Gold at 1b (x=8, y=1)
const sol1 = setup1.solutions[0];
const dropGoldMove = {
  isDrop: true,
  pieceType: sol1.pieceType,
  to: sol1.to,
  promote: false
};

assert(g1.makeMove(dropGoldMove), 'Gold dropped at 1b');
assert(g1.inCheck === true, 'Gote King is placed in Check');
assert(g1.status === 'checkmate', 'Gote is in Checkmate (Tsumi)!');
assert(g1.winner === SENTE, 'Sente is declared winner!');

// Test 2: Uchifuzume (Illegal Pawn-Drop Checkmate) Rule Check
print('\n2. Verifying Uchifuzume Rule:');
// Create a position where King is cornered and dropping a Pawn WOULD be mate:
// Gote King at 1a (x=8, y=0), friendly Sente Rook at 1c (x=8, y=2), Sente Gold at 2b (x=7, y=1)
const uchifuzumeGame = new ShogiGame();
uchifuzumeGame.board = Array(9).fill(null).map(() => Array(9).fill(null));
uchifuzumeGame.board[0][8] = { type: KING, player: GOTE }; // 1a
uchifuzumeGame.board[2][8] = { type: ROOK, player: SENTE }; // 1c
uchifuzumeGame.board[1][7] = { type: GOLD, player: SENTE }; // 2b
uchifuzumeGame.board[2][7] = { type: SILVER, player: SENTE }; // 2c defends 2b
// Sente has Pawn in hand
uchifuzumeGame.hands[SENTE] = { [PAWN]: 1, [LANCE]: 0, [KNIGHT]: 0, [SILVER]: 0, [GOLD]: 0, [BISHOP]: 0, [ROOK]: 0 };
uchifuzumeGame.turn = SENTE;

// Dropping Pawn at 1b (x=8, y=1) would be checkmate!
// Since it's a drop pawn checkmate, Uchifuzume rule MUST deem this drop ILLEGAL!
const legalMoves = uchifuzumeGame.getLegalMoves(SENTE);
const pawnDropAt1b = legalMoves.find(m => m.isDrop && m.pieceType === PAWN && m.to.x === 8 && m.to.y === 1);
assert(pawnDropAt1b === undefined, 'Uchifuzume correctly prevented dropping a Pawn to deliver immediate checkmate');

// But dropping a LANCE or GOLD at 1b IS legal!
uchifuzumeGame.hands[SENTE][GOLD] = 1;
const legalMovesWithGold = uchifuzumeGame.getLegalMoves(SENTE);
const goldDropAt1b = legalMovesWithGold.find(m => m.isDrop && m.pieceType === GOLD && m.to.x === 8 && m.to.y === 1);
assert(goldDropAt1b !== undefined, 'Dropping a Gold to mate is completely legal');

print('\n🎉 ALL TSUMESHOGI & UCHIFUZUME TESTS PASSED! 🎉\n');
