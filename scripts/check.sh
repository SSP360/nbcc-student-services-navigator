#!/usr/bin/env bash
set -euo pipefail

echo "Running tests..."
npm test

echo "Building app..."
npm run build

echo "Checking health endpoint..."
curl -s http://localhost:3000/api/health

echo "All checks completed."
