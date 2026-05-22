#!/bin/bash
# Build script for Anime Streamer

echo "=== Anime Streamer Build ==="
echo "Running tests..."
cd "$(dirname "$0")/.."
npx jest || exit 1

echo ""
echo "All tests passed. Building..."
npm run build || exit 1

echo ""
echo "Build complete! Check dist/ directory."
