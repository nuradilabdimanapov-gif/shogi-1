/**
 * Shogi Engine Test Suite
 * Executed via macOS JavaScriptCore (jsc)
 */

// Mock browser objects if running in jsc
if (typeof window === 'undefined') {
  globalThis.window = globalThis;
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => null
  };
  globalThis.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => null
  };
}

// Load bundle or engine classes
load('js/bundle.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
  print('  ✓ ' + message);
}

print('=== Running Shogi Engine Tests ===\n');

// Test 1: Initial Game State
print('1. Initial Board State:');
const game = new ShogiGame();
assert(game.board.length === 9, 'Board has 9 rows');
assert(game.board[0].length === 9, 'Board has 9 columns');
assert(game.turn === SENTE, 'Sente starts first');

let pieceCount = 0;
let sentePieces = 0;
let gotePieces = 0;
for (let y = 0; y < 9; y++) {
  for (let x = 0; x < 9; x++) {
    const p = game.board[y][x];
    if (p) {
      pieceCount++;
      if (p.player === SENTE) sentePieces++;
      else gotePieces++;
    }
  }
}
assert(pieceCount === 40, 'Total pieces on board is 40');
assert(sentePieces === 20, 'Sente has 20 pieces');
assert(gotePieces === 20, 'Gote has 20 pieces');

// Test 2: Legal Opening Moves
print('\n2. Move Generation:');
const legalMoves = game.getLegalMoves(SENTE);
assert(legalMoves.length === 30, 'Sente has 30 legal opening moves (9 pawns + 2 lances[blocked: 0] wait: 9 pawns + 2 knights + bishop + rook options)');
print('  (Generated ' + legalMoves.length + ' opening moves for Sente)');

// Test 3: Standard Opening Pawn Push (7g to 7f -> x=2, y=6 to x=2, y=5)
print('\n3. Executing Moves:');
// 7g is File 7 (x = 9 - 7 = 2), Rank 7 (y = 6)
// 7f is File 7 (x = 2), Rank 6 (y = 5)
const move1 = {
  from: { x: 2, y: 6 },
  to: { x: 2, y: 5 },
  isDrop: false,
  promote: false,
  pieceType: PAWN
};
assert(game.makeMove(move1), 'Move 7g-7f executed successfully');
assert(game.board[5][2].type === PAWN, 'Pawn is now at 7f');
assert(game.board[6][2] === null, 'Original square 7g is empty');
assert(game.turn === GOTE, 'Turn switched to Gote');

// Gote pawn push 3c to 3d (File 3 -> x = 9 - 3 = 6, Rank 3 -> y = 2 to Rank 4 -> y = 3)
const move2 = {
  from: { x: 6, y: 2 },
  to: { x: 6, y: 3 },
  isDrop: false,
  promote: false,
  pieceType: PAWN
};
assert(game.makeMove(move2), 'Gote move 3c-3d executed successfully');
assert(game.turn === SENTE, 'Turn switched back to Sente');

// Test 4: Undo Move
print('\n4. Undo Move:');
const undone = game.undoMove();
assert(undone !== null, 'Undo succeeded');
assert(game.turn === GOTE, 'Turn reverted to Gote');
assert(game.board[3][6] === null, '3d square is empty after undo');
assert(game.board[2][6].type === PAWN, 'Pawn is back at 3c');

// Re-apply Gote move
game.makeMove(move2);

// Test 5: Capture and Komadai (Piece in Hand)
print('\n5. Captures and In-Hand Pieces:');
// Sente moves Bishop from 8h (x=1, y=7) to 2b (x=7, y=1) capturing Gote Bishop!
const captureMove = {
  from: { x: 1, y: 7 },
  to: { x: 7, y: 1 },
  isDrop: false,
  promote: true, // Promotes to Horse
  pieceType: BISHOP
};
assert(game.makeMove(captureMove), 'Bishop captured Gote Bishop at 2b and promoted to Horse');
assert(game.board[1][7].type === PROM_BISHOP, 'Piece at 2b is now Horse (+B)');
assert(game.hands[SENTE][BISHOP] === 1, 'Sente now has 1 captured Bishop in hand');

// Test 6: Drop piece from hand
print('\n6. Dropping Pieces (Uchi):');
// Gote recaptures Horse with Silver from 3a (x=6, y=0) to 2b (x=7, y=1)
const goteRecapture = {
  from: { x: 6, y: 0 },
  to: { x: 7, y: 1 },
  isDrop: false,
  promote: false,
  pieceType: SILVER
};
assert(game.makeMove(goteRecapture), 'Gote Silver recaptured Horse at 2b');
assert(game.hands[GOTE][BISHOP] === 1, 'Gote now has captured Bishop in hand');

// Now Sente drops Bishop from hand at 4e (x=5, y=4)
const dropMove = {
  isDrop: true,
  pieceType: BISHOP,
  to: { x: 5, y: 4 },
  promote: false
};
assert(game.makeMove(dropMove), 'Sente dropped Bishop at 4e');
assert(game.board[4][5].type === BISHOP, 'Bishop is now on board at 4e');
assert(game.hands[SENTE][BISHOP] === 0, 'Sente hand Bishop count is now 0');

// Test 7: Nifu (Two Pawns Rule)
print('\n7. Nifu (Two Pawns) Rule Verification:');
const testNifuGame = new ShogiGame();
testNifuGame.hands[SENTE][PAWN] = 1;
// Column x=2 already has Sente pawn at 7g (y=6).
// Verify that dropping a Pawn in column x=2 is NOT in legal moves
const senteDrops = testNifuGame.getPseudoDrops(SENTE);
const illegalNifuDrop = senteDrops.find(d => d.pieceType === PAWN && d.to.x === 2);
assert(illegalNifuDrop === undefined, 'Nifu rule properly prevented dropping pawn on file with friendly pawn');

// Test 8: AI Evaluation
print('\n8. AI Heuristic Evaluation:');
const ai = new ShogiAI('tactician');
const evalScore = ai.evaluatePosition(testNifuGame);
assert(typeof evalScore === 'number', 'AI evaluation returns numerical score: ' + evalScore);

print('\n🎉 ALL SHOGI ENGINE TESTS PASSED SUCCESSFULLY! 🎉\n');
