/**
 * Shogi Web - Interactive Multi-Language Tutorial Lessons
 * Supports English (en), Japanese (ja), and Russian (ru)
 * Includes crafted mini-board movement diagrams and live interactive 9x9 board setups.
 */

import { SENTE, GOTE, KING, ROOK, BISHOP, GOLD, SILVER, KNIGHT, LANCE, PAWN, PROM_ROOK, PROM_BISHOP, PROM_PAWN } from './constants.js';

function emptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function emptyHands() {
  return {
    [SENTE]: { R: 0, B: 0, G: 0, S: 0, N: 0, L: 0, P: 0 },
    [GOTE]: { R: 0, B: 0, G: 0, S: 0, N: 0, L: 0, P: 0 }
  };
}

// Helper to render a 3x3 or 5x5 mini movement grid with a crafted pentagonal koma
function diagram(kanji, cells, promoted = false, size = 3) {
  // cells: array of strings of length size*size: '.' empty, 'X' piece, 'o' step dot, 's' slide/arrow, 'j' jump
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

export const TUTORIAL_LESSONS = [
  {
    id: 'intro',
    badge_en: 'Basics',
    badge_ja: '基本',
    badge_ru: 'Основы',
    title_en: 'Introduction to Shogi (将棋)',
    title_ja: '将棋入門 — 盤面と基本ルール',
    title_ru: 'Введение в Сёги (将棋)',
    subtitle_en: 'The Game of Generals',
    subtitle_ja: '9×9の盤上で繰り広げる知略戦',
    subtitle_ru: 'Игра генералов на доске 9×9',
    setupBoard: () => null, // Use standard starting position!
    content_en: `
      <div class="tut-hero-banner">
        <div class="tut-koma large"><span>王将</span></div>
        <div>
          <p><strong>Shogi</strong> ("General's Chess") is played on a <strong>9×9 wooden board</strong> with 40 pentagonal wedge-shaped pieces.</p>
        </div>
      </div>
      <div class="tut-card">
        <div class="tut-side-row">
          <div class="tut-side-pill sente"><span class="tut-koma mini"><span>王</span></span> <strong>Sente (先手)</strong> — Moves 1st (bottom, pointing UP)</div>
          <div class="tut-side-pill gote"><span class="tut-koma mini flipped"><span>玉</span></span> <strong>Gote (後手)</strong> — Moves 2nd (top, pointing DOWN)</div>
        </div>
      </div>
      <p class="tut-tip">💡 <strong>Try it on the board!</strong> Click any piece on the bottom rows to see its glowing legal moves.</p>
    `,
    content_ja: `
      <div class="tut-hero-banner">
        <div class="tut-koma large"><span>王将</span></div>
        <div>
          <p><strong>将棋</strong>は<strong>9×9の盤面</strong>と40枚の五角形の駒を使って戦う、日本伝統の頭脳ゲームです。</p>
        </div>
      </div>
      <div class="tut-card">
        <div class="tut-side-row">
          <div class="tut-side-pill sente"><span class="tut-koma mini"><span>王</span></span> <strong>先手 (☗)</strong> — 下側・上向き（先に指す）</div>
          <div class="tut-side-pill gote"><span class="tut-koma mini flipped"><span>玉</span></span> <strong>後手 (☖)</strong> — 上側・下向き（後に指す）</div>
        </div>
      </div>
      <p class="tut-tip">💡 <strong>盤上で試してみよう！</strong> 手前の駒をクリックすると移動できるマスが光ります。</p>
    `,
    content_ru: `
      <div class="tut-hero-banner">
        <div class="tut-koma large"><span>王将</span></div>
        <div>
          <p><strong>Сёги</strong> («шахматы генералов») — японская стратегическая игра на деревянной доске <strong>9×9</strong> с 40 пятиугольными фигурами.</p>
        </div>
      </div>
      <div class="tut-card">
        <div class="tut-side-row">
          <div class="tut-side-pill sente"><span class="tut-koma mini"><span>王</span></span> <strong>Сэнтэ (先手)</strong> — ходит 1-м (снизу, остриём ВВЕРХ)</div>
          <div class="tut-side-pill gote"><span class="tut-koma mini flipped"><span>玉</span></span> <strong>Готэ (後手)</strong> — ходит 2-м (сверху, остриём ВНИЗ)</div>
        </div>
      </div>
      <p class="tut-tip">💡 <strong>Попробуйте прямо сейчас!</strong> Нажмите на любую свою фигуру на доске, чтобы увидеть доступные ходы.</p>
    `
  },
  {
    id: 'pieces_basics',
    badge_en: 'Movement',
    badge_ja: '駒の動き',
    badge_ru: 'Ходы фигур',
    title_en: 'Pawn, Lance & Knight',
    title_ja: '歩・香・桂の動き',
    title_ru: 'Пешка, Копьё и Конь',
    subtitle_en: 'Forward-Marching Soldiers',
    subtitle_ja: '前線へ進む基本の駒',
    subtitle_ru: 'Фигуры, идущие вперёд',
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
    content_en: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('歩', ['.', 'o', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>Pawn (歩兵 · Fuhyo)</h4>
            <p>Moves and captures <strong>1 square straight forward</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('香', ['.', 's', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>Lance (香車 · Kyosha)</h4>
            <p>Slides forward <strong>any number of empty squares</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('桂', ['.', 'j', '.', 'j', '.', '.', '.', '.', '.', '.', '.', '.', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'], false, 5)}
          <div class="tut-piece-info">
            <h4>Knight (桂馬 · Keima)</h4>
            <p>Jumps <strong>2 forward + 1 sideways</strong>. Can leap over pieces!</p>
          </div>
        </div>
      </div>
      <p class="tut-tip">💡 Click the <strong>歩, 香, 桂</strong> pieces on the board to test their moves!</p>
    `,
    content_ja: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('歩', ['.', 'o', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>歩兵 (ふ)</h4>
            <p><strong>前に1マス</strong>だけ進めます（取る時も同じ）。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('香', ['.', 's', '.', '.', 'X', '.', '.', '.', '.'])}
          <div class="tut-piece-info">
            <h4>香車 (きょう)</h4>
            <p><strong>前へまっすぐ何マスでも</strong>進めます（戻れません）。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('桂', ['.', 'j', '.', 'j', '.', '.', '.', '.', '.', '.', '.', '.', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'], false, 5)}
          <div class="tut-piece-info">
            <h4>桂馬 (けい)</h4>
            <p><strong>前2マス＋左右1マス</strong>に駒を飛び越えて跳ねます。</p>
          </div>
        </div>
      </div>
      <p class="tut-tip">💡 盤上の <strong>歩・香・桂</strong> をクリックして動きを確認しよう！</p>
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
            <p>Скользит вперёд на <strong>любое число свободных клеток</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('桂', ['.', 'j', '.', 'j', '.', '.', '.', '.', '.', '.', '.', '.', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'], false, 5)}
          <div class="tut-piece-info">
            <h4>Конь (桂馬 · Кэйма)</h4>
            <p>Прыгает на <strong>2 вперёд и 1 вбок</strong> (через фигуры).</p>
          </div>
        </div>
      </div>
      <p class="tut-tip">💡 Нажмите на <strong>歩, 香, 桂</strong> на доске, чтобы проверить их ходы!</p>
    `
  },
  {
    id: 'pieces_generals',
    badge_en: 'Movement',
    badge_ja: '金・銀・王',
    badge_ru: 'Генералы и Король',
    title_en: 'Silver, Gold & King',
    title_ja: '銀将・金将・王将',
    title_ru: 'Серебро, Золото и Король',
    subtitle_en: 'Royal Guard & Attackers',
    subtitle_ja: '攻守の要となる将たち',
    subtitle_ru: 'Защита и решающий удар',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[5][2] = { type: SILVER, owner: SENTE };
      b[5][4] = { type: GOLD, owner: SENTE };
      b[5][6] = { type: KING, owner: SENTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    content_en: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('銀', ['o', 'o', 'o', '.', 'X', '.', 'o', '.', 'o'])}
          <div class="tut-piece-info">
            <h4>Silver General (銀将 · Gin)</h4>
            <p><strong>5 directions:</strong> 1 step forward or any diagonal.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('金', ['o', 'o', 'o', 'o', 'X', 'o', '.', 'o', '.'])}
          <div class="tut-piece-info">
            <h4>Gold General (金将 · Kin)</h4>
            <p><strong>6 directions:</strong> All orthogonal + forward diagonals.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('王', ['o', 'o', 'o', 'o', 'X', 'o', 'o', 'o', 'o'])}
          <div class="tut-piece-info">
            <h4>King (王将 · Osho)</h4>
            <p><strong>8 directions:</strong> 1 step anywhere. Protect at all costs!</p>
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
            <p><strong>前と斜め4方向</strong>の計5マスに動けます。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('金', ['o', 'o', 'o', 'o', 'X', 'o', '.', 'o', '.'])}
          <div class="tut-piece-info">
            <h4>金将 (きん)</h4>
            <p><strong>斜め後ろ以外</strong>の6方向に動けます。守りの要！</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('王', ['o', 'o', 'o', 'o', 'X', 'o', 'o', 'o', 'o'])}
          <div class="tut-piece-info">
            <h4>王将・玉将 (おう)</h4>
            <p><strong>周囲8方向すべて</strong>に1マス動けます。詰まされたら負け。</p>
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
            <p><strong>5 направлений:</strong> 1 шаг вперёд или по любой диагонали.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('金', ['o', 'o', 'o', 'o', 'X', 'o', '.', 'o', '.'])}
          <div class="tut-piece-info">
            <h4>Золотой генерал (金将)</h4>
            <p><strong>6 направлений:</strong> все прямые + вперёд по диагонали.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('王', ['o', 'o', 'o', 'o', 'X', 'o', 'o', 'o', 'o'])}
          <div class="tut-piece-info">
            <h4>Король (王将 · Осё)</h4>
            <p><strong>8 направлений:</strong> 1 шаг в любую сторону.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'pieces_major',
    badge_en: 'Major Pieces',
    badge_ja: '大駒',
    badge_ru: 'Старшие фигуры',
    title_en: 'Rook & Bishop',
    title_ja: '飛車と角行（大駒）',
    title_ru: 'Ладья и Слон',
    subtitle_en: 'Long-Range Powerhouses',
    subtitle_ja: '盤面を制圧する最強の駒',
    subtitle_ru: 'Дальнобойная мощь',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[5][3] = { type: ROOK, owner: SENTE };
      b[5][5] = { type: BISHOP, owner: SENTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    content_en: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('飛', ['.', 's', '.', 's', 'X', 's', '.', 's', '.'])}
          <div class="tut-piece-info">
            <h4>Rook (飛車 · Hisha)</h4>
            <p>Slides <strong>any distance horizontally or vertically</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('角', ['s', '.', 's', '.', 'X', '.', 's', '.', 's'])}
          <div class="tut-piece-info">
            <h4>Bishop (角行 · Kaku)</h4>
            <p>Slides <strong>any distance diagonally</strong> in all 4 directions.</p>
          </div>
        </div>
      </div>
      <p class="tut-tip">💡 Click <strong>飛</strong> and <strong>角</strong> on the board to see their long-range lines!</p>
    `,
    content_ja: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('飛', ['.', 's', '.', 's', 'X', 's', '.', 's', '.'])}
          <div class="tut-piece-info">
            <h4>飛車 (ひしゃ)</h4>
            <p><strong>縦・横に何マスでも</strong>進める最強の攻撃駒です。</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('角', ['s', '.', 's', '.', 'X', '.', 's', '.', 's'])}
          <div class="tut-piece-info">
            <h4>角行 (かく)</h4>
            <p><strong>斜め4方向に何マスでも</strong>進めます。</p>
          </div>
        </div>
      </div>
      <p class="tut-tip">💡 盤上の <strong>飛車</strong> と <strong>角行</strong> をクリックして射程を見てみよう！</p>
    `,
    content_ru: `
      <div class="tut-piece-grid">
        <div class="tut-piece-card">
          ${diagram('飛', ['.', 's', '.', 's', 'X', 's', '.', 's', '.'])}
          <div class="tut-piece-info">
            <h4>Ладья (飛車 · Хися)</h4>
            <p>Скользит на <strong>любое расстояние по вертикали и горизонтали</strong>.</p>
          </div>
        </div>
        <div class="tut-piece-card">
          ${diagram('角', ['s', '.', 's', '.', 'X', '.', 's', '.', 's'])}
          <div class="tut-piece-info">
            <h4>Слон (角行 · Каку)</h4>
            <p>Скользит на <strong>любое расстояние по всем 4 диагоналям</strong>.</p>
          </div>
        </div>
      </div>
      <p class="tut-tip">💡 Нажмите на <strong>飛</strong> и <strong>角</strong> на доске, чтобы увидеть их линии атаки!</p>
    `
  },
  {
    id: 'promotions',
    badge_en: 'Key Rule',
    badge_ja: '成り',
    badge_ru: 'Превращение',
    title_en: 'Promotion (成る - Naru)',
    title_ja: '駒の成り（パワーアップ）',
    title_ru: 'Превращение фигур (成る)',
    subtitle_en: 'Entering the Enemy Camp',
    subtitle_ja: '敵陣3段目で駒が裏返る！',
    subtitle_ru: 'Усиление в зоне соперника',
    setupBoard: () => {
      const b = emptyBoard();
      b[8][4] = { type: KING, owner: SENTE };
      b[0][4] = { type: KING, owner: GOTE };
      b[3][2] = { type: PAWN, owner: SENTE };
      b[3][6] = { type: ROOK, owner: SENTE };
      b[1][7] = { type: BISHOP, owner: SENTE };
      return { board: b, hands: emptyHands(), turn: SENTE };
    },
    content_en: `
      <p>The furthest <strong>3 ranks</strong> (rows 1–3) are your <strong>Promotion Zone</strong>. Moving into, within, or out of it lets you flip your piece!</p>
      <div class="tut-promo-list">
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>飛</span></span> → <span class="tut-koma mini promoted"><span>竜</span></span> <strong>Dragon</strong> (+King diagonals)</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>角</span></span> → <span class="tut-koma mini promoted"><span>馬</span></span> <strong>Horse</strong> (+King orthogonals)</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>歩</span></span> → <span class="tut-koma mini promoted"><span>と</span></span> <strong>Tokin / Silver / Knight / Lance</strong> → Move like <strong>Gold</strong>!</div>
      </div>
      <p class="tut-tip">💡 Move the <strong>歩</strong> or <strong>飛</strong> into rank 1–3 on the board to see the Promotion popup!</p>
    `,
    content_ja: `
      <p>相手側の奥3段（1〜3段目）は<strong>敵陣</strong>です。敵陣に入る・中で動く・出る時に駒を裏返して<strong>成る</strong>ことができます！</p>
      <div class="tut-promo-list">
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>飛</span></span> → <span class="tut-koma mini promoted"><span>竜</span></span> <strong>竜王</strong>（飛車＋斜め1マス）</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>角</span></span> → <span class="tut-koma mini promoted"><span>馬</span></span> <strong>竜馬</strong>（角＋縦横1マス）</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>歩</span></span> → <span class="tut-koma mini promoted"><span>と</span></span> <strong>と金・成銀・成桂・成香</strong> → <strong>金将</strong>と同じ動きに！</div>
      </div>
      <p class="tut-tip">💡 盤上の <strong>歩</strong> や <strong>飛</strong> を敵陣に動かして「成る」を体験しよう！</p>
    `,
    content_ru: `
      <p>Дальние <strong>3 ряда</strong> (ряды 1–3) — ваша <strong>Зона превращения</strong>. Войдя в неё, двигаясь внутри или выходя из неё, можно перевернуть фигуру!</p>
      <div class="tut-promo-list">
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>飛</span></span> → <span class="tut-koma mini promoted"><span>竜</span></span> <strong>Дракон</strong> (+шаг по диагонали)</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>角</span></span> → <span class="tut-koma mini promoted"><span>馬</span></span> <strong>Лошадь</strong> (+шаг по прямой)</div>
        <div class="tut-promo-pair"><span class="tut-koma mini"><span>歩</span></span> → <span class="tut-koma mini promoted"><span>と</span></span> <strong>Токин / Серебро / Конь / Копьё</strong> → ходят как <strong>Золото</strong>!</div>
      </div>
      <p class="tut-tip">💡 Сделайте ход <strong>歩</strong> или <strong>飛</strong> в верхние 3 ряда, чтобы увидеть окно превращения!</p>
    `
  },
  {
    id: 'drops',
    badge_en: 'Crucial Rule',
    badge_ja: '持ち駒・打ち',
    badge_ru: 'Сброс фигур',
    title_en: 'Piece Drops (打ち - Uchi)',
    title_ja: '持ち駒を打つ（将棋最大の醍醐味）',
    title_ru: 'Сброс фигур (打ち - Ути)',
    subtitle_en: 'Captured Allies Return!',
    subtitle_ja: '取った駒は自分の戦力になる',
    subtitle_ru: 'Захваченные фигуры возвращаются в бой!',
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
    content_en: `
      <p>Captured pieces sit on your <strong>Komadai (stand)</strong> and can be <strong>dropped</strong> onto any empty square as your turn!</p>
      <div class="tut-card">
        <strong>3 Drop Rules:</strong>
        <ol class="tut-ol">
          <li><strong>No dead-end drops</strong>: Pawn/Lance cannot drop on rank 1; Knight cannot drop on ranks 1–2.</li>
          <li><strong>Nifu (二歩)</strong>: Cannot drop a Pawn on a file that already has your unpromoted Pawn.</li>
          <li><strong>Uchifuzume</strong>: Cannot deliver immediate checkmate with a dropped Pawn.</li>
        </ol>
      </div>
      <p class="tut-tip">💡 Click the <strong>金</strong> or <strong>歩</strong> on your Komadai stand below the board and drop it onto the board!</p>
    `,
    content_ja: `
      <p>相手から取った駒は<strong>駒台（持ち駒）</strong>に置かれ、自分の手番で盤上の好きな空きマスに<strong>打つ</strong>ことができます！</p>
      <div class="tut-card">
        <strong>打ち駒の3つのルール:</strong>
        <ol class="tut-ol">
          <li><strong>行き所のない駒</strong>：動けない場所（1段目の歩・香、1〜2段目の桂）には打てません。</li>
          <li><strong>二歩 (にふ)</strong>：自分の「歩」がすでにある縦の列には歩を打てません。</li>
          <li><strong>打ち歩詰め</strong>：歩を打って即座に詰みにすることは反則です。</li>
        </ol>
      </div>
      <p class="tut-tip">💡 盤下の駒台にある <strong>金</strong> や <strong>歩</strong> をクリックして盤上に打ってみよう！</p>
    `,
    content_ru: `
      <p>Захваченные фигуры попадают на ваш <strong>Комадай (подставку)</strong>, и в свой ход вы можете <strong>сбросить</strong> их на любую свободную клетку!</p>
      <div class="tut-card">
        <strong>3 правила сброса:</strong>
        <ol class="tut-ol">
          <li><strong>Нет тупиковых сбросов</strong>: Пешку/Копьё нельзя сбросить на 1-й ряд, Коня — на 1–2-й ряды.</li>
          <li><strong>Нифу (二歩)</strong>: Нельзя сбрасывать Пешку на вертикаль, где уже стоит ваша непревращённая Пешка.</li>
          <li><strong>Утифудзумэ</strong>: Нельзя объявлять мгновенный мат сбросом Пешки.</li>
        </ol>
      </div>
      <p class="tut-tip">💡 Нажмите на <strong>金</strong> или <strong>歩</strong> на подставке под доской и поставьте её на поле!</p>
    `
  }
];
