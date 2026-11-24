/**
 * Shogi Web - Interactive Tutorial Lessons
 */

export const TUTORIAL_LESSONS = [
  {
    id: 'intro',
    title: 'Introduction to Shogi (将棋)',
    subtitle: 'The Game of Generals',
    badge: 'Basics',
    content: `
      <p><strong>Shogi</strong> (literally "General's Chess") is Japan's historic two-player strategy board game. Played on a <strong>9x9 grid</strong> with 40 wedge-shaped pieces, it features two distinct players:</p>
      <ul>
        <li><strong>Sente (先手 / Black)</strong>: Moves first, starts from the bottom (ranks 7-9).</li>
        <li><strong>Gote (後手 / White)</strong>: Moves second, starts from the top (ranks 1-3).</li>
      </ul>
      <p>Pieces are distinguished not by color, but by the direction their point faces (towards the opponent) and the Kanji characters inscribed upon them.</p>
    `
  },
  {
    id: 'pieces_basics',
    title: 'The Basic Pieces',
    subtitle: 'Pawns, Lances, and Knights',
    badge: 'Movement',
    content: `
      <div class="tutorial-piece-card">
        <h4>歩兵 (Pawn - Fuhyo)</h4>
        <p>Moves <strong>1 square directly forward</strong>. Unlike Western chess, it also <em>captures</em> directly forward!</p>
      </div>
      <div class="tutorial-piece-card">
        <h4>香車 (Lance - Kyosha)</h4>
        <p>Moves forward <strong>any number of empty squares</strong> along its file. Known as the "spear", it cannot move backward or sideways.</p>
      </div>
      <div class="tutorial-piece-card">
        <h4>桂馬 (Knight - Keima)</h4>
        <p>Moves <strong>2 squares forward and 1 square sideways</strong> (an L-shape). It is the <em>only</em> piece that can jump over other pieces, but only forwards!</p>
      </div>
    `
  },
  {
    id: 'pieces_generals',
    title: 'The Generals & The King',
    subtitle: 'Silver, Gold, and Royal Leadership',
    badge: 'Movement',
    content: `
      <div class="tutorial-piece-card">
        <h4>銀将 (Silver General - Gin)</h4>
        <p>Moves <strong>1 square forward or 1 square diagonally</strong> (5 possible directions). Its diagonal retreat makes it agile in both attack and defense.</p>
      </div>
      <div class="tutorial-piece-card">
        <h4>金将 (Gold General - Kin)</h4>
        <p>Moves <strong>1 square orthogonally (forward, back, left, right) or 1 square forward-diagonally</strong> (6 directions). The ultimate defensive piece and mating finisher!</p>
      </div>
      <div class="tutorial-piece-card">
        <h4>王将 / 玉将 (King - Osho / Gyoku)</h4>
        <p>Moves <strong>1 square in any of the 8 directions</strong>. Protect your King at all costs—if it is checkmated, the game is lost.</p>
      </div>
    `
  },
  {
    id: 'pieces_major',
    title: 'The Major Pieces',
    subtitle: 'Rooks and Bishops',
    badge: 'Major Pieces',
    content: `
      <div class="tutorial-piece-card">
        <h4>飛車 (Rook - Hisha)</h4>
        <p>Moves <strong>any number of empty squares horizontally or vertically</strong>. The most powerful attacking piece on the board.</p>
      </div>
      <div class="tutorial-piece-card">
        <h4>角行 (Bishop - Kaku)</h4>
        <p>Moves <strong>any number of empty squares diagonally</strong> in any of the 4 diagonal directions.</p>
      </div>
    `
  },
  {
    id: 'promotions',
    title: 'Promotion (成る - Naru)',
    subtitle: 'Ascending into Greater Power',
    badge: 'Key Rule',
    content: `
      <p>When a piece enters, moves within, or exits the <strong>Promotion Zone</strong> (the furthest 3 ranks from your side):</p>
      <ul>
        <li><strong>Rook → Dragon (竜王)</strong>: Gains King's 1-step diagonal moves in addition to full sliding!</li>
        <li><strong>Bishop → Horse (竜馬)</strong>: Gains King's 1-step orthogonal moves in addition to diagonal sliding!</li>
        <li><strong>Pawn, Lance, Knight, Silver → Move like Gold General!</strong> (Tokin, Promoted Lance, Promoted Knight, Promoted Silver).</li>
        <li><strong>Gold & King</strong> never promote.</li>
      </ul>
      <p class="highlight-tip"><em>Tip:</em> Pawns and Lances reaching the final rank, and Knights reaching the final two ranks, <strong>must promote</strong> because they would have no legal moves remaining.</p>
    `
  },
  {
    id: 'drops',
    title: 'Piece Drops (打ち - Uchi)',
    subtitle: 'Shogi’s Unique & Dynamic Core',
    badge: 'Crucial Rule',
    content: `
      <p>Unlike Western chess, <strong>captured pieces are never lost</strong>! They sit on your piece stand (<em>Komadai</em>) and on any turn, you may <strong>drop</strong> a piece onto any empty square as your move!</p>
      <h4>3 Essential Drop Restrictions:</h4>
      <ol>
        <li><strong>No dead-end drops</strong>: You cannot drop a Pawn/Lance on the last rank, or a Knight on the last two ranks.</li>
        <li><strong>Nifu (二歩 - Two Pawns)</strong>: You cannot drop a Pawn into a file (column) that already contains your unpromoted friendly pawn!</li>
        <li><strong>Uchifuzume (打ち歩詰め)</strong>: You cannot deliver instant checkmate with a dropped Pawn. (Checking is legal, but checkmate by drop is a foul).</li>
      </ol>
    `
  }
];
