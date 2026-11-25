/**
 * Shogi Web - Internationalization (i18n) Module
 * Supports English (en) and Japanese (ja)
 */

export const TRANSLATIONS = {
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
    btnFinishTutorial: '⚔️ Finish Tutorial & Play'
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
    btnFinishTutorial: '⚔️ チュートリアル完了・対局へ'
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
    btnFinishTutorial: '⚔️ Завершить обучение и играть'
  }
};

let currentLang = 'en';
try {
  currentLang = localStorage.getItem('shogi_language') || 'en';
} catch (e) {}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
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

export function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

// Update all DOM elements with data-i18n attributes
export function updatePageText() {
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
