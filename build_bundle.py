#!/usr/bin/env python3
"""
Bundle generator: combines modular ES6 scripts into a single self-contained bundle
allowing index.html to be opened directly in browsers (file:// protocol) as well as over HTTP.
"""
import re
import os

DIR = os.path.dirname(os.path.abspath(__file__))

files = [
    'js/engine/constants.js',
    'js/i18n.js',
    'js/accounts.js',
    'js/engine/shogi.js',
    'js/engine/ai.js',
    'js/engine/puzzles.js',
    'js/engine/tutorial.js',
    'js/audio.js',
    'js/ui.js',
    'js/app.js'
]

combined = "/**\n * Shogi Web - Complete Standalone Bundle\n */\n"
combined += "(function(root) {\n'use strict';\n\n"

for rel_path in files:
    full_path = os.path.join(DIR, rel_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Strip multi-line and single-line import statements:
    content = re.sub(r'import\s*\{[\s\S]*?\}\s*from\s*[\'"].*?[\'"];?', '', content)
    content = re.sub(r'import\s+.*?from\s+[\'"].*?[\'"];?', '', content)
    # Strip 'export default ' and 'export '
    content = re.sub(r'\bexport\s+default\s+', '', content)
    content = re.sub(r'\bexport\s+', '', content)

    combined += f"// --- Begin: {rel_path} ---\n"
    combined += content + "\n\n"

# Expose key classes to globalThis/root so tests and console debugging have direct access
combined += """
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
"""

out_path = os.path.join(DIR, 'js', 'bundle.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(combined)

print(f"Re-generated standalone bundle: {out_path} ({len(combined)} bytes)")
