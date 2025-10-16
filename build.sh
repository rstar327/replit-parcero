#!/bin/bash
set -e

echo "Building frontend..."
vite build

echo "Building backend..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Setting up static file structure for production..."
# Create the public directory structure that the server expects
mkdir -p dist/public
cp -r dist/public/* dist/public/ 2>/dev/null || true

echo "Build complete!"
echo "- Frontend built to: dist/public/"
echo "- Backend built to: dist/index.js"
echo "- Static files ready for production serving"