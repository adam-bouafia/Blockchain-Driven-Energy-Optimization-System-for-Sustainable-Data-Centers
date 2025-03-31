#!/bin/bash

# Exit on error
set -e

echo "Starting Frontend for Blockchain Energy Optimization System"
echo "=========================================================="

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# Start the frontend in development mode
echo "Starting frontend development server..."
echo "Open http://localhost:3000 in your browser"
npm start
