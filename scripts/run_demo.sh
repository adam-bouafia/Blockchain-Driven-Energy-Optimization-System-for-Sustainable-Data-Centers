#!/bin/bash

# Exit on error
set -e

echo "Running Blockchain Energy Optimization System Demo"
echo "=================================================="

# Start local blockchain in background
echo "Starting local blockchain..."
gnome-terminal -- ./scripts/start_local_blockchain.sh &
sleep 5  # Wait for blockchain to start

# Deploy contracts
echo "Deploying contracts..."
./scripts/deploy_contracts.sh

# Run ML component
echo "Running ML component..."
./scripts/run_ml_component.sh

# Interact with contracts
echo "Interacting with contracts..."
truffle exec scripts/interact_with_contracts.js

# Start frontend in a new terminal window
echo "Starting frontend..."
gnome-terminal -- ./scripts/start_frontend.sh &
echo "Frontend will be available at http://localhost:3000"

echo "=================================================="
echo "Demo completed successfully!"
echo "To stop the local blockchain and frontend, close the terminal windows or press Ctrl+C"
