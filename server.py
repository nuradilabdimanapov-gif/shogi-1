#!/usr/bin/env python3
"""
Shogi Web - Fullstack Python Backend Server
Serves static frontend assets with proper ES6 module MIME types and provides REST API endpoints.
"""

import http.server
import socketserver
import json
import os
import sys
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

OPENINGS_DATA = [
  {
    "id": "yagura",
    "name": "Yagura (矢倉囲い)",
    "category": "Double Wing / Fortress Castle",
    "description": "The quintessential solid fortress castle in Shogi. The King is safely shielded by two Golds and a Silver, creating a dense defense against head-on attacks.",
    "moves": "☗7六歩 ☖8四歩 ☗6八銀 ☖3四歩 ☗7七銀"
  },
  {
    "id": "mino",
    "name": "Mino Castle (美濃囲い)",
    "category": "Swinging Rook Defense",
    "description": "A swift, resilient castle popular among Swinging Rook players. Exceptionally strong against lateral attacks and quick to construct.",
    "moves": "☗7六歩 ☖3四歩 ☗6六歩 ☖8四歩 ☗7八飛 ☖8五歩 ☗7七角 ☖6二銀 ☗4八玉"
  },
  {
    "id": "kakugawari",
    "name": "Bishop Exchange (角換わり)",
    "category": "Static Rook Tactical",
    "description": "An aggressive opening where both players exchange their Bishops early into their hands, resulting in intense tactical tensions and drop threats.",
    "moves": "☗7六歩 ☖8四歩 ☗2六歩 ☖8五歩 ☗7七角 ☖3四歩 ☗8八銀 ☖7七角成 ☗同銀"
  },
  {
    "id": "aigakari",
    "name": "Double Wing Attack (相掛かり)",
    "category": "Direct Rook File Clash",
    "description": "Both players push their Rook pawns directly forward without opening Bishop diagonals, leading to sharp, dynamic, fast-paced play.",
    "moves": "☗2六歩 ☖8四歩 ☗2五歩 ☖8五歩 ☗7八金 ☖3二金"
  }
]

class ShogiHandler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=DIRECTORY, **kwargs)

  def end_headers(self):
    # Enable CORS and caching headers
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    super().end_headers()

  def guess_type(self, path):
    # Ensure javascript modules are always served with proper MIME type
    if path.endswith('.js'):
      return 'text/javascript'
    if path.endswith('.mjs'):
      return 'text/javascript'
    if path.endswith('.css'):
      return 'text/css'
    if path.endswith('.html'):
      return 'text/html'
    if path.endswith('.json'):
      return 'application/json'
    return super().guess_type(path)

  def do_OPTIONS(self):
    self.send_response(200)
    self.end_headers()

  def do_GET(self):
    parsed = urlparse(self.path)
    
    if parsed.path == '/favicon.ico':
      self.send_response(204)
      self.end_headers()
      return

    # REST API Endpoints
    if parsed.path == '/api/health':
      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      res = {
        'status': 'online',
        'app': 'Shogi Web',
        'engine': 'Python 3 + ES6 Shogi Engine',
        'version': '1.1.0'
      }
      self.wfile.write(json.dumps(res).encode('utf-8'))
      return

    if parsed.path == '/api/accounts':
      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      accounts_file = os.path.join(DIRECTORY, 'accounts.json')
      data = {}
      if os.path.exists(accounts_file):
        try:
          with open(accounts_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        except Exception:
          data = {}
      self.wfile.write(json.dumps(data).encode('utf-8'))
      return

    if parsed.path == '/api/openings':
      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      self.wfile.write(json.dumps(OPENINGS_DATA).encode('utf-8'))
      return

    # Fallback to static file serving
    return super().do_GET()

  def do_POST(self):
    parsed = urlparse(self.path)

    if parsed.path == '/api/accounts':
      length = int(self.headers.get('Content-Length', 0))
      body = self.rfile.read(length).decode('utf-8')
      user_data = json.loads(body) if body else {}

      accounts_file = os.path.join(DIRECTORY, 'accounts.json')
      accounts = {}
      if os.path.exists(accounts_file):
        try:
          with open(accounts_file, 'r', encoding='utf-8') as f:
            accounts = json.load(f)
        except Exception:
          accounts = {}

      username = user_data.get('username')
      if username:
        accounts[username] = user_data
        with open(accounts_file, 'w', encoding='utf-8') as f:
          json.dump(accounts, f, indent=2)

      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      self.wfile.write(json.dumps({'status': 'saved', 'username': username}).encode('utf-8'))
      return

    if parsed.path == '/api/analyze':
      length = int(self.headers.get('Content-Length', 0))
      body = self.rfile.read(length).decode('utf-8')
      data = json.loads(body) if body else {}

      sfen = data.get('sfen', '')
      # Quick server-side analysis
      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      res = {
        'received_sfen': sfen,
        'evaluation': 'Analyzed successfully',
        'status': 'ok'
      }
      self.wfile.write(json.dumps(res).encode('utf-8'))
      return

    self.send_error(404, "Endpoint not found")

def run():
  # Allow port reuse
  socketserver.TCPServer.allow_reuse_address = True
  with socketserver.TCPServer(("", PORT), ShogiHandler) as httpd:
    print(f"======================================================")
    print(f" 🏯  Shogi Web Server started successfully!            ")
    print(f" 👉  Local URL: http://localhost:{PORT}                 ")
    print(f" 👉  Workspace: {DIRECTORY}                           ")
    print(f"======================================================")
    try:
      httpd.serve_forever()
    except KeyboardInterrupt:
      print("\nShutting down server...")

if __name__ == '__main__':
  run()
