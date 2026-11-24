# 🏯 Shogi Web (将棋) — The Art & Strategy of Japanese Chess

A modern, authentic, fullstack Japanese Chess (Shogi) web application featuring an intelligent AI engine, online matchmaking, Pass & Play, Tsumeshogi mating puzzles, multi-language support, Dan/Kyu ratings, and procedural traditional Japanese music.

![Shogi Web](https://img.shields.io/badge/Language-JavaScript%20ES6-yellow)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Vercel%20%7C%20Cloudflare-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **🏯 Main Landing Page**: Traditional Japanese aesthetic with watermark calligraphy (`将`), player status badge, and glowing call-to-action match starter.
- **🤖 Intelligent AI Bots**: 4 tailored skill levels:
  - 🐣 **Novice (初級 / ~1000 ELO · 15-Kyu)** — Forgiving moves, perfect for beginners.
  - ⚔️ **Apprentice (中級 / ~1250 ELO · 8-Kyu)** — Solid tactical play and defense.
  - 🏯 **Tactician (上級 / ~1500 ELO · 2-Kyu)** — Sharp calculation, active drops, and castle attacks.
  - 👑 **Master (有段者 / ~1750 ELO · Dan Master)** — Minimax evaluation with piece-square tables and endgame pressure.
- **👥 Multiplayer & Matchmaking**:
  - **Invite a Friend / Pass & Play**: Shareable room link or local two-player hotseat mode.
  - **Random Opponent Matchmaking**: Animated radar scanner that matches you against simulated active players near your rating.
- **📜 Move History & Replay**: Step through moves with standard Japanese notation (`☗7六歩`) using `[⏮ First]`, `[◀ Prev]`, `[▶ Next]`, and `[⏭ Latest]` controls, or click any move directly in the log to inspect the board.
- **👤 Player Accounts & Official Rating**:
  - ELO rating calculations with Dan/Kyu ranking ladder (from 15-Kyu apprentice to 5-Dan Grandmaster).
  - Client-side persistence via `localStorage` with optional backend sync.
- **🎵 Traditional Japanese Audio**:
  - Procedural Web Audio API synthesizer generating traditional Koto and Shakuhachi melodies.
  - Authentic wooden piece snap sound effects (*"Pachi!"*).
- **🎨 Custom Aesthetics & Accessibility**:
  - 3 board themes: Traditional Kaya Wood (本榧), Zen Slate Dark (玄昌石), and Sakura Cherry Blossom (桜).
  - 4 piece inscription styles: Traditional 2-Kanji, Simplified 1-Kanji, International Western symbols, and Beginner Guide with movement dots.
- **🌐 Internationalization (i18n)**: 1-click toggle between English and Japanese (日本語).
- **📦 100% Zero-Dependency Standalone Mode**: Can be deployed to any static host or opened directly as `shogi.html` in any browser offline.

---

## 📁 Project Structure

```
shogi-web/
├── index.html            # Main web entrypoint (optimized for Vercel / Cloudflare Pages)
├── shogi.html            # 100% standalone single-file version (CSS + JS all inlined)
├── css/
│   ├── styles.css        # Layout, themes, landing page, and general styling
│   ├── board.css         # 9x9 Shogi board grid and coordinate markers
│   ├── pieces.css        # Traditional wooden pieces and promotion rendering
│   └── modal.css         # Match setup wizard, settings, and account modals
├── js/
│   ├── app.js            # Main application controller and event bindings
│   ├── ui.js             # Board renderer, komadai stands, and history log
│   ├── audio.js          # Web Audio synthesizer for BGM and piece snaps
│   ├── accounts.js       # Player account management, ELO, and Dan-Kyu ranks
│   ├── i18n.js           # English / Japanese internationalization dictionary
│   ├── bundle.js         # Unified client bundle for direct browser execution
│   └── engine/
│       ├── shogi.js      # Complete rules engine (Drops, Promotion, Nifu, Uchifuzume)
│       ├── ai.js         # Minimax search AI with heuristic evaluation
│       ├── constants.js  # Piece types, movement vectors, initial setup
│       ├── puzzles.js    # Tsumeshogi mating puzzles
│       └── tutorial.js   # Academy lessons and opening guides
├── tests/
│   ├── test_engine.js    # Core rules & engine test suite
│   └── test_puzzles.js   # Checkmate and Uchifuzume test suite
├── server.py             # Optional lightweight Python HTTP backend
├── run.sh                # Local launcher script
├── build_bundle.py       # Bundle generation utility
└── build_single_file.py  # Standalone single-file HTML generator
```

---

## 🚀 Deployment to Vercel & Cloudflare Pages

This project is completely static (HTML, CSS, JavaScript) and requires **no build step** or server configuration.

### Deploying to Vercel
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New Project"** -> **"Import Git Repository"**.
3. Select your `shogi-web` repository.
4. Leave settings as default:
   - **Framework Preset**: *Other*
   - **Root Directory**: `./`
   - **Build Command**: *(leave empty)*
   - **Output Directory**: *(leave empty)*
5. Click **"Deploy"**. Your site will be live on `https://your-repo-name.vercel.app`!

### Deploying to Cloudflare Pages
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages**.
2. Click **"Create Application"** -> **"Pages"** -> **"Connect to Git"**.
3. Select your `shogi-web` repository.
4. Set **Build command** to empty and **Build output directory** to `/`.
5. Click **"Save and Deploy"**.

---

## 💻 Running Locally

### Option 1: Direct in Browser (No Server)
Double-click `shogi.html` or `index.html` in Finder, or open it in Chrome / Safari / Edge.

### Option 2: Local Server
```bash
./run.sh
# Server starts at http://localhost:3000
```
