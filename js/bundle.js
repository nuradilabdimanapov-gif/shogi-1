/**
 * Shogi Web - Complete Standalone Bundle
 */
(function(root) {
'use strict';

// --- Begin: js/engine/constants.js ---
/**
 * Shogi Web - Constants and Game Definitions
 */

// Players
const SENTE = 0; // Black (First to move, moves upwards, bottom)
const GOTE = 1;  // White (Second to move, moves downwards, top)

// Piece Types
const KING = 'K';
const ROOK = 'R';
const BISHOP = 'B';
const GOLD = 'G';
const SILVER = 'S';
const KNIGHT = 'N';
const LANCE = 'L';
const PAWN = 'P';

// Promoted Pieces
const PROM_ROOK = '+R';     // Dragon (竜王)
const PROM_BISHOP = '+B';   // Horse (竜馬)
const PROM_SILVER = '+S';   // Narigin (成銀)
const PROM_KNIGHT = '+N';   // Narikei (成桂)
const PROM_LANCE = '+L';    // Narikyo (成香)
const PROM_PAWN = '+P';     // Tokin (と金)

// Piece Metadata
const PIECE_INFO = {
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
const KANJI_RANKS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const KANJI_FILES = ['１', '２', '３', '４', '５', '６', '７', '８', '９'];

// Movement direction vectors
// Board is indexed [y][x] where:
// y: 0 to 8 (Rank 1 to 9)
// x: 0 to 8 (File 9 to 1: x=0 is File 9, x=8 is File 1)
// For Sente, "forward" is y - 1 (dy = -1). For Gote, "forward" is y + 1 (dy = +1).

const STEP_MOVES = {
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
const SLIDING_MOVES = {
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
const DRAGON_STEP = [
  [-1, -1], [1, -1],
  [-1, 1],  [1, 1]
];

// Horse (+B): Bishop sliding + King 1-step orthogonals
const HORSE_STEP = [
  [0, -1], [0, 1],
  [-1, 0], [1, 0]
];

// Initial Board Layout (standard 9x9)
// null means empty square
// Piece object format: { type: 'K', player: SENTE }
function getInitialBoard() {
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


// --- Begin: js/i18n.js ---
/**
 * Shogi Web - Internationalization (i18n) Module
 * Supports English (en) and Japanese (ja)
 */

const TRANSLATIONS = {
  en: {
    // Brand & Header
    brandTitle: 'SHOGI WEB',
    brandTagline: 'The Art & Strategy of Japanese Chess',
    tabPlayAi: 'Play vs AI',
    tabPvp: 'Pass & Play',
    tabPuzzle: 'Tsumeshogi',
    tabAcademy: 'Academy',
    btnSound: 'Sound',
    btnUnmute: 'Unmute',
    btnFlip: 'Flip',
    btnSettings: 'Settings',
    btnAccount: 'Account',
    btnSignIn: 'Sign In',

    // Player Panels
    senteRole: 'Sente (先手 / Black)',
    goteRole: 'Gote (後手 / White)',
    komadai: 'Komadai (Stand)',
    komadaiEmpty: 'None',
    aiOpponent: 'AI Opponent',
    guestUser: 'Guest Player',
    aiThinking: 'AI is contemplating move...',

    // Settings
    settingsTitle: 'Game Settings',
    settingsLanguage: 'Language',
    settingsBgm: 'Traditional Japanese BGM',
    settingsBgmDesc: 'Procedural Koto & Shakuhachi ambient melodies',
    settingsBgmVolume: 'Music Volume',
    settingsSfx: 'Sound Effects (Piece Clack)',
    settingsTheme: 'Board & Aesthetic Theme',
    settingsPieceStyle: 'Piece Inscriptions',
    themeKaya: 'Traditional Kaya Wood (本榧)',
    themeZen: 'Zen Slate Dark (玄昌石)',
    themeSakura: 'Cherry Blossom Sakura (桜)',
    pieceKanji2: 'Traditional (2 Kanji - 王将, 飛車)',
    pieceKanji1: 'Simplified (1 Kanji - 王, 飛, 竜)',
    pieceGuide: 'Beginner Guide (Dots show moves!)',
    pieceWestern: 'International (K, R, +R symbols)',
    btnClose: 'Close',

    // Match Config
    matchSettings: 'Match Settings',
    aiDifficulty: 'AI Difficulty',
    diffNovice: 'Novice (初級) - Gentle & forgiving',
    diffApprentice: 'Apprentice (中級) - Good for practice',
    diffTactician: 'Tactician (上級) - Sharp & strategic',
    diffMaster: 'Master (有段者) - Deep calculation',
    playAs: 'Play As',
    senteFirst: '☗ Sente (First / Black)',
    goteSecond: '☖ Gote (Second / White)',
    btnNewGame: '⚔️ New Game',
    btnTakeBack: '↩ Take Back',
    btnResign: '🏳️ Resign',
    btnExportSfen: '📋 Export SFEN',
    moveHistory: 'Move History',
    noMovesYet: 'No moves recorded yet. Make your opening move!',

    // Status Announcements
    turnToMove: 'to move.',
    turnSente: 'Sente (Black / 先手)',
    turnGote: 'Gote (White / 後手)',
    statusCheck: 'Check (王手)!',
    statusCheckmate: 'Checkmate (詰み)!',
    statusWins: 'Wins!',
    statusResign: 'Resignation',
    statusRepetition: 'Draw by Sennichite (千日手) — 4-fold repetition!',
    statusStalemate: 'Draw — Stalemate!',
    confirmResign: 'Are you sure you want to resign? (投了しますか？)',
    confirmNewGame: 'Start a new game?',

    // Promotion Modal
    promoTitle: 'Promote Piece?',
    promoSubtitle: 'Entering the enemy promotion zone unlocks advanced powers (成る).',
    promoYes: '✨ Promote (成る)',
    promoNo: 'Keep As-Is (不成)',

    // Accounts & Rating
    accountTitle: 'Player Account & Rating',
    accountCreate: 'Create Shogi Account',
    accountLogin: 'Sign In to Your Account',
    accountUsername: 'Username',
    accountPassword: 'Password (PIN or password)',
    accountSubmitCreate: 'Create Account & Play',
    accountSubmitLogin: 'Sign In',
    accountSwitch: 'Switch Account / Logout',
    accountRating: 'Rating (ELO)',
    accountRank: 'Shogi Rank',
    accountStats: 'Record',
    accountWins: 'Wins',
    accountLosses: 'Losses',
    accountDraws: 'Draws',
    accountWinrate: 'Win Rate',
    accountRequireNotice: 'Please sign in or create an account to start playing and track your rating!',
    accountGuestPrompt: 'No account yet? Create one in seconds!',
    accountLoginPrompt: 'Already have an account? Sign in here.',

    // Puzzles & Academy
    puzzleHeader: 'Tsumeshogi Problem',
    puzzleHint: 'Hint:',
    puzzleSuccess: '🎉 Correct! Mating move delivered (詰み)!',
    puzzleFail: '❌ Not quite. The enemy King escapes! Try again.',
    puzzleInfo: 'Good move! Now deliver the finishing checkmate.',
    btnPrev: '◀ Prev',
    btnRetry: '↺ Retry',
    btnNext: 'Next ▶',
    btnNextLesson: 'Next Lesson ▶',

    // Landing Page & Match Setup
    btnHome: 'Home',
    heroBadge: 'Traditional Japanese Chess',
    heroTitle: 'MASTER THE ART OF SHOGI',
    heroTagline: 'Drop captured pieces back into battle. Outsmart your opponent in the ultimate strategy game.',
    heroStartGame: '⚔️ Start Game',
    heroPuzzles: '🧩 Tsumeshogi Puzzles',
    heroAcademy: '📖 Learn Shogi Rules',
    heroFeaturesTitle: 'Why Play Shogi Web',
    featAiTitle: 'Intelligent AI Bots',
    featAiDesc: 'Challenge engine levels from Novice to Master with realistic styles.',
    featPvpTitle: 'Play With People',
    featPvpDesc: 'Invite a friend with an instant link or battle random online opponents.',
    featRatingTitle: 'Official Dan / Kyu Ranks',
    featRatingDesc: 'Climb the ladder from 15-Kyu apprentice to 5-Dan Grandmaster.',
    featAudioTitle: 'Traditional Japanese Music',
    featAudioDesc: 'Procedural Koto & Shakuhachi melodies and crisp board snap effects.',

    // Match Setup Modal
    setupTitle: 'Start Match',
    setupSubtitle: 'Choose your opponent and match rules',
    chooseOpponent: 'Who do you want to play against?',
    optRobot: 'Play Against Robot',
    optRobotDesc: 'Challenge an intelligent computer AI with customizable difficulty.',
    optPerson: 'Play Against Person',
    optPersonDesc: 'Invite a friend or match with a random player near your skill level.',
    setupRobotTitle: 'Configure Robot Match',
    selectDifficulty: 'Select AI Difficulty Level',
    diffNoviceName: 'Novice (初級)',
    diffNoviceDesc: '~1000 ELO · Gentle play, great for beginners',
    diffApprenticeName: 'Apprentice (中級)',
    diffApprenticeDesc: '~1250 ELO · Solid tactical play and defense',
    diffTacticianName: 'Tactician (上級)',
    diffTacticianDesc: '~1500 ELO · Sharp attacks & tricky drop threats',
    diffMasterName: 'Master (有段者)',
    diffMasterDesc: '~1750 ELO · Deep minimax search & ruthless calculation',
    selectSide: 'Choose Your Side',
    sideSenteLabel: '☗ Sente (First / Black)',
    sideRandomLabel: '🎲 Random Side',
    sideGoteLabel: '☖ Gote (Second / White)',
    btnStartRobotMatch: '⚔️ Start Match Against Robot',
    btnBack: '◀ Back',

    // Person Match Setup
    setupPersonTitle: 'Play Against a Person',
    optInviteFriend: 'Invite a Friend / Pass & Play',
    optInviteFriendDesc: 'Play on the same screen (hotseat) or copy an instant match link to share.',
    optRandomOpponent: 'Play Against Random Opponent',
    optRandomOpponentDesc: 'Instantly find a player matched to your rating in the queue.',
    roomLinkTitle: 'Shareable Match Link:',
    btnCopyLink: '📋 Copy Link',
    linkCopied: 'Copied to clipboard!',
    btnStartFriendMatch: '▶ Start Friend Match (Pass & Play)',
    btnFindRandomOpponent: '🔍 Find Random Opponent',

    // Matchmaking Radar
    radarSearching: 'Searching for opponent near your rating...',
    radarScanning: 'Scanning active Shogi rooms...',
    radarFound: '⚔️ Opponent Found!',
    radarStarting: 'Starting match in 2 seconds...',
    btnCancelSearch: 'Cancel Search',

    // History replay
    historyReplayTitle: 'Move History & Replay',
    btnFirstMove: '⏮ First',
    btnPrevMove: '◀ Prev',
    btnNextMove: '▶ Next',
    btnLatestMove: '⏭ Latest',
    viewingMove: 'Viewing move',

    // Onboarding / Registration Gate
    onboardBadge: 'Welcome to Shogi Web',
    onboardTitle: 'Create Your Player Profile',
    onboardSubtitle: 'Sign in with Google to save your rating, rank, and start your personalized Shogi tutorial.',
    onboardChooseLang: 'Choose Your Language / 言語 / Язык',
    onboardGoogleBtn: 'Sign in with Google',
    onboardOr: 'or create a local profile',
    onboardGoogleModalTitle: 'Sign in with Google',
    onboardGoogleModalSub: 'Enter your Google account details to create your Shogi profile',
    onboardEmailLabel: 'Google Email',
    onboardNameLabel: 'Display Name',
    onboardAvatarLabel: 'Choose Your Crest',
    onboardCreateProfileBtn: 'Complete Profile & Start Tutorial →',
    onboardStartTutorial: 'Register & Start Tutorial →',
    onboardTutorialPrompt: 'Interactive tutorial starts right after registration!',
    btnFinishTutorial: '⚔️ Finish Tutorial & Play',
    tabWatchAnim: '🎬 Watch Animation',
    tabPracticeBoard: '♟️ Practice 9×9 Board',
    settingsSong: 'Select Music Track',
    btnNextSong: '⏭ Track',
    btnPastGames: '📜 Past Games',
    btnAnalyzeGame: '📊 Analyze Game',
    analysisTitle: 'Game Review & Move Analysis',
    historyModalTitle: 'History of Played Games',
    historyEmpty: 'No finished games yet. Complete a match to review and analyze it here!',
    btnReplayAnalyze: '📊 Replay & Analyze',
    accuracyLabel: 'Accuracy',
    qualityBrilliant: 'Brilliant',
    qualityGreat: 'Great',
    qualityMedium: 'Medium',
    qualityBad: 'Bad',
    qualityTerrible: 'Terrible'
  },

  ja: {
    // Brand & Header
    brandTitle: '将棋 WEB',
    brandTagline: '日本の伝統文化・知の戦略ゲーム',
    tabPlayAi: 'AI対局',
    tabPvp: '二人対局',
    tabPuzzle: '詰将棋',
    tabAcademy: '将棋入門',
    btnSound: '効果音',
    btnUnmute: '消音解除',
    btnFlip: '盤面反転',
    btnSettings: '設定',
    btnAccount: 'アカウント',
    btnSignIn: 'ログイン',

    // Player Panels
    senteRole: '先手 (☗)',
    goteRole: '後手 (☖)',
    komadai: '駒台',
    komadaiEmpty: 'なし',
    aiOpponent: 'AI対局者',
    guestUser: 'ゲスト対局者',
    aiThinking: 'AIが思考中...',

    // Settings
    settingsTitle: 'ゲーム設定',
    settingsLanguage: '言語 (Language)',
    settingsBgm: '和風BGM (お琴・尺八)',
    settingsBgmDesc: '日本の伝統的な箏・尺八の調べ（Web Audio procedural合成）',
    settingsBgmVolume: 'BGM音量',
    settingsSfx: '着手駒音 (効果音)',
    settingsTheme: '盤面テーマ',
    settingsPieceStyle: '駒の表記',
    themeKaya: '本榧 (ほんかや)',
    themeZen: '玄昌石 (ダークスレート)',
    themeSakura: '桜 (さくら)',
    pieceKanji2: '伝統二字駒 (王将, 飛車)',
    pieceKanji1: '一字駒 (王, 飛, 竜)',
    pieceGuide: '入門ガイド (移動方向ドット表示)',
    pieceWestern: '国際表記 (K, R, +R)',
    btnClose: '閉じる',

    // Match Config
    matchSettings: '対局設定',
    aiDifficulty: 'AI難易度',
    diffNovice: '初級 - 駒の動きを覚えた方向け',
    diffApprentice: '中級 - 実戦の練習に最適',
    diffTactician: '上級 - 鋭い攻防と形勢判断',
    diffMaster: '有段者 - 深い先読みと詰みの計算',
    playAs: '手番の選択',
    senteFirst: '☗ 先手 (黒)',
    goteSecond: '☖ 後手 (白)',
    btnNewGame: '⚔️ 対局開始',
    btnTakeBack: '↩ 待った (一手戻す)',
    btnResign: '🏳️ 投了',
    btnExportSfen: '📋 棋譜/SFEN出力',
    moveHistory: '指し手履歴 (棋譜)',
    noMovesYet: '対局開始。初手を指してください。',

    // Status Announcements
    turnToMove: 'の手番です。',
    turnSente: '先手 (☗)',
    turnGote: '後手 (☖)',
    statusCheck: '王手 (Check)!',
    statusCheckmate: '詰み (Checkmate)!',
    statusWins: 'の勝ちです！',
    statusResign: '投了',
    statusRepetition: '千日手 (4回同一局面) による引き分け！',
    statusStalemate: 'ステイルメイト (引き分け)',
    confirmResign: '本当に投了しますか？',
    confirmNewGame: '新しい対局を始めますか？',

    // Promotion Modal
    promoTitle: '駒を成りますか？',
    promoSubtitle: '敵陣の三段目に入ると、駒を裏返して成ることができます。',
    promoYes: '✨ 成る (Promote)',
    promoNo: '不成 (ならず)',

    // Accounts & Rating
    accountTitle: 'プレイヤーアカウント & レーティング',
    accountCreate: 'アカウント新規作成',
    accountLogin: 'ログイン',
    accountUsername: 'ユーザー名',
    accountPassword: 'パスワード (PINまたは英数字)',
    accountSubmitCreate: 'アカウント作成して対局',
    accountSubmitLogin: 'ログイン',
    accountSwitch: 'アカウント切り替え / ログアウト',
    accountRating: 'レーティング (ELO)',
    accountRank: '将棋棋力 (段級位)',
    accountStats: '対局成績',
    accountWins: '勝ち',
    accountLosses: '負け',
    accountDraws: '引き分け',
    accountWinrate: '勝率',
    accountRequireNotice: '将棋Webへようこそ！対局を始めるにはアカウントを作成またはログインしてください。',
    accountGuestPrompt: 'アカウントをお持ちでない方はこちら（数秒で作成可能）',
    accountLoginPrompt: 'すでにアカウントをお持ちの方はこちら',

    // Puzzles & Academy
    puzzleHeader: '詰将棋問題',
    puzzleHint: 'ヒント:',
    puzzleSuccess: '🎉 正解です！見事な詰みです！',
    puzzleFail: '❌ 不正解です。相手の玉が逃げられます。もう一度挑戦！',
    puzzleInfo: '好手です！最後の一手で詰ませましょう。',
    btnPrev: '◀ 前へ',
    btnRetry: '↺ もう一度',
    btnNext: '次へ ▶',
    btnNextLesson: '次の講義 ▶',

    // Landing Page & Match Setup
    btnHome: 'ホーム',
    heroBadge: '日本伝統の本格頭脳ゲーム',
    heroTitle: '将棋の深奥を極める',
    heroTagline: '取った駒が自らの戦力として蘇る、世界唯一の知略戦。AI対局から対人戦まで本格体験。',
    heroStartGame: '⚔️ 対局開始',
    heroPuzzles: '🧩 詰将棋に挑戦',
    heroAcademy: '📖 将棋入門・ルール',
    heroFeaturesTitle: 'Shogi Web の魅力',
    featAiTitle: '本格知能AIロボット',
    featAiDesc: '初級から有段者まで、実戦的な思考ルーチンを備えた4段階の難易度。',
    featPvpTitle: '友達・対人オンライン対局',
    featPvpDesc: '招待リンク送信での友達対局や、レーティングに基づくランダムマッチ。',
    featRatingTitle: '段級位・ELOレーティング',
    featRatingDesc: '15級から最高段位の五段・師範まで、対局結果に応じて昇段。',
    featAudioTitle: '和の調べとリアルな駒音',
    featAudioDesc: '箏と尺八による自動演奏BGMと、心地よい盤上の「パチッ！」という着手音。',

    // Match Setup Modal
    setupTitle: '対局設定',
    setupSubtitle: '対戦相手と対局ルールを選択してください',
    chooseOpponent: '対戦相手を選んでください',
    optRobot: 'ロボット (AI) と対局',
    optRobotDesc: '初級から有段者まで好みの強さを選べるコンピューター対戦です。',
    optPerson: '人と対局 (対人戦)',
    optPersonDesc: '友達に対局リンクを送るか、棋力の近いランダムな対戦相手を探します。',
    setupRobotTitle: 'ロボット対戦の設定',
    selectDifficulty: 'AI難易度を選択',
    diffNoviceName: '初級 (15級相当)',
    diffNoviceDesc: '約1000 ELO · 駒の動きを覚えたての方に最適',
    diffApprenticeName: '中級 (8級相当)',
    diffApprenticeDesc: '約1250 ELO · 実戦的な攻防と囲いの練習に最適',
    diffTacticianName: '上級 (2級相当)',
    diffTacticianDesc: '約1500 ELO · 鋭い踏み込みと的確な駒打ち',
    diffMasterName: '有段者 (初段〜五段)',
    diffMasterDesc: '約1750 ELO · 深い読みと正確無比な終盤力',
    selectSide: '手番の選択',
    sideSenteLabel: '☗ 先手 (黒 / 先番)',
    sideRandomLabel: '🎲 振り駒 (ランダム)',
    sideGoteLabel: '☖ 後手 (白 / 後番)',
    btnStartRobotMatch: '⚔️ ロボットと対局開始',
    btnBack: '◀ 戻る',

    // Person Match Setup
    setupPersonTitle: '対人戦の設定',
    optInviteFriend: '友達を招待 / 二人対戦',
    optInviteFriendDesc: '1台の端末で交互に指す (Pass & Play) か、招待リンクを友達に共有します。',
    optRandomOpponent: 'ランダム対戦 (マッチメイキング)',
    optRandomOpponentDesc: 'あなたのレーティングに近いオンラインの対戦相手を自動検索します。',
    roomLinkTitle: '共有用対局リンク:',
    btnCopyLink: '📋 リンクをコピー',
    linkCopied: 'クリップボードにコピーしました！',
    btnStartFriendMatch: '▶ 友達対戦を開始 (二人指し)',
    btnFindRandomOpponent: '🔍 対戦相手を探す',

    // Matchmaking Radar
    radarSearching: 'レーティングの近い対戦相手を検索中...',
    radarScanning: 'アクティブな対局ルームをスキャンしています...',
    radarFound: '⚔️ 対戦相手が見つかりました！',
    radarStarting: '2秒後に対局を開始します...',
    btnCancelSearch: '検索をキャンセル',

    // History replay
    historyReplayTitle: '棋譜・指し手履歴',
    btnFirstMove: '⏮ 初手',
    btnPrevMove: '◀ 前の一手',
    btnNextMove: '▶ 次の一手',
    btnLatestMove: '⏭ 最新局面',
    viewingMove: '局面確認中:',

    // Onboarding / Registration Gate
    onboardBadge: '将棋Webへようこそ',
    onboardTitle: 'プレイヤープロフィールを作成',
    onboardSubtitle: 'Googleアカウントでログインして段級位を保存し、将棋チュートリアルを始めましょう。',
    onboardChooseLang: '言語を選択 / Language / Язык',
    onboardGoogleBtn: 'Googleでログイン',
    onboardOr: 'またはローカルアカウントを作成',
    onboardGoogleModalTitle: 'Googleでログイン',
    onboardGoogleModalSub: 'Googleアカウント情報を入力してプロフィールを作成',
    onboardEmailLabel: 'Googleメールアドレス',
    onboardNameLabel: '表示名 (プレイヤー名)',
    onboardAvatarLabel: '家紋・アイコンを選択',
    onboardCreateProfileBtn: 'プロフィール作成して入門へ →',
    onboardStartTutorial: '登録してチュートリアル開始 →',
    onboardTutorialPrompt: '登録後すぐに将棋入門チュートリアルが始まります！',
    btnFinishTutorial: '⚔️ チュートリアル完了・対局へ',
    tabWatchAnim: '🎬 アニメ解説を見る',
    tabPracticeBoard: '♟️ 9×9盤で練習する',
    settingsSong: 'BGM楽曲を選択',
    btnNextSong: '⏭ 曲切替',
    btnPastGames: '📜 対局履歴',
    btnAnalyzeGame: '📊 棋譜解析',
    analysisTitle: '対局解析・評価',
    historyModalTitle: '対局履歴アーカイブ',
    historyEmpty: '完了した対局はまだありません。対局を終えるとここに記録されます！',
    btnReplayAnalyze: '📊 再生・解析',
    accuracyLabel: '正確度',
    qualityBrilliant: '妙手',
    qualityGreat: '好手',
    qualityMedium: '普通',
    qualityBad: '疑問手',
    qualityTerrible: '悪手'
  },

  ru: {
    // Brand & Header
    brandTitle: 'СЁГИ ВЕБ',
    brandTagline: 'Искусство и стратегия японских шахмат',
    tabPlayAi: 'Игра с ИИ',
    tabPvp: 'За одним ПК',
    tabPuzzle: 'Цумэсёги',
    tabAcademy: 'Академия',
    btnSound: 'Звук',
    btnUnmute: 'Включить звук',
    btnFlip: 'Перевернуть',
    btnSettings: 'Настройки',
    btnAccount: 'Аккаунт',
    btnSignIn: 'Войти',

    // Player Panels
    senteRole: 'Сэнтэ (先手 / Чёрные)',
    goteRole: 'Готэ (後手 / Белые)',
    komadai: 'Комадай (подставка)',
    komadaiEmpty: 'Пусто',
    aiOpponent: 'Противник-ИИ',
    guestUser: 'Гость',
    aiThinking: 'ИИ обдумывает ход...',

    // Settings
    settingsTitle: 'Настройки игры',
    settingsLanguage: 'Язык',
    settingsBgm: 'Традиционная японская музыка',
    settingsBgmDesc: 'Процедурные мелодии кото и сякухати',
    settingsBgmVolume: 'Громкость музыки',
    settingsSfx: 'Звуковые эффекты (стук фигур)',
    settingsTheme: 'Тема доски и оформление',
    settingsPieceStyle: 'Начертание фигур',
    themeKaya: 'Традиционное дерево кая (本榧)',
    themeZen: 'Тёмный сланец дзэн (玄昌石)',
    themeSakura: 'Цветущая сакура (桜)',
    pieceKanji2: 'Традиционные (2 кандзи — 王将, 飛車)',
    pieceKanji1: 'Упрощённые (1 кандзи — 王, 飛, 竜)',
    pieceGuide: 'Для начинающих (точки показывают ходы!)',
    pieceWestern: 'Международные (K, R, +R — символы)',
    btnClose: 'Закрыть',

    // Match Config
    matchSettings: 'Настройки партии',
    aiDifficulty: 'Сложность ИИ',
    diffNovice: 'Новичок (初級) — мягко и снисходительно',
    diffApprentice: 'Ученик (中級) — хорошо для практики',
    diffTactician: 'Тактик (上級) — остро и стратегично',
    diffMaster: 'Мастер (有段者) — глубокий расчёт',
    playAs: 'Играть за',
    senteFirst: '☗ Сэнтэ (первый / чёрные)',
    goteSecond: '☖ Готэ (второй / белые)',
    btnNewGame: '⚔️ Новая партия',
    btnTakeBack: '↩ Взять ход назад',
    btnResign: '🏳️ Сдаться',
    btnExportSfen: '📋 Экспорт SFEN',
    moveHistory: 'История ходов',
    noMovesYet: 'Ходов пока нет. Сделайте первый ход!',

    // Status Announcements
    turnToMove: 'ходит.',
    turnSente: 'Сэнтэ (Чёрные / 先手)',
    turnGote: 'Готэ (Белые / 後手)',
    statusCheck: 'Шах (王手)!',
    statusCheckmate: 'Мат (詰み)!',
    statusWins: 'побеждает!',
    statusResign: 'Сдача партии',
    statusRepetition: 'Ничья по сэнничитэ (千日手) — четырёхкратное повторение!',
    statusStalemate: 'Ничья — пат!',
    confirmResign: 'Вы уверены, что хотите сдаться? (投了しますか？)',
    confirmNewGame: 'Начать новую партию?',

    // Promotion Modal
    promoTitle: 'Превратить фигуру?',
    promoSubtitle: 'Вход в зону превращения открывает усиленные способности (成る).',
    promoYes: '✨ Превратить (成る)',
    promoNo: 'Оставить как есть (不成)',

    // Accounts & Rating
    accountTitle: 'Аккаунт и рейтинг игрока',
    accountCreate: 'Создать аккаунт',
    accountLogin: 'Войти в аккаунт',
    accountUsername: 'Имя пользователя',
    accountPassword: 'Пароль (ПИН-код или пароль)',
    accountSubmitCreate: 'Создать аккаунт и играть',
    accountSubmitLogin: 'Войти',
    accountSwitch: 'Сменить аккаунт / Выйти',
    accountRating: 'Рейтинг (ELO)',
    accountRank: 'Ранг сёги',
    accountStats: 'Статистика',
    accountWins: 'Победы',
    accountLosses: 'Поражения',
    accountDraws: 'Ничьи',
    accountWinrate: 'Процент побед',
    accountRequireNotice: 'Войдите или создайте аккаунт, чтобы начать играть и отслеживать свой рейтинг!',
    accountGuestPrompt: 'Ещё нет аккаунта? Создайте за пару секунд!',
    accountLoginPrompt: 'Уже есть аккаунт? Войдите здесь.',

    // Puzzles & Academy
    puzzleHeader: 'Задача цумэсёги',
    puzzleHint: 'Подсказка:',
    puzzleSuccess: '🎉 Верно! Мат поставлен (詰み)!',
    puzzleFail: '❌ Не совсем. Король противника ускользает! Попробуйте снова.',
    puzzleInfo: 'Хороший ход! Теперь поставьте завершающий мат.',
    btnPrev: '◀ Назад',
    btnRetry: '↺ Заново',
    btnNext: 'Далее ▶',
    btnNextLesson: 'Следующий урок ▶',

    // Landing Page & Match Setup
    btnHome: 'Главная',
    heroBadge: 'Традиционные японские шахматы',
    heroTitle: 'ОСВОЙТЕ ИСКУССТВО СЁГИ',
    heroTagline: 'Захваченные фигуры возвращаются в бой на вашей стороне. Переиграйте соперника в главной стратегической игре.',
    heroStartGame: '⚔️ Начать игру',
    heroPuzzles: '🧩 Задачи цумэсёги',
    heroAcademy: '📖 Правила сёги',
    heroFeaturesTitle: 'Почему стоит играть в Сёги Веб',
    featAiTitle: 'Умные ИИ-противники',
    featAiDesc: 'Играйте с движком от новичка до мастера — реалистичный стиль игры.',
    featPvpTitle: 'Игра с людьми',
    featPvpDesc: 'Пригласите друга по ссылке или сразитесь со случайным онлайн-соперником.',
    featRatingTitle: 'Официальные ранги дан / кю',
    featRatingDesc: 'Поднимайтесь по лестнице от 15-кю ученика до 5-дан гроссмейстера.',
    featAudioTitle: 'Традиционная японская музыка',
    featAudioDesc: 'Процедурные мелодии кото и сякухати, а также характерный стук фигур о доску.',

    // Match Setup Modal
    setupTitle: 'Начать партию',
    setupSubtitle: 'Выберите соперника и правила партии',
    chooseOpponent: 'С кем вы хотите сыграть?',
    optRobot: 'Игра против робота',
    optRobotDesc: 'Бросьте вызов компьютерному ИИ с настраиваемой сложностью.',
    optPerson: 'Игра против человека',
    optPersonDesc: 'Пригласите друга или найдите случайного игрока вашего уровня.',
    setupRobotTitle: 'Настройка партии с роботом',
    selectDifficulty: 'Выберите уровень сложности ИИ',
    diffNoviceName: 'Новичок (初級)',
    diffNoviceDesc: '~1000 ELO · Мягкая игра, отлично для начинающих',
    diffApprenticeName: 'Ученик (中級)',
    diffApprenticeDesc: '~1250 ELO · Уверенная тактическая игра и защита',
    diffTacticianName: 'Тактик (上級)',
    diffTacticianDesc: '~1500 ELO · Острые атаки и хитрые сбросы фигур',
    diffMasterName: 'Мастер (有段者)',
    diffMasterDesc: '~1750 ELO · Глубокий перебор и беспощадный расчёт',
    selectSide: 'Выберите сторону',
    sideSenteLabel: '☗ Сэнтэ (первый / чёрные)',
    sideRandomLabel: '🎲 Случайная сторона',
    sideGoteLabel: '☖ Готэ (второй / белые)',
    btnStartRobotMatch: '⚔️ Начать партию с роботом',
    btnBack: '◀ Назад',

    // Person Match Setup
    setupPersonTitle: 'Игра против человека',
    optInviteFriend: 'Пригласить друга / За одним экраном',
    optInviteFriendDesc: 'Играйте на одном экране по очереди или отправьте другу ссылку на партию.',
    optRandomOpponent: 'Случайный соперник',
    optRandomOpponentDesc: 'Мгновенный подбор игрока по вашему рейтингу из очереди.',
    roomLinkTitle: 'Ссылка на партию:',
    btnCopyLink: '📋 Копировать ссылку',
    linkCopied: 'Скопировано в буфер обмена!',
    btnStartFriendMatch: '▶ Начать партию с другом (за одним ПК)',
    btnFindRandomOpponent: '🔍 Найти случайного соперника',

    // Matchmaking Radar
    radarSearching: 'Поиск соперника рядом с вашим рейтингом...',
    radarScanning: 'Сканирование активных комнат сёги...',
    radarFound: '⚔️ Соперник найден!',
    radarStarting: 'Партия начнётся через 2 секунды...',
    btnCancelSearch: 'Отменить поиск',

    // History replay
    historyReplayTitle: 'История ходов и просмотр',
    btnFirstMove: '⏮ Начало',
    btnPrevMove: '◀ Назад',
    btnNextMove: '▶ Вперёд',
    btnLatestMove: '⏭ Последний',
    viewingMove: 'Просмотр хода',

    // Onboarding / Registration Gate
    onboardBadge: 'Добро пожаловать в Shogi Web',
    onboardTitle: 'Создайте профиль игрока',
    onboardSubtitle: 'Войдите через Google, чтобы сохранить свой рейтинг, ранг и пройти интерактивное обучение.',
    onboardChooseLang: 'Выберите язык / Language / 言語',
    onboardGoogleBtn: 'Войти через Google',
    onboardOr: 'или создайте локальный профиль',
    onboardGoogleModalTitle: 'Вход через Google',
    onboardGoogleModalSub: 'Укажите данные вашего Google-аккаунта для создания профиля',
    onboardEmailLabel: 'Google Email',
    onboardNameLabel: 'Имя игрока (в профиле)',
    onboardAvatarLabel: 'Выберите эмблему',
    onboardCreateProfileBtn: 'Создать профиль и начать обучение →',
    onboardStartTutorial: 'Зарегистрироваться и начать обучение →',
    onboardTutorialPrompt: 'Сразу после регистрации начнётся обучение на выбранном языке!',
    btnFinishTutorial: '⚔️ Завершить обучение и играть',
    tabWatchAnim: '🎬 Смотреть анимацию',
    tabPracticeBoard: '♟️ Практика на доске 9×9',
    settingsSong: 'Выбор мелодии (BGM)',
    btnNextSong: '⏭ Трек',
    btnPastGames: '📜 История игр',
    btnAnalyzeGame: '📊 Анализ игры',
    analysisTitle: 'Разбор и оценка ходов',
    historyModalTitle: 'История сыгранных партий',
    historyEmpty: 'Завершённых партий пока нет. Сыграйте матч, чтобы проанализировать его здесь!',
    btnReplayAnalyze: '📊 Повтор и анализ',
    accuracyLabel: 'Точность',
    qualityBrilliant: 'Блестящий',
    qualityGreat: 'Отличный',
    qualityMedium: 'Хороший',
    qualityBad: 'Неточный',
    qualityTerrible: 'Зевок'
  }
};

let currentLang = 'en';
try {
  currentLang = localStorage.getItem('shogi_language') || 'en';
} catch (e) {}

function getLanguage() {
  return currentLang;
}

function setLanguage(lang) {
  if (!['en', 'ja', 'ru'].includes(lang)) lang = 'en';
  currentLang = lang;
  try {
    localStorage.setItem('shogi_language', lang);
  } catch (e) {}
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    updatePageText();
  }
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('shogi_lang_changed', { detail: { lang } }));
  }
}

function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

// Update all DOM elements with data-i18n attributes
function updatePageText() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translation = t(key);
    if (translation) {
      if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
        el.value = translation;
      } else {
        el.textContent = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    el.title = t(key);
  });
}


// --- Begin: js/accounts.js ---
/**
 * Shogi Web - Player Account & Rating (ELO / Dan-Kyu) System
 */

class AccountManager {
  constructor() {
    this.currentUser = null;
    this.accounts = {};
    this.loadAccounts();
  }

  loadAccounts() {
    try {
      const stored = localStorage.getItem('shogi_accounts');
      if (stored) {
        this.accounts = JSON.parse(stored);
      }
      const activeUser = localStorage.getItem('shogi_current_user');
      if (activeUser && this.accounts[activeUser]) {
        this.currentUser = this.accounts[activeUser];
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Could not read accounts from localStorage:', e);
      }
    }
  }

  saveAccounts() {
    try {
      localStorage.setItem('shogi_accounts', JSON.stringify(this.accounts));
      if (this.currentUser) {
        localStorage.setItem('shogi_current_user', this.currentUser.accountKey || this.currentUser.username);
      } else {
        localStorage.removeItem('shogi_current_user');
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Could not save accounts to localStorage:', e);
      }
    }
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  register(username, password, extra = {}) {
    username = (username || '').trim();
    if (!username || username.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters long.' };
    }
    if (this.accounts[username]) {
      return { success: false, error: 'Username already exists. Please choose another or sign in.' };
    }

    const newUser = {
      username,
      password: password || '1234',
      email: extra.email || '',
      avatar: extra.avatar || '将',
      provider: extra.provider || 'local',
      rating: 1200,
      peakRating: 1200,
      wins: 0,
      losses: 0,
      draws: 0,
      tutorialCompleted: false,
      createdAt: new Date().toISOString()
    };

    this.accounts[username] = newUser;
    this.currentUser = newUser;
    this.saveAccounts();

    // Async sync to server
    this.syncToServer(newUser);

    return { success: true, user: newUser };
  }

  loginWithGoogle({ email, name, avatar }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid Google email address.' };
    }
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Display name must be at least 2 characters long.' };
    }

    // Check if an account with this Google email already exists
    const existing = Object.values(this.accounts).find(
      acc => acc.provider === 'google' && acc.email && acc.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      existing.username = cleanName;
      if (avatar) existing.avatar = avatar;
      this.currentUser = existing;
      this.saveAccounts();
      return { success: true, user: existing, isNew: false };
    }

    // Ensure unique username key
    let key = cleanName;
    if (this.accounts[key]) {
      key = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const newUser = {
      username: cleanName,
      accountKey: key,
      password: '',
      email: cleanEmail,
      avatar: avatar || '将',
      provider: 'google',
      rating: 1200,
      peakRating: 1200,
      wins: 0,
      losses: 0,
      draws: 0,
      tutorialCompleted: false,
      createdAt: new Date().toISOString()
    };

    this.accounts[key] = newUser;
    this.currentUser = newUser;
    try {
      localStorage.setItem('shogi_google_user', JSON.stringify({ email: cleanEmail, name: cleanName, avatar: newUser.avatar }));
      localStorage.setItem('shogi_current_user', key);
    } catch (e) {}
    this.saveAccounts();
    this.syncToServer(newUser);

    return { success: true, user: newUser, isNew: true };
  }

  markTutorialCompleted() {
    if (this.currentUser) {
      this.currentUser.tutorialCompleted = true;
      this.saveAccounts();
    }
  }

  login(username, password) {
    username = (username || '').trim();
    const user = this.accounts[username];
    if (!user) {
      return { success: false, error: 'User not found. Please register first.' };
    }
    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    this.currentUser = user;
    this.saveAccounts();
    return { success: true, user };
  }

  logout() {
    this.currentUser = null;
    this.saveAccounts();
  }

  // Calculate Shogi Dan/Kyu Rank from ELO rating
  getRank(rating = null) {
    const r = rating !== null ? rating : (this.currentUser ? this.currentUser.rating : 1200);

    if (r < 1000) return { titleEn: '15-Kyu', titleJa: '15級', titleRu: '15-й кю', badge: 'Novice' };
    if (r < 1100) return { titleEn: '10-Kyu', titleJa: '10級', titleRu: '10-й кю', badge: 'Apprentice' };
    if (r < 1200) return { titleEn: '8-Kyu', titleJa: '8級', titleRu: '8-й кю', badge: 'Junior' };
    if (r < 1300) return { titleEn: '6-Kyu', titleJa: '6級', titleRu: '6-й кю', badge: 'Intermediate' };
    if (r < 1400) return { titleEn: '4-Kyu', titleJa: '4級', titleRu: '4-й кю', badge: 'Tactician' };
    if (r < 1500) return { titleEn: '2-Kyu', titleJa: '2級', titleRu: '2-й кю', badge: 'Senior' };
    if (r < 1600) return { titleEn: '1-Kyu', titleJa: '1級', titleRu: '1-й кю', badge: 'Expert' };
    if (r < 1700) return { titleEn: '1-Dan (Shodan)', titleJa: '初段', titleRu: '1-й дан (Сёдан)', badge: 'Dan Master' };
    if (r < 1800) return { titleEn: '2-Dan', titleJa: '二段', titleRu: '2-й дан', badge: 'Dan Master' };
    if (r < 1900) return { titleEn: '3-Dan', titleJa: '三段', titleRu: '3-й дан', badge: 'High Master' };
    if (r < 2000) return { titleEn: '4-Dan', titleJa: '四段', titleRu: '4-й дан', badge: 'High Master' };
    return { titleEn: '5-Dan Grandmaster', titleJa: '五段 (師範)', titleRu: '5-й дан Гроссмейстер', badge: 'Grandmaster' };
  }

  // Update ELO rating after a game:
  // outcome: 1.0 (win), 0.5 (draw), 0.0 (loss)
  updateGameResult(outcome, opponentRating = 1200) {
    if (!this.currentUser) return null;

    const user = this.currentUser;
    const oldRating = user.rating;

    // Expected score formula: E = 1 / (1 + 10 ^ ((R_opp - R_user) / 400))
    const expected = 1 / (1 + Math.pow(10, (opponentRating - oldRating) / 400));
    const kFactor = 32;
    const delta = Math.round(kFactor * (outcome - expected));

    user.rating = Math.max(100, oldRating + delta);
    user.peakRating = Math.max(user.peakRating || oldRating, user.rating);

    if (outcome === 1.0) {
      user.wins = (user.wins || 0) + 1;
    } else if (outcome === 0.0) {
      user.losses = (user.losses || 0) + 1;
    } else {
      user.draws = (user.draws || 0) + 1;
    }

    this.saveAccounts();
    this.syncToServer(user);

    return {
      oldRating,
      newRating: user.rating,
      delta,
      rank: this.getRank(user.rating)
    };
  }

  // Sync to backend REST API
  async syncToServer(user) {
    try {
      if (typeof fetch === 'function') {
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      }
    } catch (e) {
      // Offline / sandboxed fallback is completely fine
    }
  }

  // --- Game History Archive ---
  getGameHistory() {
    try {
      const raw = localStorage.getItem('shogi_game_history');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveGameRecord(record) {
    try {
      const list = this.getGameHistory();
      list.unshift(record);
      if (list.length > 40) list.length = 40;
      localStorage.setItem('shogi_game_history', JSON.stringify(list));
    } catch (e) {}
  }

  updateGameAnalysis(gameId, summary) {
    try {
      const list = this.getGameHistory();
      const target = list.find(g => g.id === gameId);
      if (target) {
        target.analysisSummary = summary;
        localStorage.setItem('shogi_game_history', JSON.stringify(list));
      }
    } catch (e) {}
  }
}


// --- Begin: js/engine/shogi.js ---
/**
 * Shogi Web - Core Rules Engine
 * Implements complete standard Shogi rules (Promotion, Drops, Nifu, Uchifuzume, Check, Checkmate, Sennichite)
 */



class ShogiGame {
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


// --- Begin: js/engine/ai.js ---
/**
 * Shogi Web - AI Engine
 * Provides multiple difficulty levels: Novice, Apprentice, Tactician, and Master.
 * Uses Alpha-Beta pruning with move ordering, piece-square evaluations, and hand bonuses.
 */



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

class ShogiAI {
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


// --- Begin: js/engine/analyzer.js ---
/**
 * Shogi Web - Post-Game Move Analyzer
 * Evaluates every ply of a finished game and classifies moves into:
 * Brilliant (!!), Great (!), Medium (✓), Bad (?!), Terrible (??)
 */





const MOVE_QUALITIES = {
  brilliant: { symbol: '!!', color: '#22d3ee', label_en: 'Brilliant', label_ja: '妙手', label_ru: 'Блестящий' },
  great:     { symbol: '!',  color: '#3b82f6', label_en: 'Great',     label_ja: '好手', label_ru: 'Отличный' },
  medium:    { symbol: '✓',  color: '#4ade80', label_en: 'Medium',    label_ja: '普通', label_ru: 'Хороший' },
  bad:       { symbol: '?!', color: '#f59e0b', label_en: 'Bad',       label_ja: '疑問手', label_ru: 'Неточный' },
  terrible:  { symbol: '??', color: '#ef4444', label_en: 'Terrible',  label_ja: '悪手', label_ru: 'Зевок' }
};

class GameAnalyzer {
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


// --- Begin: js/engine/puzzles.js ---
/**
 * Shogi Web - Tsumeshogi Puzzles Database
 * Mate-in-1 and Mate-in-3 classic tactical problems with automated verification.
 */



const TSUMESHOGI_PUZZLES = [
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


// --- Begin: js/engine/tutorial.js ---
/**
 * Shogi Web - Interactive Multi-Language Animated Tutorial Lessons (8 Lessons)
 * Covers Rules, Piece Movements, Promotions, Drops, and Hidden Pro Rules (Nifu, Uchifuzume,
 * Mandatory Promotion, Perpetual Check Foul, and 24-Point Impasse).
 * Supports English (en), Japanese (ja), and Russian (ru).
 */



function emptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function emptyHands() {
  return {
    [SENTE]: { R: 0, B: 0, G: 0, S: 0, N: 0, L: 0, P: 0 },
    [GOTE]: { R: 0, B: 0, G: 0, S: 0, N: 0, L: 0, P: 0 }
  };
}

function diagram(kanji, cells, promoted = false, size = 3) {
  const cls = size === 5 ? 'tut-mini-grid grid-5' : 'tut-mini-grid';
  const komaCls = promoted ? 'tut-koma promoted' : 'tut-koma';
  let html = `<div class="${cls}">`;
  for (let i = 0; i < size * size; i++) {
    const c = cells[i] || '.';
    if (c === 'X') {
      html += `<div class="tut-cell center"><div class="${komaCls}"><span>${kanji}</span></div></div>`;
    } else if (c === 'o') {
      html += `<div class="tut-cell"><span class="tut-dot"></span></div>`;
    } else if (c === 's') {
      html += `<div class="tut-cell"><span class="tut-slide"></span></div>`;
    } else if (c === 'j') {
      html += `<div class="tut-cell"><span class="tut-jump">★</span></div>`;
    } else {
      html += `<div class="tut-cell"></div>`;
    }
  }
  html += `</div>`;
  return html;
}

const TUTORIAL_LESSONS = [
  // =========================================================================
  // LESSON 1: INTRODUCTION, CAPTURE & RECYCLING
  // =========================================================================
  {
    id: 'intro',
    badge_en: 'Basics · 1/8',
    badge_ja: '基本 · 1/8',
    badge_ru: 'Основы · 1/8',
    title_en: 'The Battlefield & Capturing',
    title_ja: '盤面・向き・駒取りの基本',
    title_ru: 'Поле боя и захват фигур',
    subtitle_en: 'Wedge Direction & Komadai',
    subtitle_ja: '駒の向きと「持ち駒」のルール',
    subtitle_ru: 'Направление фигур и Комадай',
    setupBoard: () => null,
    animation: {
      showPromoZone: true,
      steps: [
        {
          duration: 1700,
          bannerType: 'info',
          caption_en: 'Sente (bottom) points UP; Gote (top) points DOWN.',
          caption_ja: '先手は上向き、後手は下向き。同じ木駒でも向きで敵味方を区別します。',
          caption_ru: 'Сэнтэ (снизу) смотрит ВВЕРХ; Готэ (сверху) смотрит ВНИЗ.',
          pieces: [
            { id: 's1', kanji: '銀', x: 2, y: 3, owner: 'sente' },
            { id: 'g1', kanji: '金', x: 1, y: 2, owner: 'gote' },
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' }
          ],
          highlights: [{ x: 1, y: 2, type: 'target' }],
          hand: []
        },
        {
          duration: 1800,
          sfx: 'capture',
          bannerType: 'promo',
          caption_en: 'Capture an enemy piece — it joins YOUR side on the Komadai!',
          caption_ja: '敵の「金」を取ると、自分の駒台（持ち駒）に加わります！',
          caption_ru: 'Захватив фигуру врага, вы забираете её себе на подставку (Комадай)!',
          pieces: [
            { id: 's1', kanji: '銀', x: 1, y: 2, owner: 'sente', glow: true },
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' }
          ],
          highlights: [{ x: 1, y: 2, type: 'capture' }],
          hand: [{ kanji: '金', active: true }]
        },
        {
          duration: 1900,
          sfx: 'move',
          bannerType: 'success',
          caption_en: 'Unlike chess, captured pieces NEVER die — you drop them back!',
          caption_ja: '取った駒はいつで盤上に「打つ」ことができるのが将棋最大の魅力！',
          caption_ru: 'В отличие от обычных шахмат, фигуры НЕ выбывают — их можно вернуть в бой!',
          pieces: [
            { id: 's1', kanji: '銀', x: 1, y: 2, owner: 'sente' },
            { id: 'droppedG', kanji: '金', x: 2, y: 1, owner: 'sente', dropIn: true, glow: true },
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' }
          ],
          highlights: [{ x: 2, y: 1, type: 'legal', label: '!' }],
          hand: []
        }
      ]
    },
    content_en: `
      <div class="tut-hero-banner">
        <div class="tut-koma large"><span>王将</span></div>
        <p><strong>Shogi</strong> is played on a <strong>9×9 board</strong>. Both sides use identical wooden wedges — <strong>the pointed tip shows ownership</strong>.</p>
      </div>
      <div class="tut-card">
        <div class="tut-side-row">
          <div class="tut-side-pill"><span class="tut-koma mini"><span>王</span></span> <strong>Sente (先手)</strong> — Moves 1st (points UP)</div>
          <div class="tut-side-pill"><span class="tut-koma mini flipped"><span>玉</span></span> <strong>Gote (後手)</strong> — Moves 2nd (points DOWN)</div>
        </div>
      </div>
      <p class="tut-tip">🎬 Watch the animation above: captured enemies switch allegiance and rest on your <strong>Komadai</strong>!</p>
    `,
    content_ja: `
      <div class="tut-hero-banner">
        <div class="tut-koma large"><span>王将</span></div>
        <p><strong>将棋</strong>は<strong>9×9の盤面</strong>で戦います。五角形の<strong>先端が向いている方向</strong>で自分の駒か敵の駒かが決まります。</p>
      </div>
      <div class="tut-card">
        <div class="tut-side-row">
          <div class="tut-side-pill"><span class="tut-koma mini"><span>王</span></span> <strong>先手 (☗)</strong> — 手前・上向き（先攻）</div>
          <div class="tut-side-pill"><span class="tut-koma mini flipped"><span>玉</span></span> <strong>後手 (☖)</strong> — 奥側・下向き（後攻）</div>
        </div>
      </div>
      <p class="tut-tip">🎬 上のアニメーションのように、取った駒は自分の駒台に移り、いつでも戦線に戻せます！</p>
    `,
    content_ru: `
      <div class="tut-hero-banner">
        <div class="tut-koma large"><span>王将</span></div>
        <p><strong>Сёги</strong> играются на доске <strong>9×9</strong>. Все фигуры одного цвета — принадлежность определяет <strong>остриё клина</strong>.</p>
      </div>
      <div class="tut-card">
        <div class="tut-side-row">
          <div class="tut-side-pill"><span class="tut-koma mini"><span>王</span></span> <strong>Сэнтэ (先手)</strong> — ходит 1-м (остриём ВВЕРХ)</div>
          <div class="tut-side-pill"><span class="tut-koma mini flipped"><span>玉</span></span> <strong>Готэ (後手)</strong> — ходит 2-м (остриём ВНИЗ)</div>
        </div>
      </div>
      <p class="tut-tip">🎬 На анимации выше видно: сбитые фигуры переходят на вашу сторону и попадают на <strong>Комадай</strong>!</p>
    `
  },

  // =========================================================================
  // LESSON 2: PAWN, LANCE & KNIGHT (INCL. LEAPING ANIMATION)
  // =========================================================================
  {
    id: 'pieces_basics',
    badge_en: 'Movement · 2/8',
    badge_ja: '駒の動き · 2/8',
    badge_ru: 'Фигуры · 2/8',
    title_en: 'Pawn, Lance & Knight',
    title_ja: '歩・香・桂の動き',
    title_ru: 'Пешка, Копьё и Конь',
    subtitle_en: 'Stepping, Piercing & Leaping',
    subtitle_ja: '前進とジャンプの特性',
    subtitle_ru: 'Шаг, выпад и прыжок',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[5][2] = { type: PAWN, owner: SENTE };
      b[6][4] = { type: LANCE, owner: SENTE };
      b[6][6] = { type: KNIGHT, owner: SENTE };
      b[3][2] = { type: PAWN, owner: GOTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    animation: {
      showPromoZone: false,
      steps: [
        {
          duration: 1500,
          bannerType: 'info',
          caption_en: 'PAWN (歩): Moves & captures 1 square straight forward (never diagonal!).',
          caption_ja: '歩兵 (歩)：前に1マスだけ進みます（チェスと違い斜めには取れません）。',
          caption_ru: 'ПЕШКА (歩): Ходит и бьёт только на 1 клетку строго вперёд.',
          pieces: [
            { id: 'p', kanji: '歩', x: 0, y: 3, owner: 'sente', glow: true },
            { id: 'l', kanji: '香', x: 2, y: 4, owner: 'sente' },
            { id: 'n', kanji: '桂', x: 4, y: 4, owner: 'sente' },
            { id: 'blk', kanji: '歩', x: 4, y: 3, owner: 'gote' }
          ],
          highlights: [{ x: 0, y: 2, type: 'dot' }],
          hand: []
        },
        {
          duration: 1500,
          sfx: 'move',
          bannerType: 'info',
          caption_en: 'Pawn steps forward! Next: LANCE (香) — the spear.',
          caption_ja: '「歩」が1マス前進！次は真っ直ぐ走る「香車 (香)」です。',
          caption_ru: 'Пешка шагнула вперёд! Далее: КОПЬЁ (香).',
          pieces: [
            { id: 'p', kanji: '歩', x: 0, y: 2, owner: 'sente' },
            { id: 'l', kanji: '香', x: 2, y: 4, owner: 'sente', glow: true },
            { id: 'n', kanji: '桂', x: 4, y: 4, owner: 'sente' },
            { id: 'blk', kanji: '歩', x: 4, y: 3, owner: 'gote' }
          ],
          highlights: [
            { x: 2, y: 3, type: 'slide' },
            { x: 2, y: 2, type: 'slide' },
            { x: 2, y: 1, type: 'slide' },
            { x: 2, y: 0, type: 'slide' }
          ],
          hand: []
        },
        {
          duration: 1700,
          sfx: 'move',
          bannerType: 'promo',
          caption_en: 'LANCE rockets forward any distance! Cannot go sideways or back.',
          caption_ja: '香車 (香) は前なら何マスでも直進！（横や後ろには戻れません）',
          caption_ru: 'КОПЬЁ пронзает всю вертикаль вперёд, но не ходит вбок или назад!',
          pieces: [
            { id: 'p', kanji: '歩', x: 0, y: 2, owner: 'sente' },
            { id: 'l', kanji: '香', x: 2, y: 1, owner: 'sente', glow: true },
            { id: 'n', kanji: '桂', x: 4, y: 4, owner: 'sente' },
            { id: 'blk', kanji: '歩', x: 4, y: 3, owner: 'gote' }
          ],
          highlights: [{ x: 3, y: 2, type: 'legal' }],
          hand: []
        },
        {
          duration: 1900,
          sfx: 'move',
          bannerType: 'success',
          caption_en: 'KNIGHT (桂): Only piece that LEAPS over blockers (2 forward, 1 sideways)!',
          caption_ja: '桂馬 (桂)：前の駒を飛び越えて「前2・左右1」に跳べる唯一の駒！',
          caption_ru: 'КОНЬ (桂): Единственная фигура, ПРЫГАЮЩАЯ через преграду (2 вперёд, 1 вбок)!',
          pieces: [
            { id: 'p', kanji: '歩', x: 0, y: 2, owner: 'sente' },
            { id: 'l', kanji: '香', x: 2, y: 1, owner: 'sente' },
            { id: 'n', kanji: '桂', x: 3, y: 2, owner: 'sente', jump: true, glow: true },
            { id: 'blk', kanji: '歩', x: 4, y: 3, owner: 'gote' }
          ],
          highlights: [{ x: 3, y: 2, type: 'legal' }],
          hand: []
        }
      ]
    },
    content_en: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('歩', ['.', 'o', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>Pawn (歩兵 · Fuhyo)</h4>
            <p>Steps & captures <strong>1 square straight forward</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('香', ['.', 's', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>Lance (香車 · Kyosha)</h4>
            <p>Slides straight forward <strong>any number of empty squares</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('桂', ['.', 'j', '.', 'j', '.', '.', '.', '.', '.', '.', '.', '.', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'], false, 5)}
          <div class="tut-piece-info">
            <h4>Knight (桂馬 · Keima)</h4>
            <p>Leaps <strong>2 forward + 1 left/right</strong>. Only forward jumps!</p>
          </div>
        </div>
      </div>
    `,
    content_ja: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('歩', ['.', 'o', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>歩兵 (ふ)</h4>
            <p><strong>前に1マス</strong>だけ進めます。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('香', ['.', 's', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>香車 (きょう)</h4>
            <p><strong>前へまっすぐ何マスでも</strong>進めます。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('桂', ['.', 'j', '.', 'j', '.', '.', '.', '.', '.', '.', '.', '.', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'], false, 5)}
          <div class="tut-piece-info">
            <h4>桂馬 (けい)</h4>
            <p><strong>前2マス＋左右1マス</strong>に跳ねます（他の駒を飛び越せます）。</p>
          </div>
        </div>
      </div>
    `,
    content_ru: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('歩', ['.', 'o', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>Пешка (歩兵 · Фухё)</h4>
            <p>Ходит и бьёт на <strong>1 клетку строго вперёд</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('香', ['.', 's', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>Копьё (香車 · Кёся)</h4>
            <p>Скользит строго вперёд на <strong>любое число пустых клеток</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('桂', ['.', 'j', '.', 'j', '.', '.', '.', '.', '.', '.', '.', '.', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'], false, 5)}
          <div class="tut-piece-info">
            <h4>Конь (桂馬 · Кэйма)</h4>
            <p>Прыгает на <strong>2 вперёд + 1 в сторону</strong> (только вперёд!).</p>
          </div>
        </div>
      </div>
    `
  },

  // =========================================================================
  // LESSON 3: SILVER, GOLD & KING
  // =========================================================================
  {
    id: 'pieces_generals',
    badge_en: 'Movement · 3/8',
    badge_ja: '金・銀・王 · 3/8',
    badge_ru: 'Генералы · 3/8',
    title_en: 'Silver, Gold & King',
    title_ja: '銀将・金将・王将',
    title_ru: 'Серебро, Золото и Король',
    subtitle_en: 'Attacking & Defending Generals',
    subtitle_ja: '攻めの銀、守りの金',
    subtitle_ru: 'Атака и королевская охрана',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[5][2] = { type: SILVER, owner: SENTE };
      b[5][4] = { type: GOLD, owner: SENTE };
      b[5][6] = { type: KING, owner: SENTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    animation: {
      showPromoZone: false,
      steps: [
        {
          duration: 1600,
          bannerType: 'info',
          caption_en: 'SILVER (銀): Moves to 5 squares — forward + all 4 diagonals!',
          caption_ja: '銀将 (銀)：前と斜め4方向の計5マスへ動けます（引き味が武器）。',
          caption_ru: 'СЕРЕБРО (銀): 5 направлений — вперёд и по всем 4 диагоналям!',
          pieces: [{ id: 'g', kanji: '銀', x: 2, y: 2, owner: 'sente', glow: true }],
          highlights: [
            { x: 1, y: 1, type: 'dot' }, { x: 2, y: 1, type: 'dot' }, { x: 3, y: 1, type: 'dot' },
            { x: 1, y: 3, type: 'dot' }, { x: 3, y: 3, type: 'dot' }
          ],
          hand: []
        },
        {
          duration: 1500,
          sfx: 'move',
          bannerType: 'info',
          caption_en: 'Silver darts diagonally! Notice it can retreat diagonally backward.',
          caption_ja: '銀は斜め後ろに引けるので、攻めの切り込み役に最適です！',
          caption_ru: 'Серебро умеет отступать назад по диагонали!',
          pieces: [{ id: 'g', kanji: '銀', x: 1, y: 1, owner: 'sente', glow: true }],
          highlights: [{ x: 1, y: 1, type: 'legal' }],
          hand: []
        },
        {
          duration: 1700,
          sfx: 'move',
          bannerType: 'promo',
          caption_en: 'GOLD (金): 6 directions — all straight + forward diagonals (NOT back-diagonals!).',
          caption_ja: '金将 (金)：斜め後ろ以外の6方向！王将を守る最強の盾になります。',
          caption_ru: 'ЗОЛОТО (金): 6 направлений — кроме двух задних диагоналей (отмечены ❌)!',
          pieces: [{ id: 'k', kanji: '金', x: 2, y: 2, owner: 'sente', glow: true }],
          highlights: [
            { x: 1, y: 1, type: 'dot' }, { x: 2, y: 1, type: 'dot' }, { x: 3, y: 1, type: 'dot' },
            { x: 1, y: 2, type: 'dot' }, { x: 3, y: 2, type: 'dot' }, { x: 2, y: 3, type: 'dot' },
            { x: 1, y: 3, type: 'forbidden', label: '✕' }, { x: 3, y: 3, type: 'forbidden', label: '✕' }
          ],
          hand: []
        },
        {
          duration: 1700,
          sfx: 'move',
          bannerType: 'success',
          caption_en: 'KING (王): Moves 1 square in ALL 8 directions. Checkmate = Game Over!',
          caption_ja: '王将 (王)：周囲8方向すべてに1マス移動。詰まされたら敗北です。',
          caption_ru: 'КОРОЛЬ (王): 1 шаг на любую из 8 соседних клеток. Мат = конец игры!',
          pieces: [{ id: 'king', kanji: '王', x: 2, y: 2, owner: 'sente', glow: true }],
          highlights: [
            { x: 1, y: 1, type: 'dot' }, { x: 2, y: 1, type: 'dot' }, { x: 3, y: 1, type: 'dot' },
            { x: 1, y: 2, type: 'dot' }, { x: 3, y: 2, type: 'dot' },
            { x: 1, y: 3, type: 'dot' }, { x: 2, y: 3, type: 'dot' }, { x: 3, y: 3, type: 'dot' }
          ],
          hand: []
        }
      ]
    },
    content_en: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('銀', ['o', 'o', 'o', '.', 'X', '.', 'o', '.', 'o'])}
          <div class="tut-piece-info">
            <h4>Silver General (銀将)</h4>
            <p><strong>5 squares:</strong> Forward + 4 diagonals.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('金', ['o', 'o', 'o', 'o', 'X', 'o', '.', 'o', '.'])}
          <div class="tut-piece-info">
            <h4>Gold General (金将)</h4>
            <p><strong>6 squares:</strong> Orthogonal + forward diagonals.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('王', ['o', 'o', 'o', 'o', 'X', 'o', 'o', 'o', 'o'])}
          <div class="tut-piece-info">
            <h4>King (王将)</h4>
            <p><strong>8 squares:</strong> 1 step in every direction.</p>
          </div>
        </div>
      </div>
    `,
    content_ja: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('銀', ['o', 'o', 'o', '.', 'X', '.', 'o', '.', 'o'])}
          <div class="tut-piece-info">
            <h4>銀将 (ぎん)</h4>
            <p><strong>前と斜め4方向</strong>の5マス。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('金', ['o', 'o', 'o', 'o', 'X', 'o', '.', 'o', '.'])}
          <div class="tut-piece-info">
            <h4>金将 (きん)</h4>
            <p><strong>斜め後ろ以外</strong>の6マス。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('王', ['o', 'o', 'o', 'o', 'X', 'o', 'o', 'o', 'o'])}
          <div class="tut-piece-info">
            <h4>王将・玉将</h4>
            <p><strong>全8方向</strong>に1マス。</p>
          </div>
        </div>
      </div>
    `,
    content_ru: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('銀', ['o', 'o', 'o', '.', 'X', '.', 'o', '.', 'o'])}
          <div class="tut-piece-info">
            <h4>Серебряный генерал (銀将)</h4>
            <p><strong>5 клеток:</strong> вперёд и 4 диагонали.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('金', ['o', 'o', 'o', 'o', 'X', 'o', '.', 'o', '.'])}
          <div class="tut-piece-info">
            <h4>Золотой генерал (金将)</h4>
            <p><strong>6 клеток:</strong> прямые + передние диагонали.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('王', ['o', 'o', 'o', 'o', 'X', 'o', 'o', 'o', 'o'])}
          <div class="tut-piece-info">
            <h4>Король (王将)</h4>
            <p><strong>8 клеток:</strong> 1 шаг в любую сторону.</p>
          </div>
        </div>
      </div>
    `
  },

  // =========================================================================
  // LESSON 4: ROOK -> DRAGON & BISHOP -> HORSE
  // =========================================================================
  {
    id: 'pieces_major',
    badge_en: 'Major · 4/8',
    badge_ja: '大駒 · 4/8',
    badge_ru: 'Старшие · 4/8',
    title_en: 'Rook, Bishop, Dragon & Horse',
    title_ja: '飛車・角行と「竜」「馬」',
    title_ru: 'Ладья, Слон, Дракон и Лошадь',
    subtitle_en: 'Long-Range Powerhouses',
    subtitle_ja: '大駒が成ると最強に進化！',
    subtitle_ru: 'Эволюция сильнейших фигур',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[5][3] = { type: ROOK, owner: SENTE };
      b[5][5] = { type: BISHOP, owner: SENTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    animation: {
      showPromoZone: true,
      steps: [
        {
          duration: 1500,
          bannerType: 'info',
          caption_en: 'ROOK (飛) sweeps any distance vertically or horizontally.',
          caption_ja: '飛車 (飛) は縦・横にどこまでも直進できます！',
          caption_ru: 'ЛАДЬЯ (飛) мчится на любое число клеток по прямой.',
          pieces: [{ id: 'r', kanji: '飛', x: 0, y: 4, owner: 'sente', glow: true }],
          highlights: [
            { x: 0, y: 3, type: 'slide' }, { x: 0, y: 2, type: 'slide' }, { x: 0, y: 1, type: 'slide' },
            { x: 1, y: 4, type: 'slide' }, { x: 2, y: 4, type: 'slide' }, { x: 3, y: 4, type: 'slide' }
          ],
          hand: []
        },
        {
          duration: 1600,
          sfx: 'promo',
          bannerType: 'promo',
          caption_en: 'Enters Promotion Zone → flips into DRAGON (竜): Rook + 1-step King diagonals!',
          caption_ja: '敵陣に入り「竜王 (竜)」に成ると、斜め1マスも動ける最強の駒に！',
          caption_ru: 'Войдя в зону превращения, Ладья становится ДРАКОНОМ (竜) + шаг по диагонали!',
          pieces: [{ id: 'r', kanji: '竜', x: 0, y: 1, owner: 'sente', promoted: true, flip: true, glow: true }],
          highlights: [
            { x: 1, y: 0, type: 'dot' }, { x: 1, y: 2, type: 'dot' },
            { x: 1, y: 1, type: 'slide' }, { x: 2, y: 1, type: 'slide' }, { x: 3, y: 1, type: 'slide' }
          ],
          hand: []
        },
        {
          duration: 1600,
          sfx: 'move',
          bannerType: 'info',
          caption_en: 'BISHOP (角) glides diagonally across all 4 diagonals!',
          caption_ja: '角行 (角) は斜め4方向に何マスでも滑走します！',
          caption_ru: 'СЛОН (角) скользит по всем 4 диагоналям!',
          pieces: [{ id: 'b', kanji: '角', x: 4, y: 4, owner: 'sente', glow: true }],
          highlights: [
            { x: 3, y: 3, type: 'slide' }, { x: 2, y: 2, type: 'slide' }, { x: 1, y: 1, type: 'slide' }, { x: 0, y: 0, type: 'slide' }
          ],
          hand: []
        },
        {
          duration: 1800,
          sfx: 'promo',
          bannerType: 'success',
          caption_en: 'Promotes into HORSE (馬): Bishop + 1-step orthogonal King moves!',
          caption_ja: '敵陣で「竜馬 (馬)」に成ると、縦横1マスも動けるようになります！',
          caption_ru: 'Превращается в ЛОШАДЬ (馬): Слон + шаг на 1 клетку по прямой!',
          pieces: [{ id: 'b', kanji: '馬', x: 1, y: 1, owner: 'sente', promoted: true, flip: true, glow: true }],
          highlights: [
            { x: 1, y: 0, type: 'dot' }, { x: 1, y: 2, type: 'dot' },
            { x: 0, y: 1, type: 'dot' }, { x: 2, y: 1, type: 'dot' }
          ],
          hand: []
        }
      ]
    },
    content_en: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('飛', ['.', 's', '.', 's', 'X', 's', '.', 's', '.'])}
          <div class="tut-piece-info">
            <h4>Rook (飛車) → Dragon (竜王)</h4>
            <p>Slides orthogonally; promoted <strong>竜</strong> adds 1-step diagonals!</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('角', ['s', '.', 's', '.', 'X', '.', 's', '.', 's'])}
          <div class="tut-piece-info">
            <h4>Bishop (角行) → Horse (竜馬)</h4>
            <p>Slides diagonally; promoted <strong>馬</strong> adds 1-step orthogonals!</p>
          </div>
        </div>
      </div>
    `,
    content_ja: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('飛', ['.', 's', '.', 's', 'X', 's', '.', 's', '.'])}
          <div class="tut-piece-info">
            <h4>飛車 → 竜王 (竜)</h4>
            <p>縦横の直進＋成ると<strong>斜め1マス</strong>も追加！</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('角', ['s', '.', 's', '.', 'X', '.', 's', '.', 's'])}
          <div class="tut-piece-info">
            <h4>角行 → 竜馬 (馬)</h4>
            <p>斜めの直進＋成ると<strong>縦横1マス</strong>も追加！</p>
          </div>
        </div>
      </div>
    `,
    content_ru: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('飛', ['.', 's', '.', 's', 'X', 's', '.', 's', '.'])}
          <div class="tut-piece-info">
            <h4>Ладья → Дракон (竜王)</h4>
            <p>Прямые линии + после превращения <strong>шаг по диагонали</strong>!</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('角', ['s', '.', 's', '.', 'X', '.', 's', '.', 's'])}
          <div class="tut-piece-info">
            <h4>Слон → Лошадь (竜馬)</h4>
            <p>Диагонали + после превращения <strong>шаг по прямой</strong>!</p>
          </div>
        </div>
      </div>
    `
  },

  // =========================================================================
  // LESSON 5: PROMOTION (NARU)
  // =========================================================================
  {
    id: 'promotions',
    badge_en: 'Rule · 5/8',
    badge_ja: '成り · 5/8',
    badge_ru: 'Превращение · 5/8',
    title_en: 'Promotion (成る - Naru)',
    title_ja: '駒の成り（パワーアップ）',
    title_ru: 'Превращение фигур (成る)',
    subtitle_en: 'Unlock Vermilion Powers',
    subtitle_ja: '敵陣に入ると駒が裏返る',
    subtitle_ru: 'Превращение в красную фигуру',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[3][2] = { type: PAWN, owner: SENTE };
      b[3][6] = { type: ROOK, owner: SENTE };
      b[1][7] = { type: BISHOP, owner: SENTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    animation: {
      showPromoZone: true,
      steps: [
        {
          duration: 1500,
          bannerType: 'info',
          caption_en: 'A humble Pawn (歩) stands just outside the glowing Promotion Zone.',
          caption_ja: '敵陣（上2段の金色エリア）の直前にいる「歩」に注目！',
          caption_ru: 'Обычная Пешка (歩) стоит прямо перед золотой Зоной превращения.',
          pieces: [{ id: 'tp', kanji: '歩', x: 2, y: 2, owner: 'sente', glow: true }],
          highlights: [{ x: 2, y: 1, type: 'dot' }],
          hand: []
        },
        {
          duration: 1800,
          sfx: 'promo',
          bannerType: 'promo',
          caption_en: 'Steps INSIDE → 3D flip into TOKIN (と)! Now worth almost a Gold General!',
          caption_ja: '敵陣に入ると「と金 (と)」に成り、金と同じ最強の6方向に動けます！',
          caption_ru: 'Шаг внутрь → переворот в ТОКИНА (と)! Ходит как Золотой генерал!',
          pieces: [{ id: 'tp', kanji: 'と', x: 2, y: 1, owner: 'sente', promoted: true, flip: true, glow: true }],
          highlights: [
            { x: 1, y: 0, type: 'dot' }, { x: 2, y: 0, type: 'dot' }, { x: 3, y: 0, type: 'dot' },
            { x: 1, y: 1, type: 'dot' }, { x: 3, y: 1, type: 'dot' }, { x: 2, y: 2, type: 'dot' }
          ],
          hand: []
        },
        {
          duration: 1700,
          sfx: 'move',
          bannerType: 'success',
          caption_en: 'Even if it leaves the zone, it STAYS promoted until captured!',
          caption_ja: '一度「成る」と、敵陣から出ても取られるまでずっと成駒のままです！',
          caption_ru: 'Даже выйдя из зоны, фигура ОСТАЁТСЯ превращённой до взятия!',
          pieces: [{ id: 'tp', kanji: 'と', x: 1, y: 2, owner: 'sente', promoted: true, glow: true }],
          highlights: [{ x: 1, y: 2, type: 'legal' }],
          hand: []
        }
      ]
    },
    content_en: `
      <p>The furthest <strong>3 ranks</strong> (rows 1–3) are your <strong>Promotion Zone</strong>. Moving into, inside, or out of it allows promotion:</p>
      <div class="tut-promo-list">
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>歩</span></span>/<span class="tut-koma mini"><span>香</span></span>/<span class="tut-koma mini"><span>桂</span></span>/<span class="tut-koma mini"><span>銀</span></span> → <span class="tut-koma mini promoted"><span>と</span></span> Move like <strong>Gold General</strong>!</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>飛</span></span>/<span class="tut-koma mini"><span>角</span></span> → <span class="tut-koma mini promoted"><span>竜</span></span>/<span class="tut-koma mini promoted"><span>馬</span></span> Gain <strong>1-step King powers</strong>!</div>
      </div>
      <p class="tut-tip">💡 <strong>Secret tip:</strong> You can also promote by <em>exiting</em> the promotion zone if you declined earlier! (Except Gold & King, which never promote.)</p>
    `,
    content_ja: `
      <p>相手側3段目以内が<strong>敵陣</strong>です。敵陣に<strong>入る・中で動く・出る</strong>時に成れます。</p>
      <div class="tut-promo-list">
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>歩</span></span>・<span class="tut-koma mini"><span>香</span></span>・<span class="tut-koma mini"><span>桂</span></span>・<span class="tut-koma mini"><span>銀</span></span> → <span class="tut-koma mini promoted"><span>と</span></span> <strong>金と同じ動き</strong>に進化！</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>飛</span></span>・<span class="tut-koma mini"><span>角</span></span> → <span class="tut-koma mini promoted"><span>竜</span></span>・<span class="tut-koma mini promoted"><span>馬</span></span> <strong>王の動き1マス分</strong>が追加！</div>
      </div>
      <p class="tut-tip">💡 <strong>豆知識:</strong> 成った駒を取られて相手の持ち駒になると、元の表面（生駒）に戻ります！</p>
    `,
    content_ru: `
      <p>Дальние <strong>3 ряда</strong> — <strong>Зона превращения</strong>. Превратиться можно при входе, ходе внутри или даже выходе из неё:</p>
      <div class="tut-promo-list">
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>歩</span></span>/<span class="tut-koma mini"><span>香</span></span>/<span class="tut-koma mini"><span>桂</span></span>/<span class="tut-koma mini"><span>銀</span></span> → <span class="tut-koma mini promoted"><span>と</span></span> Ходят как <strong>Золото</strong>!</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>飛</span></span>/<span class="tut-koma mini"><span>角</span></span> → <span class="tut-koma mini promoted"><span>竜</span></span>/<span class="tut-koma mini promoted"><span>馬</span></span> Добавляют <strong>ход Короля</strong>!</div>
      </div>
      <p class="tut-tip">💡 <strong>Секрет:</strong> Если захвачена превращённая фигура (например, 竜), на подставку соперника она падает уже обычной (飛)!</p>
    `
  },

  // =========================================================================
  // LESSON 6: DROPS (UCHI)
  // =========================================================================
  {
    id: 'drops',
    badge_en: 'Rule · 6/8',
    badge_ja: '打ち駒 · 6/8',
    badge_ru: 'Сбросы · 6/8',
    title_en: 'Piece Drops (打ち - Uchi)',
    title_ja: '持ち駒を打つ（パラシュート攻撃）',
    title_ru: 'Сброс фигур (打ち - Ути)',
    subtitle_en: 'Parachute Anywhere Unpromoted',
    subtitle_ja: '空きマスならどこでも降下可能',
    subtitle_ru: 'Десант на любую свободную клетку',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[6][4] = { type: PAWN, owner: SENTE };
      const hands = emptyHands();
      hands[SENTE].G = 1;
      hands[SENTE].P = 1;
      return { board: b, hands, turn: SENTE };
    },
    animation: {
      showPromoZone: true,
      steps: [
        {
          duration: 1600,
          bannerType: 'info',
          caption_en: 'Gold (金) waits on your Komadai. Notice you can drop even INSIDE enemy camp!',
          caption_ja: '駒台に「金」があります。敵陣の中にある空きマスにも直接打てます！',
          caption_ru: 'Золотой генерал (金) ждёт на Комадай. Можно сбросить даже прямо в тыл врага!',
          pieces: [
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' },
            { id: 'gp', kanji: '歩', x: 1, y: 1, owner: 'gote' },
            { id: 'sg', kanji: '銀', x: 3, y: 2, owner: 'sente' }
          ],
          highlights: [{ x: 2, y: 1, type: 'legal' }],
          hand: [{ kanji: '金', active: true }]
        },
        {
          duration: 1900,
          sfx: 'check',
          bannerType: 'success',
          caption_en: 'DROP! Gold lands right on the King’s doorstep — CHECKMATE (詰み) on the spot!',
          caption_ja: '金打ちで王手…そして頭金（あたまきん）で即詰み（ツミ）完成！',
          caption_ru: 'СБРОС! Золото приземляется прямо перед Королём — мгновенный МАТ (Атама-кин)!',
          pieces: [
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' },
            { id: 'gp', kanji: '歩', x: 1, y: 1, owner: 'gote' },
            { id: 'sg', kanji: '銀', x: 3, y: 2, owner: 'sente' },
            { id: 'dg', kanji: '金', x: 2, y: 1, owner: 'sente', dropIn: true, glow: true }
          ],
          highlights: [{ x: 2, y: 0, type: 'forbidden', label: '王手' }],
          hand: []
        },
        {
          duration: 1800,
          bannerType: 'promo',
          caption_en: 'Remember: Dropped pieces ALWAYS land UNPROMOTED (even inside the zone)!',
          caption_ja: '注意：持ち駒を敵陣に打つ時、いきなり裏返して（成って）打つことはできません！',
          caption_ru: 'Важно: сброшенные фигуры ВСЕГДА ставятся непревращёнными (перевернуть можно только следующим ходом)!',
          pieces: [
            { id: 'r', kanji: '飛', x: 1, y: 0, owner: 'sente', dropIn: true, glow: true },
            { id: 'gk', kanji: '玉', x: 3, y: 0, owner: 'gote' }
          ],
          highlights: [{ x: 1, y: 0, type: 'legal' }],
          hand: []
        }
      ]
    },
    content_en: `
      <p>On any turn, instead of moving a board piece, you may <strong>drop</strong> a captured piece from your Komadai onto any empty square!</p>
      <div class="tut-card">
        <ul class="tut-ol" style="list-style: disc;">
          <li>You can drop behind enemy lines — even delivering immediate checkmate with a Gold (called <em>Atamakin</em>)!</li>
          <li><strong>No instant promotion:</strong> Dropped pieces always land <strong>unpromoted</strong>. You must move them once on the board to promote.</li>
        </ul>
      </div>
    `,
    content_ja: `
      <p>盤上の駒を動かす代わりに、駒台の持ち駒を空きマスに<strong>「打つ」</strong>ことができます。</p>
      <div class="tut-card">
        <ul class="tut-ol" style="list-style: disc;">
          <li>相手の玉の真上に「金」を打って詰ます手筋は<strong>頭金（あたまきん）</strong>と呼ばれる基本の必殺技です！</li>
          <li><strong>成って打つことは不可：</strong> 持ち駒は敵陣に打つ時も必ず表面（生駒）で打ちます。</li>
        </ul>
      </div>
    `,
    content_ru: `
      <p>Вместо хода фигурой по доске вы можете <strong>сбросить</strong> любую фигуру с Комадай на пустую клетку!</p>
      <div class="tut-card">
        <ul class="tut-ol" style="list-style: disc;">
          <li>Сброс Золота прямо перед носом Короля называется <strong>Атама-кин</strong> («Золото в голову») и часто ставит мгновенный мат!</li>
          <li><strong>Без мгновенного превращения:</strong> фигура с руки всегда падает обычной, даже в зоне превращения.</li>
        </ul>
      </div>
    `
  },

  // =========================================================================
  // LESSON 7: SECRET PRO RULES #1 — NIFU & UCHIFUZUME
  // =========================================================================
  {
    id: 'secret_rules_1',
    badge_en: 'Secret Rules · 7/8',
    badge_ja: '禁じ手・秘伝 · 7/8',
    badge_ru: 'Тайные правила · 7/8',
    title_en: 'Hidden Rules: Nifu & Uchifuzume',
    title_ja: '知らないと反則負け！二歩と打ち歩詰め',
    title_ru: 'Секретные правила: Нифу и Утифудзумэ',
    subtitle_en: 'Fouls Almost Nobody Knows',
    subtitle_ja: 'プロでもうっかりする2つの禁じ手',
    subtitle_ru: 'Запретные ходы, о которых мало кто знает',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[6][4] = { type: PAWN, owner: SENTE };
      const hands = emptyHands();
      hands[SENTE].P = 1;
      return { board: b, hands, turn: SENTE };
    },
    animation: {
      showPromoZone: false,
      steps: [
        {
          duration: 2100,
          sfx: 'check',
          bannerType: 'danger',
          caption_en: '❌ NIFU (二歩) FOUL: Cannot drop a 2nd unpromoted Pawn in the SAME column!',
          caption_ja: '❌ 二歩（にふ）の反則：同じ縦の列に「自分の歩」を2枚並べると即反則負け！',
          caption_ru: '❌ НИФУ (二歩): Нельзя сбрасывать 2-ю обычную Пешку на ту же вертикаль — мгновенный проигрыш!',
          pieces: [
            { id: 'p1', kanji: '歩', x: 2, y: 4, owner: 'sente' },
            { id: 'p2', kanji: '歩', x: 2, y: 2, owner: 'sente', dropIn: true, foul: true }
          ],
          highlights: [{ x: 2, y: 2, type: 'forbidden', label: '二歩 ❌' }],
          hand: [{ kanji: '歩', active: true }]
        },
        {
          duration: 2100,
          sfx: 'move',
          bannerType: 'success',
          caption_en: '✅ SECRET: A TOKIN (と) does NOT count! Dropping a Pawn above your Tokin is 100% LEGAL!',
          caption_ja: '✅ 意外な盲点：自分の「と金 (と)」がいる列なら、歩を打っても二歩にならない！',
          caption_ru: '✅ СЕКРЕТ: Токин (と) не считается! Сбросить Пешку на вертикаль с Токином МОЖНО!',
          pieces: [
            { id: 'tk', kanji: 'と', x: 2, y: 4, owner: 'sente', promoted: true },
            { id: 'p2', kanji: '歩', x: 2, y: 2, owner: 'sente', dropIn: true, glow: true }
          ],
          highlights: [{ x: 2, y: 2, type: 'legal', label: 'OK ✅' }],
          hand: []
        },
        {
          duration: 2200,
          sfx: 'check',
          bannerType: 'danger',
          caption_en: '❌ UCHIFUZUME: Cannot deliver instant CHECKMATE by DROPPING a Pawn from hand!',
          caption_ja: '❌ 打ち歩詰め（うちふづめ）：持ち駒の歩を打って「即詰み」にするのは反則！',
          caption_ru: '❌ УТИФУДЗУМЭ: Запрещено ставить мгновенный МАТ СБРОСОМ пешки с руки!',
          pieces: [
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' },
            { id: 'sk', kanji: '金', x: 2, y: 2, owner: 'sente' },
            { id: 'badp', kanji: '歩', x: 2, y: 1, owner: 'sente', dropIn: true, foul: true }
          ],
          highlights: [{ x: 2, y: 1, type: 'forbidden', label: '禁 ❌' }],
          hand: [{ kanji: '歩', active: true }]
        },
        {
          duration: 2200,
          sfx: 'promo',
          bannerType: 'success',
          caption_en: '✅ SECRET: If the Pawn is ALREADY on the board and PUSHES forward to mate — 100% LEGAL!',
          caption_ja: '✅ 秘伝：盤上の歩を1マス進めて詰ます「突き歩詰め」なら完全に合法の勝ち！',
          caption_ru: '✅ СЕКРЕТ: Но если Пешка УЖЕ стояла на доске и пошла вперёд с матом — это ЛЕГАЛЬНО!',
          pieces: [
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' },
            { id: 'sk', kanji: '金', x: 2, y: 3, owner: 'sente' },
            { id: 'goodp', kanji: '歩', x: 2, y: 1, owner: 'sente', glow: true }
          ],
          highlights: [{ x: 2, y: 1, type: 'legal', label: '詰み ✅' }],
          hand: []
        }
      ]
    },
    content_en: `
      <div class="tut-card">
        <h4 style="color:var(--accent-gold);margin-bottom:4px;">1. Nifu (二歩) & the Tokin Loophole</h4>
        <p>You cannot drop a Pawn onto a file with your unpromoted Pawn — <strong>BUT a promoted Tokin (と) does NOT count as a Pawn!</strong> So dropping a Pawn into a file with your Tokin is legal.</p>
      </div>
      <div class="tut-card">
        <h4 style="color:var(--accent-gold);margin-bottom:4px;">2. Uchifuzume (打ち歩詰め) vs. Pushing Mate</h4>
        <p>Dropping a Pawn to give immediate checkmate is an illegal foul! However: <strong>a)</strong> Dropping a Pawn for check when the King has ANY escape is legal, and <strong>b)</strong> Pushing a Pawn <em>already on the board</em> to checkmate (<em>Tsuki-fuzume</em>) is completely legal!</p>
      </div>
    `,
    content_ja: `
      <div class="tut-card">
        <h4 style="color:var(--accent-gold);margin-bottom:4px;">1. 二歩（にふ）と「と金」の例外</h4>
        <p>同じ列に自分の「歩」が2枚ある状態は反則ですが、<strong>「と金 (と)」になった駒は歩とみなされない</strong>ため、と金がある列に歩を打つのは合法です！</p>
      </div>
      <div class="tut-card">
        <h4 style="color:var(--accent-gold);margin-bottom:4px;">2. 打ち歩詰め vs 突き歩詰め</h4>
        <p>持ち駒の歩を打って即詰みは反則！ただし<strong>①王が逃げられる（合駒できる）単なる王手の歩打ち</strong>はOK、<strong>②盤上の歩を1マス進めて詰ます「突き歩詰め」</strong>も完全合法です！</p>
      </div>
    `,
    content_ru: `
      <div class="tut-card">
        <h4 style="color:var(--accent-gold);margin-bottom:4px;">1. Нифу (二歩) и хитрость с Токином</h4>
        <p>Нельзя сбрасывать Пешку на вертикаль, где есть ваша обычная Пешка. <strong>НО превращённая пешка Токин (と) пешкой не считается</strong> — на её вертикаль сбрасывать можно!</p>
      </div>
      <div class="tut-card">
        <h4 style="color:var(--accent-gold);margin-bottom:4px;">2. Утифудзумэ vs Мат ходом с доски</h4>
        <p>Сбросить Пешку с руки с мгновенным матом — запрещено (поражение). Но <strong>шах сбросом пешки</strong> (если есть защита) или <strong>мат движением пешки с доски</strong> (Цуки-фудзумэ) — полностью разрешены!</p>
      </div>
    `
  },

  // =========================================================================
  // LESSON 8: SECRET PRO RULES #2 — DEAD-END, PERPETUAL CHECK & IMPASSE
  // =========================================================================
  {
    id: 'secret_rules_2',
    badge_en: 'Pro Secrets · 8/8',
    badge_ja: '上級ルール · 8/8',
    badge_ru: 'Секреты профи · 8/8',
    title_en: 'No-Escape Ranks, Perpetual Check & Impasse',
    title_ja: '行き所のない駒・連続王手の千日手・持将棋',
    title_ru: 'Тупики, вечный шах и вторжение короля',
    subtitle_en: 'Rare Rules Even Veterans Forget',
    subtitle_ja: '知っておくと差がつく将棋の奥深きルール',
    subtitle_ru: 'Редкие правила для настоящих мастеров',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[3][2] = { type: KNIGHT, owner: SENTE };
      b[2][6] = { type: LANCE, owner: SENTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    animation: {
      showPromoZone: true,
      steps: [
        {
          duration: 2000,
          sfx: 'promo',
          bannerType: 'promo',
          caption_en: 'DEAD-END MANDATORY PROMOTION: Knight on rows 1–2 (or Pawn/Lance row 1) MUST promote!',
          caption_ja: '行き所のない駒：桂馬が1〜2段目（歩・香は1段目）に進む時は必ず成らなければなりません！',
          caption_ru: 'ТУПИКОВЫЕ ПОЛЯ: Конь на рядах 1–2 (Пешка/Копьё на 1-м) ОБЯЗАНЫ превратиться!',
          pieces: [{ id: 'kn', kanji: '成桂', x: 1, y: 1, owner: 'sente', promoted: true, flip: true, glow: true }],
          highlights: [{ x: 1, y: 1, type: 'legal', label: '必須' }],
          hand: []
        },
        {
          duration: 2100,
          sfx: 'check',
          bannerType: 'danger',
          caption_en: 'PERPETUAL CHECK FOUL: Repeating a board 4× is a Draw — UNLESS giving continuous check (checker LOSES)!',
          caption_ja: '連続王手の千日手：同一局面4回は引き分け…ただし連続王手を仕掛けた側が反則負け！',
          caption_ru: 'ВЕЧНЫЙ ШАХ: 4 повтора позиции = ничья, НО при вечном шахе дающий шах ПРОИГРЫВАЕТ!',
          pieces: [
            { id: 'gk', kanji: '玉', x: 2, y: 0, owner: 'gote' },
            { id: 'sr', kanji: '竜', x: 2, y: 2, owner: 'sente', promoted: true, foul: true }
          ],
          highlights: [
            { x: 2, y: 0, type: 'forbidden', label: '4× ❌' }
          ],
          hand: []
        },
        {
          duration: 2200,
          sfx: 'move',
          bannerType: 'success',
          caption_en: 'IMPASSE (入玉 24-Pt Rule): If both Kings safely invade enemy camp, points decide! (Major=5, Minor=1)',
          caption_ja: '持将棋・24点法：両者の玉が敵陣に入り詰まない時、大駒5点・小駒1点の合計点で勝敗判定！',
          caption_ru: 'ВТОРЖЕНИЕ (Правило 24 очков): Если оба Короля вошли в тыл врага — считают очки (飛/角=5, остальные=1)!',
          pieces: [
            { id: 'sk', kanji: '王', x: 1, y: 1, owner: 'sente', glow: true },
            { id: 'gk', kanji: '玉', x: 3, y: 4, owner: 'gote', glow: true }
          ],
          highlights: [
            { x: 1, y: 1, type: 'legal', label: '24+' },
            { x: 3, y: 4, type: 'legal', label: '24+' }
          ],
          hand: [{ kanji: '飛', active: true }]
        }
      ]
    },
    content_en: `
      <div class="tut-card">
        <p><strong>1. No-Escape Squares (行き所のない駒):</strong> Pawns/Lances on the final rank & Knights on the final 2 ranks <em>must</em> promote (and cannot be dropped there), because they'd have zero legal moves left.</p>
      </div>
      <div class="tut-card">
        <p><strong>2. Sennichite & Perpetual Check:</strong> If the exact same position, turn & hand repeats <strong>4 times</strong>, it's a draw — EXCEPT if one side gives continuous check: <em>the checker loses by foul!</em></p>
      </div>
      <div class="tut-card">
        <p><strong>3. King Invasion Impasse (持将棋):</strong> When both Kings escape into the enemy promotion zone (<em>Nyugyoku</em>), Rook/Bishop = <strong>5 pts</strong>, other pieces (excl. Kings) = <strong>1 pt</strong>. Both players with ≥24 points = Draw; under 24 points = Loss!</p>
      </div>
    `,
    content_ja: `
      <div class="tut-card">
        <p><strong>1. 行き所のない駒:</strong> 動けなくなる場所（1段目の歩・香、1〜2段目の桂）へは必ず成って進む必要があり、そこに打つこともできません。</p>
      </div>
      <div class="tut-card">
        <p><strong>2. 千日手と連続王手:</strong> 盤面・持ち駒・手番が<strong>4回同じ</strong>になると引き分け（千日手）ですが、<strong>連続王手</strong>による千日手は王手をかけた側の反則負けになります！</p>
      </div>
      <div class="tut-card">
        <p><strong>3. 入玉・持将棋 (24点法):</strong> お互いの玉が敵陣に入り詰まない時、飛・角＝<strong>5点</strong>、その他の駒＝<strong>1点</strong>で計算し、双方が24点以上なら引き分け（24点未満の側は負け）になります！</p>
      </div>
    `,
    content_ru: `
      <div class="tut-card">
        <p><strong>1. Тупиковые поля:</strong> Пешка и Копьё на последнем ряду, а Конь на 2 последних рядах обязаны превратиться (и туда нельзя их сбрасывать).</p>
      </div>
      <div class="tut-card">
        <p><strong>2. Сэннити-тэ и Вечный шах:</strong> 4-кратное повторение позиции — ничья, КРОМЕ <strong>вечного шаха</strong>: тот, кто непрерывно шахует, <em>терпит поражение</em>!</p>
      </div>
      <div class="tut-card">
        <p><strong>3. Вторжение королей (Правило 24 очков):</strong> Если оба короля прорвались в тыл врага и мат невозможен: Ладья/Слон = <strong>5 очков</strong>, остальные = <strong>1 очко</strong>. Кто набрал &lt;24 очков — проигрывает!</p>
      </div>
    `
  }
];


// --- Begin: js/audio.js ---
/**
 * Shogi Web - Procedural Sound Effects & Traditional Japanese BGM Synthesizer
 * Uses Web Audio API for authentic wooden piece clack and traditional Koto & Shakuhachi melodies.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    let muted = false;
    let bgmMuted = false;
    let bgmVolume = 0.4;

    try {
      muted = localStorage.getItem('shogi_muted') === 'true';
      bgmMuted = localStorage.getItem('shogi_bgm_muted') === 'true';
      const storedVol = localStorage.getItem('shogi_bgm_volume');
      if (storedVol !== null) bgmVolume = parseFloat(storedVol);
    } catch (e) {}

    this.muted = muted;
    this.bgmMuted = bgmMuted;
    this.bgmVolume = bgmVolume;

    this.bgmTimer = null;
    this.isBgmPlaying = false;
    this.bgmGainNode = null;

    // 4 Selectable Traditional & Atmospheric Songs
    this.songs = [
      { id: 'sakura_spring', nameEn: 'Sakura Breeze (桜風)', nameJa: '桜風 (Sakura)', nameRu: 'Ветер сакуры (桜風)' },
      { id: 'koto_zen', nameEn: 'Moonlit Kaya Garden (月夜)', nameJa: '月夜の榧庭 (Koto)', nameRu: 'Лунный сад (月夜)' },
      { id: 'samurai_duel', nameEn: "Shogun's Battle (将軍の陣)", nameJa: '将軍の陣 (Taiko)', nameRu: 'Битва сёгуна (将軍の陣)' },
      { id: 'misty_temple', nameEn: 'Misty Kyoto Temple (古寺)', nameJa: '霧の古寺 (Temple)', nameRu: 'Храм в тумане (古寺)' }
    ];

    let savedSong = 'sakura_spring';
    try {
      savedSong = localStorage.getItem('shogi_bgm_song') || 'sakura_spring';
    } catch (e) {}
    this.currentSongId = this.songs.some(s => s.id === savedSong) ? savedSong : 'sakura_spring';

    // Song 1: Sakura Miyako-bushi Pentatonic (E4, F4, A4, B4, C5, E5, F5, A5)
    this.sakuraFrequencies = [
      329.63, 349.23, 440.00, 493.88, 523.25, 659.25, 698.46, 880.00
    ];
    this.sakuraPhrases = [
      [2, 2, 3, 2, 2, 3],
      [2, 3, 4, 3, 2, 3, 2, 1],
      [0, 1, 2, 1, 0],
      [2, 3, 4, 5, 4, 3, 2],
      [1, 0, 1, 2, 0]
    ];

    // Song 2: Traditional Hirajōshi (平調子) Koto Pentatonic Scale
    this.hirajoshiFrequencies = [
      146.83, 164.81, 174.61, 220.00, 233.08,
      293.66, 329.63, 349.23, 440.00, 466.16,
      587.33, 659.25, 698.46
    ];
    this.phrases = [
      [5, 7, 8, 5],
      [8, 9, 10, 8, 7],
      [3, 5, 7, 5, 3],
      [7, 8, 7, 5, 2],
      [10, 9, 8, 7, 5],
      [5, 8, 10, 12, 10, 8],
      [2, 3, 5, 7, 5],
      [8, 7, 5, 3, 0]
    ];

    // Song 3: Yo-scale Battle Motif (D4, E4, G4, A4, B4, D5, E5, G5)
    this.battleFrequencies = [
      293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99
    ];
    this.battlePhrases = [
      [0, 2, 3, 5, 3, 2],
      [3, 5, 7, 5, 3, 2, 0],
      [2, 3, 4, 3, 2, 0],
      [5, 3, 2, 0, 2, 3]
    ];

    // Song 4: Misty Temple In-sen meditative bells (C4, Db4, F4, G4, Bb4, C5, F5)
    this.templeFrequencies = [
      261.63, 277.18, 349.23, 392.00, 466.16, 523.25, 698.46
    ];
    this.templePhrases = [
      [0, 3, 5],
      [2, 4, 6],
      [1, 3, 2, 0],
      [5, 4, 3, 0]
    ];

    this.currentPhraseIdx = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('shogi_muted', this.muted);
    } catch (e) {}
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // --- Background Music (BGM) Controls ---

  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
      this.bgmMuted = true;
    } else {
      this.bgmMuted = false;
      this.startBgm();
    }
    try {
      localStorage.setItem('shogi_bgm_muted', this.bgmMuted);
    } catch (e) {}
    return this.isBgmPlaying;
  }

  setBgmVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('shogi_bgm_volume', this.bgmVolume);
    } catch (e) {}
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.35, this.ctx.currentTime);
    }
  }

  startBgm() {
    if (this.bgmMuted) return;
    this.init();
    if (!this.ctx || this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    if (!this.bgmGainNode) {
      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.35, this.ctx.currentTime);
      this.bgmGainNode.connect(this.ctx.destination);
    }

    this.scheduleNextBgmPhrase();
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // Procedural Koto Pluck Synthesizer
  playKotoString(freq, delay = 0, duration = 1.4) {
    if (!this.ctx || !this.isBgmPlaying) return;

    const t = this.ctx.currentTime + delay;

    // Dual oscillator modeling acoustic Koto string harmonics
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Body resonant filter (Paulownia wood Koto chamber)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(350, t + duration);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t); // 1st overtone

    // Pluck attack & natural decay
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGainNode);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Shakuhachi Flute Breath Tone Drone
  playShakuhachiNote(freq, delay = 0, duration = 3.5) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Gentle natural vibrato
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(4.8, t); // 4.8 Hz gentle vibrato
    vibratoGain.gain.setValueAtTime(freq * 0.015, t);

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Soft breath fade in and long fade out
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);

    vibrato.start(t);
    osc.start(t);
    vibrato.stop(t + duration);
    osc.stop(t + duration);
  }

  getSongList() {
    return this.songs;
  }

  getCurrentSong() {
    return this.songs.find(s => s.id === this.currentSongId) || this.songs[0];
  }

  setSong(songId) {
    if (!this.songs.some(s => s.id === songId)) return;
    this.currentSongId = songId;
    this.currentPhraseIdx = 0;
    try {
      localStorage.setItem('shogi_bgm_song', songId);
    } catch (e) {}
    if (this.isBgmPlaying) {
      this.stopBgm();
      this.startBgm();
    }
  }

  nextSong() {
    const idx = this.songs.findIndex(s => s.id === this.currentSongId);
    const next = this.songs[(idx + 1) % this.songs.length];
    this.setSong(next.id);
    return next;
  }

  // Deep Taiko Drum Hit
  playTaikoDrum(delay = 0, intensity = 0.55) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.35);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(intensity, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);
    osc.start(t);
    osc.stop(t + 0.56);
  }

  // Temple Singing Bell / Furin Chime
  playTempleBell(freq, delay = 0, duration = 4.2) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    [1, 2.756, 5.4].forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, t);

      const amp = i === 0 ? 0.28 : (i === 1 ? 0.1 : 0.04);
      const dec = duration / (i + 1);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(amp, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dec);

      osc.connect(gain);
      gain.connect(this.bgmGainNode);
      osc.start(t);
      osc.stop(t + dec + 0.05);
    });
  }

  // Crisp Shamisen Pluck
  playShamisenPluck(freq, delay = 0, duration = 0.55) {
    if (!this.ctx || !this.isBgmPlaying) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(420, t + duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGainNode);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  // Sequence melodies for the active song
  scheduleNextBgmPhrase() {
    if (!this.isBgmPlaying) return;

    let timeOffset = 0;
    let restDelay = 2.5;

    if (this.currentSongId === 'sakura_spring') {
      const phrase = this.sakuraPhrases[this.currentPhraseIdx % this.sakuraPhrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.sakuraFrequencies[noteIdx];
        const spacing = (i === phrase.length - 1) ? 0.95 : 0.48;
        this.playKotoString(freq, timeOffset, 1.9);
        if (i % 3 === 0) {
          this.playKotoString(freq * 0.5, timeOffset + 0.04, 2.4);
        }
        timeOffset += spacing;
      });
      this.playShakuhachiNote(this.sakuraFrequencies[phrase[0]] * 0.5, 0.15, 3.6);
      restDelay = 1.6 + Math.random() * 1.1;
    } else if (this.currentSongId === 'samurai_duel') {
      const phrase = this.battlePhrases[this.currentPhraseIdx % this.battlePhrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.battleFrequencies[noteIdx];
        this.playShamisenPluck(freq, timeOffset, 0.55);
        if (i % 2 === 0) {
          this.playTaikoDrum(timeOffset, i === 0 ? 0.65 : 0.35);
        }
        timeOffset += 0.32;
      });
      if (this.currentPhraseIdx % 2 === 0) {
        this.playShakuhachiNote(this.battleFrequencies[phrase[0]] * 0.5, 0.1, 2.2);
      }
      restDelay = 0.8 + Math.random() * 0.6;
    } else if (this.currentSongId === 'misty_temple') {
      const phrase = this.templePhrases[this.currentPhraseIdx % this.templePhrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.templeFrequencies[noteIdx];
        this.playTempleBell(freq, timeOffset, 4.0);
        timeOffset += 1.05;
      });
      this.playShakuhachiNote(this.templeFrequencies[phrase[0]] * 0.5, 0.4, 4.5);
      restDelay = 2.4 + Math.random() * 1.4;
    } else {
      // Default: koto_zen (Moonlit Kaya Garden)
      const phrase = this.phrases[this.currentPhraseIdx % this.phrases.length];
      this.currentPhraseIdx++;
      phrase.forEach((noteIdx, i) => {
        const freq = this.hirajoshiFrequencies[noteIdx];
        const spacing = 0.45 + (i % 2 === 0 ? 0.15 : 0.0);
        this.playKotoString(freq, timeOffset, 1.6);
        timeOffset += spacing;
      });
      if (Math.random() < 0.65) {
        const fluteFreq = this.hirajoshiFrequencies[phrase[0]] * 0.5;
        this.playShakuhachiNote(fluteFreq, 0.2, 3.5);
      }
      restDelay = 2.2 + Math.random() * 1.6;
    }

    const nextDelay = (timeOffset + restDelay) * 1000;
    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBgmPhrase();
    }, nextDelay);
  }

  // --- Sound Effects (SFX) ---

  // Realistic Japanese wooden piece "Pachi!" clack
  playPieceClack() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.07);

    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);

    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Heavier wooden capture snap
  playCapture() {
    if (this.muted) return;
    this.playPieceClack();
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.02;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playDrop() {
    this.playPieceClack();
  }

  playPromotion() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [659.25, 880.0, 1174.66];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  playCheck() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(740, t + 0.09);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const melody = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    melody.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }
}


// --- Begin: js/tutorialAnimator.js ---
/**
 * Shogi Web - Animated Tutorial Theater Engine
 * Renders high-quality scripted piece animations on a crafted 5x5 Kaya wood board
 * with Komadai stand, 3D promotion flips, knight leap arcs, captures, drops,
 * and secret rule demonstrations in English, Japanese, and Russian.
 */

class TutorialAnimator {
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


// --- Begin: js/ui.js ---
/**
 * Shogi Web - UI & Board Renderer
 * Handles rendering the 9x9 board, pieces, komadai, animations, selection, highlights, and user interactions.
 */




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

class ShogiUI {
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

      if (this.moveAnalysis && this.moveAnalysis[idx]) {
        const info = this.moveAnalysis[idx];
        const badge = document.createElement('span');
        badge.className = `move-badge ${info.quality}`;
        badge.textContent = info.symbol;
        badge.title = `${info.quality.toUpperCase()} (loss: ${info.cpLoss})`;
        li.appendChild(badge);
      }

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


// --- Begin: js/app.js ---
/**
 * Shogi Web - Main Application Coordinator
 * Enhanced with Multi-Language Support, Japanese BGM Synthesizer, Account & ELO Rating System.
 */













class ShogiApp {
  constructor() {
    this.game = new ShogiGame();
    this.audio = new AudioManager();
    this.ai = new ShogiAI('tactician');
    this.analyzer = new GameAnalyzer();
    this.accountManager = new AccountManager();
    this.currentAnalysis = null;
    this.currentGameId = null;

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
    this.tutorialStageMode = 'anim'; // 'anim' or 'board'
    this.tutorialAnimator = new TutorialAnimator('tutorial-animator-mount', this.audio);

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
      this.tutorialAnimator.setLanguage(getLanguage());
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

    document.getElementById('history-open-btn')?.addEventListener('click', () => this.openHistoryModal());
    document.getElementById('hero-history-btn')?.addEventListener('click', () => this.openHistoryModal());
    document.getElementById('history-close-btn')?.addEventListener('click', () => this.closeHistoryModal());
    document.getElementById('analyze-game-btn')?.addEventListener('click', () => this.runPostGameAnalysis());

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

    // Japanese BGM Toggle & Song Track Switcher
    const bgmToggleBtn = document.getElementById('bgm-toggle-btn');
    if (bgmToggleBtn) {
      bgmToggleBtn.addEventListener('click', () => {
        const playing = this.audio.toggleBgm();
        bgmToggleBtn.textContent = playing ? '🎵 BGM: ON' : '🎵 BGM: OFF';
        this.updateBgmModalState();
      });
    }

    const bgmNextBtn = document.getElementById('bgm-next-btn');
    if (bgmNextBtn) {
      bgmNextBtn.addEventListener('click', () => {
        if (!this.audio.isBgmPlaying) {
          this.audio.bgmMuted = false;
          this.audio.startBgm();
          if (bgmToggleBtn) bgmToggleBtn.textContent = '🎵 BGM: ON';
        }
        const song = this.audio.nextSong();
        const songSelect = document.getElementById('modal-bgm-song-select');
        if (songSelect) songSelect.value = song.id;
        this.updateBgmModalState();
      });
    }

    const modalSongSelect = document.getElementById('modal-bgm-song-select');
    if (modalSongSelect) {
      modalSongSelect.value = this.audio.currentSongId;
      modalSongSelect.addEventListener('change', (e) => {
        this.audio.setSong(e.target.value);
        if (!this.audio.isBgmPlaying) {
          this.audio.bgmMuted = false;
          this.audio.startBgm();
          if (bgmToggleBtn) bgmToggleBtn.textContent = '🎵 BGM: ON';
        }
        this.updateBgmModalState();
      });
    }

    // Animated Tutorial Theater vs 9x9 Practice Board Toggle
    document.getElementById('tut-tab-anim')?.addEventListener('click', () => {
      this.setTutorialStageMode('anim');
    });
    document.getElementById('tut-tab-board')?.addEventListener('click', () => {
      this.setTutorialStageMode('board');
    });

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

    // SFEN button
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
    this.tutorialAnimator.stop();
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
    this.updateAnalysisCalloutForPly(clamped);
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
    let outcome = null;
    if (this.game.status === 'checkmate' || this.game.status === 'resigned') {
      outcome = this.game.winner === this.humanPlayer ? 1.0 : 0.0;
    } else if (this.game.status === 'repetition_draw' || this.game.status === 'stalemate') {
      outcome = 0.5;
    }

    // Save finished game to History Archive
    if (this.game.moveHistory.length > 0 && (this.mode === 'ai' || this.mode === 'pvp')) {
      const resultLabel = outcome === 1.0 ? 'win' : (outcome === 0.0 ? 'loss' : 'draw');
      const opponentName = this.mode === 'ai'
        ? (this.randomOpponentInfo ? this.randomOpponentInfo.name : `${t('aiOpponent')} (${this.ai.difficulty})`)
        : 'Pass & Play (Player 2)';

      this.currentGameId = this.currentGameId || ('g_' + Date.now());
      this.accountManager.saveGameRecord({
        id: this.currentGameId,
        date: new Date().toISOString(),
        mode: this.mode,
        opponentName,
        playerSide: this.humanPlayer,
        result: resultLabel,
        status: this.game.status,
        totalMoves: this.game.moveHistory.length,
        moves: this.game.moveHistory.map(m => ({
          from: m.from,
          to: m.to,
          promote: Boolean(m.promote),
          isDrop: Boolean(m.isDrop),
          pieceType: m.pieceType
        }))
      });
    }

    // Auto-run post-game move analysis when a match ends
    if (this.game.moveHistory.length > 0 && (this.mode === 'ai' || this.mode === 'pvp')) {
      this.runPostGameAnalysis();
    }

    if (this.mode !== 'ai' || !this.accountManager.isLoggedIn()) return;

    if (outcome !== null) {
      const result = this.accountManager.updateGameResult(outcome, this.getAiRating());
      this.updateUserDisplay();

      if (result) {
        const deltaStr = result.delta >= 0 ? `+${result.delta}` : `${result.delta}`;
        const toast = document.createElement('div');
        toast.className = 'status-alert alert-winner';
        toast.style.marginTop = '10px';
        toast.innerHTML = `⭐ <strong>Rating Update:</strong> ${deltaStr} (New Rating: <strong>${result.newRating}</strong> · ${this.getLocalizedRankTitle(result.rank)})`;
        document.getElementById('game-status-banner')?.appendChild(toast);
      }
    }
  }

  runPostGameAnalysis() {
    if (!this.game || this.game.moveHistory.length === 0) return;
    const analysis = this.analyzer.analyzeGame(this.game.moveHistory);
    this.currentAnalysis = analysis;
    this.ui.moveAnalysis = analysis.moves;

    if (this.currentGameId) {
      this.accountManager.updateGameAnalysis(this.currentGameId, analysis.summary);
    }

    this.renderAnalysisSummary(analysis);
    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1] || null;
    this.ui.render(lastMove);
  }

  renderAnalysisSummary(analysis) {
    const card = document.getElementById('analysis-summary-card');
    const accRow = document.getElementById('analysis-accuracy-row');
    const countsGrid = document.getElementById('analysis-counts-grid');
    if (!card || !accRow || !countsGrid) return;

    card.classList.remove('hidden');
    const s = analysis.summary;

    accRow.innerHTML = `
      <div class="acc-box">
        <div class="acc-side">☗ Sente ${t('accuracyLabel')}</div>
        <div class="acc-val">${s.senteAccuracy}%</div>
      </div>
      <div class="acc-box">
        <div class="acc-side">☖ Gote ${t('accuracyLabel')}</div>
        <div class="acc-val">${s.goteAccuracy}%</div>
      </div>
    `;

    const c = (this.humanPlayer === GOTE && this.mode === 'ai') ? s.goteCounts : s.senteCounts;
    const keys = [
      { key: 'brilliant', lbl: t('qualityBrilliant') },
      { key: 'great', lbl: t('qualityGreat') },
      { key: 'medium', lbl: t('qualityMedium') },
      { key: 'bad', lbl: t('qualityBad') },
      { key: 'terrible', lbl: t('qualityTerrible') }
    ];

    countsGrid.innerHTML = keys.map(k => {
      const q = MOVE_QUALITIES[k.key];
      return `
        <div class="analysis-count-pill">
          <span class="pill-sym move-badge ${k.key}" style="margin:0;">${q.symbol}</span>
          <span class="pill-num">${c[k.key]}</span>
          <span class="pill-lbl">${k.lbl}</span>
        </div>
      `;
    }).join('');
  }

  updateAnalysisCalloutForPly(ply) {
    const callout = document.getElementById('analysis-move-callout');
    if (!callout || !this.currentAnalysis || !this.currentAnalysis.moves[ply]) {
      callout?.classList.add('hidden');
      return;
    }
    const info = this.currentAnalysis.moves[ply];
    const lang = getLanguage();
    const qMeta = MOVE_QUALITIES[info.quality];
    const qLabel = qMeta[`label_${lang}`] || qMeta.label_en;
    callout.classList.remove('hidden');
    callout.innerHTML = `
      <strong>#${ply + 1}</strong> · <span class="move-badge ${info.quality}" style="margin:0 4px 0 0;">${info.symbol}</span>
      <strong>${qLabel}</strong>
      ${info.bestMoveNotation && info.cpLoss > 25 ? ` · Best: <code>${info.bestMoveNotation}</code>` : ''}
    `;
  }

  openHistoryModal() {
    const modal = document.getElementById('history-modal');
    const container = document.getElementById('history-list-container');
    if (!modal || !container) return;

    const games = this.accountManager.getGameHistory();
    if (games.length === 0) {
      container.innerHTML = `<p class="text-muted" style="text-align:center;padding:24px;">${t('historyEmpty')}</p>`;
    } else {
      container.innerHTML = games.map((g, idx) => {
        const dt = new Date(g.date).toLocaleString();
        const accText = g.analysisSummary ? ` · ${t('accuracyLabel')}: ${g.analysisSummary.senteAccuracy}%` : '';
        return `
          <div class="history-game-row">
            <div class="history-game-meta">
              <div class="history-game-title">
                <span class="history-result-pill ${g.result}">${g.result}</span>
                <span>vs ${g.opponentName}</span>
              </div>
              <div class="history-game-sub">${dt} · ${g.totalMoves} moves${accText}</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm replay-history-btn" data-idx="${idx}">
              ${t('btnReplayAnalyze')}
            </button>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.replay-history-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const g = games[parseInt(btn.dataset.idx, 10)];
          if (g) this.loadHistoryGameForReview(g);
        });
      });
    }

    modal.classList.add('visible');
  }

  closeHistoryModal() {
    document.getElementById('history-modal')?.classList.remove('visible');
  }

  loadHistoryGameForReview(record) {
    this.closeHistoryModal();
    this.mode = record.mode || 'pvp';
    this.humanPlayer = record.playerSide ?? SENTE;
    this.showGameView();

    this.game.reset();
    (record.moves || []).forEach(m => {
      this.game.makeMove({
        from: m.from,
        to: m.to,
        promote: m.promote,
        isDrop: m.isDrop,
        pieceType: m.pieceType
      });
    });

    this.currentGameId = record.id;
    this.replayPlyIndex = null;
    this.ui.viewingGame = null;
    this.ui.activePly = null;
    this.ui.clearSelection();
    this.runPostGameAnalysis();
    this.goToReplayPly(0);
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

    // Show tutorial mode bar when in tutorial mode
    document.getElementById('tutorial-mode-bar')?.classList.toggle('hidden', newMode !== 'tutorial');

    if (newMode === 'tutorial') {
      this.setTutorialStageMode('anim');
      this.loadLesson(this.currentLessonIdx);
    } else {
      this.tutorialAnimator.stop();
      this.toggleBoardArenaVisibility(true);
      if (newMode === 'puzzle') {
        this.loadPuzzle(this.currentPuzzleIdx);
      } else {
        this.startNewGame();
      }
    }
  }

  toggleBoardArenaVisibility(showBoard) {
    document.getElementById('tutorial-stage-card')?.classList.toggle('hidden', showBoard);
    document.querySelector('.gote-panel')?.classList.toggle('hidden', !showBoard);
    document.querySelector('.board-stage')?.classList.toggle('hidden', !showBoard);
    document.querySelector('.sente-panel')?.classList.toggle('hidden', !showBoard);
  }

  setTutorialStageMode(stageMode) {
    this.tutorialStageMode = stageMode;
    document.getElementById('tut-tab-anim')?.classList.toggle('active', stageMode === 'anim');
    document.getElementById('tut-tab-board')?.classList.toggle('active', stageMode === 'board');

    if (stageMode === 'anim') {
      this.toggleBoardArenaVisibility(false);
      const lesson = TUTORIAL_LESSONS[this.currentLessonIdx];
      if (lesson && lesson.animation) {
        this.tutorialAnimator.loadLessonAnimation(lesson.animation, getLanguage());
      }
    } else {
      this.tutorialAnimator.stop();
      this.toggleBoardArenaVisibility(true);
    }
  }

  startNewGame() {
    this.game.reset();
    this.currentAnalysis = null;
    this.currentGameId = 'g_' + Date.now();
    this.ui.moveAnalysis = null;
    document.getElementById('analysis-summary-card')?.classList.add('hidden');
    document.getElementById('analysis-move-callout')?.classList.add('hidden');
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

    // Load animated demonstration for this lesson if in animation tab
    if (this.mode === 'tutorial' && this.tutorialStageMode === 'anim' && lesson.animation) {
      this.tutorialAnimator.loadLessonAnimation(lesson.animation, lang);
    }

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



  // Expose to global/root
  root.SENTE = typeof SENTE !== 'undefined' ? SENTE : 0;
  root.GOTE = typeof GOTE !== 'undefined' ? GOTE : 1;
  root.PAWN = typeof PAWN !== 'undefined' ? PAWN : 'P';
  root.LANCE = typeof LANCE !== 'undefined' ? LANCE : 'L';
  root.KNIGHT = typeof KNIGHT !== 'undefined' ? KNIGHT : 'N';
  root.SILVER = typeof SILVER !== 'undefined' ? SILVER : 'S';
  root.GOLD = typeof GOLD !== 'undefined' ? GOLD : 'G';
  root.BISHOP = typeof BISHOP !== 'undefined' ? BISHOP : 'B';
  root.ROOK = typeof ROOK !== 'undefined' ? ROOK : 'R';
  root.KING = typeof KING !== 'undefined' ? KING : 'K';
  root.PROM_ROOK = typeof PROM_ROOK !== 'undefined' ? PROM_ROOK : '+R';
  root.PROM_BISHOP = typeof PROM_BISHOP !== 'undefined' ? PROM_BISHOP : '+B';
  root.PROM_SILVER = typeof PROM_SILVER !== 'undefined' ? PROM_SILVER : '+S';
  root.PROM_KNIGHT = typeof PROM_KNIGHT !== 'undefined' ? PROM_KNIGHT : '+N';
  root.PROM_LANCE = typeof PROM_LANCE !== 'undefined' ? PROM_LANCE : '+L';
  root.PROM_PAWN = typeof PROM_PAWN !== 'undefined' ? PROM_PAWN : '+P';
  root.PIECE_INFO = typeof PIECE_INFO !== 'undefined' ? PIECE_INFO : null;
  root.ShogiGame = typeof ShogiGame !== 'undefined' ? ShogiGame : null;
  root.ShogiAI = typeof ShogiAI !== 'undefined' ? ShogiAI : null;
  root.ShogiUI = typeof ShogiUI !== 'undefined' ? ShogiUI : null;
  root.AudioManager = typeof AudioManager !== 'undefined' ? AudioManager : null;
  root.AccountManager = typeof AccountManager !== 'undefined' ? AccountManager : null;
  root.t = typeof t !== 'undefined' ? t : null;
  root.setLanguage = typeof setLanguage !== 'undefined' ? setLanguage : null;
  root.getLanguage = typeof getLanguage !== 'undefined' ? getLanguage : null;
  root.TSUMESHOGI_PUZZLES = typeof TSUMESHOGI_PUZZLES !== 'undefined' ? TSUMESHOGI_PUZZLES : null;
  root.TUTORIAL_LESSONS = typeof TUTORIAL_LESSONS !== 'undefined' ? TUTORIAL_LESSONS : null;

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
