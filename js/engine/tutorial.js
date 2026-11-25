/**
 * Shogi Web - Interactive Multi-Language Animated Tutorial Lessons (8 Lessons)
 * Covers Rules, Piece Movements, Promotions, Drops, and Hidden Pro Rules (Nifu, Uchifuzume,
 * Mandatory Promotion, Perpetual Check Foul, and 24-Point Impasse).
 * Supports English (en), Japanese (ja), and Russian (ru).
 */

import { SENTE, GOTE, KING, ROOK, BISHOP, GOLD, SILVER, KNIGHT, LANCE, PAWN } from './constants.js';

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

export const TUTORIAL_LESSONS = [
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
