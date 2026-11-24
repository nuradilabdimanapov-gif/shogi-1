#!/bin/bash
# Shogi Web Launcher Script
cd "$(dirname "$0")"
PORT="${1:-3000}"
echo "Starting Shogi Web Server on port $PORT..."
python3 server.py "$PORT"
