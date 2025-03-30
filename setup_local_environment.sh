#!/bin/bash

# Local Testing Environment Setup Script for Blockchain Energy Optimization System
# This script sets up the local development environment for testing the project

# Exit on error
set -e

echo "Setting up local testing environment for Blockchain Energy Optimization System..."

# Check for required tools
echo "Checking for required tools..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm v8 or higher."
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Install global dependencies
echo "Installing global dependencies..."
npm install -g truffle ganache-cli

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Create .env file for environment variables
echo "Creating .env file..."
cat > .env << EOL
# Local development environment variables
MNEMONIC="test test test test test test test test test test test junk"
INFURA_API_KEY="your-infura-api-key"

# HPC environment variables (for future use)
HPC_HOST="127.0.0.1"
HPC_PORT="8545"
HPC_LINK_TOKEN="0x0000000000000000000000000000000000000000"
HPC_ORACLE="0x0000000000000000000000000000000000000000"
HPC_JOB_ID="0x3666636566333330623533626461393835363963396631663630643034306661"
EOL

# Set up Python environment for ML components
echo "Setting up Python environment for ML components..."
cd ml
python3 -m venv venv
source venv/bin/activate
pip install tensorflow numpy pandas matplotlib web3
deactivate
cd ..

# Create requirements.txt for ML components
echo "Creating requirements.txt for ML components..."
cat > ml/requirements.txt << EOL
tensorflow==2.11.0
tensorflow-lite==2.11.0
numpy==1.23.5
pandas==1.5.3
matplotlib==3.7.1
web3==6.0.0
chainlink-contracts==0.6.1
EOL

# Create sample ML profiler script
echo "Creating sample ML profiler script..."
cat > ml/profiler/energy_predictor.py << EOL
#!/usr/bin/env python3
"""
Energy Predictor - Sample ML component for the Blockchain Energy Optimization System
This script demonstrates how the ML component would interact with the blockchain
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import json
import os

# Sample data generation
def generate_sample_data(days=30, nodes=3):
    """Generate sample energy consumption data for demonstration"""
    timestamps = [datetime.now() - timedelta(days=i) for i in range(days)]
    data = []
    
    for node_id in range(nodes):
        base_pue = 1.2 + (node_id * 0.1)  # Different base PUE for each node
        for ts in timestamps:
            # Add daily and weekly patterns with some randomness
            hour_factor = 1.0 + 0.1 * np.sin(ts.hour * np.pi / 12)
            day_factor = 1.0 + 0.05 * np.sin(ts.weekday() * np.pi / 3.5)
            random_factor = 1.0 + 0.03 * np.random.randn()
            
            pue = base_pue * hour_factor * day_factor * random_factor
            
            data.append({
                'timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
                'node_id': f'node_{node_id}',
                'pue': round(pue, 3),
                'cooling_load': round(100 + 20 * np.sin(ts.hour * np.pi / 12) + 10 * np.random.randn(), 1),
                'compute_load': round(80 + 15 * np.sin(ts.hour * np.pi / 12) + 5 * np.random.randn(), 1)
            })
    
    return pd.DataFrame(data)

# Simple prediction model
def predict_pue(historical_data, node_id, horizon=24):
    """Simple prediction model for PUE values"""
    node_data = historical_data[historical_data['node_id'] == node_id].copy()
    node_data['timestamp'] = pd.to_datetime(node_data['timestamp'])
    node_data = node_data.sort_values('timestamp')
    
    # Use last 7 days of hourly patterns to predict next day
    last_week = node_data.tail(7*24)
    hourly_pattern = last_week.groupby(last_week['timestamp'].dt.hour)['pue'].mean()
    
    # Generate predictions
    last_timestamp = node_data['timestamp'].max()
    future_timestamps = [last_timestamp + timedelta(hours=i+1) for i in range(horizon)]
    predictions = []
    
    for ts in future_timestamps:
        hour = ts.hour
        predicted_pue = hourly_pattern[hour] * (1 + 0.02 * np.random.randn())  # Add some randomness
        predictions.append({
            'timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
            'node_id': node_id,
            'predicted_pue': round(predicted_pue, 3)
        })
    
    return pd.DataFrame(predictions)

# Main function
def main():
    print("Energy Predictor - Sample ML component")
    print("Generating sample data...")
    
    # Generate sample data
    data = generate_sample_data()
    
    # Save to CSV
    data.to_csv('sample_energy_data.csv', index=False)
    print(f"Sample data saved to sample_energy_data.csv ({len(data)} records)")
    
    # Generate predictions for each node
    all_predictions = []
    for node_id in data['node_id'].unique():
        predictions = predict_pue(data, node_id)
        all_predictions.append(predictions)
    
    # Combine predictions
    combined_predictions = pd.concat(all_predictions)
    combined_predictions.to_csv('predicted_pue_values.csv', index=False)
    print(f"Predictions saved to predicted_pue_values.csv ({len(combined_predictions)} records)")
    
    # Plot sample data and predictions for the first node
    node_id = data['node_id'].unique()[0]
    node_data = data[data['node_id'] == node_id].copy()
    node_data['timestamp'] = pd.to_datetime(node_data['timestamp'])
    node_predictions = combined_predictions[combined_predictions['node_id'] == node_id].copy()
    node_predictions['timestamp'] = pd.to_datetime(node_predictions['timestamp'])
    
    plt.figure(figsize=(12, 6))
    plt.plot(node_data['timestamp'], node_data['pue'], label='Historical PUE')
    plt.plot(node_predictions['timestamp'], node_predictions['predicted_pue'], 'r--', label='Predicted PUE')
    plt.xlabel('Timestamp')
    plt.ylabel('PUE Value')
    plt.title(f'PUE Values for {node_id}')
    plt.legend()
    plt.grid(True)
    plt.savefig('pue_prediction_plot.png')
    print("Plot saved to pue_prediction_plot.png")
    
    # Generate blockchain-ready data
    print("Generating blockchain-ready data...")
    blockchain_data = []
    for _, row in node_predictions.iterrows():
        # Convert PUE to integer (multiply by 1000 for precision)
        pue_value = int(row['predicted_pue'] * 1000)
        # Generate a dummy zk-proof (would be actual proof in production)
        zk_proof = f"0x{os.urandom(32).hex()}"
        
        blockchain_data.append({
            'timestamp': row['timestamp'],
            'node_id': row['node_id'],
            'pue_value': pue_value,
            'zk_proof': zk_proof
        })
    
    # Save blockchain-ready data
    with open('blockchain_ready_data.json', 'w') as f:
        json.dump(blockchain_data, f, indent=2)
    print("Blockchain-ready data saved to blockchain_ready_data.json")
    
    print("Energy Predictor completed successfully")

if __name__ == "__main__":
    main()
EOL

# Create a script to start the local blockchain
echo "Creating script to start local blockchain..."
cat > scripts/start_local_blockchain.sh << EOL
#!/bin/bash

# Start local blockchain for development
echo "Starting local blockchain with Ganache CLI..."
ganache-cli --deterministic --mnemonic "test test test test test test test test test test test junk" --port 8545 --gasLimit 12000000
EOL
chmod +x scripts/start_local_blockchain.sh

# Create a script to compile and deploy contracts
echo "Creating script to compile and deploy contracts..."
cat > scripts/deploy_contracts.sh << EOL
#!/bin/bash

# Compile and deploy contracts to local blockchain
echo "Compiling contracts..."
truffle compile

echo "Deploying contracts to local blockchain..."
truffle migrate --reset --network development

echo "Contracts deployed successfully!"
EOL
chmod +x scripts/deploy_contracts.sh

# Create a script to run tests
echo "Creating script to run tests..."
cat > scripts/run_tests.sh << EOL
#!/bin/bash

# Run contract tests
echo "Running contract tests..."
truffle test

echo "Tests completed!"
EOL
chmod +x scripts/run_tests.sh

# Create a script to interact with deployed contracts
echo "Creating script to interact with deployed contracts..."
cat > scripts/interact_with_contracts.js << EOL
/**
 * Script to interact with deployed contracts
 * Run this with: truffle exec scripts/interact_with_contracts.js
 */

const EnergyLog = artifacts.require("EnergyLog");
const EnergyToken = artifacts.require("EnergyToken");
const WorkloadOracle = artifacts.require("WorkloadOracle");

module.exports = async function(callback) {
  try {
    // Get deployed contract instances
    const energyLog = await EnergyLog.deployed();
    const energyToken = await EnergyToken.deployed();
    const workloadOracle = await WorkloadOracle.deployed();
    
    console.log("Contract addresses:");
    console.log("EnergyLog:", energyLog.address);
    console.log("EnergyToken:", energyToken.address);
    console.log("WorkloadOracle:", workloadOracle.address);
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];
    const nodeOperator = accounts[1];
    
    console.log("\\nAccounts:");
    console.log("Owner:", owner);
    console.log("Node Operator:", nodeOperator);
    
    // Create a sample energy log
    console.log("\\nCreating sample energy log...");
    const pueValue = 1250; // 1.25 PUE * 1000 for precision
    const nodeId = web3.utils.keccak256("node1");
    const zkProof = web3.utils.keccak256("proof1");
    
    const tx = await energyLog.createEnergyLog(
      pueValue,
      nodeId,
      zkProof,
      { from: nodeOperator }
    );
    
    console.log("Energy log created with transaction hash:", tx.tx);
    
    // Get the log ID from the event
    const logId = tx.logs[0].args.logId;
    console.log("Log ID:", logId);
    
    // Retrieve the log
    const log = await energyLog.getEnergyLog(logId);
    console.log("\\nRetrieved energy log:");
    console.log("Timestamp:", log.timestamp.toString());
    console.log("PUE Value:", log.pueValue.toString());
    console.log("Node ID:", log.nodeId);
    console.log("ZK Proof:", log.zkProof);
    console.log("Verified:", log.verified);
    
    // Award tokens to the node operator
    console.log("\\nAwarding tokens to node operator...");
    const tokenId = 0; // EFFICIENCY_TOKEN
    const amount = 100;
    
    await energyToken.awardTokens(
      nodeOperator,
      tokenId,
      amount,
      { from: owner }
    );
    
    // Check token balance
    const balance = await energyToken.balanceOf(nodeOperator, tokenId);
    console.log("Node operator token balance:", balance.toString());
    
    // Get total logs
    const totalLogs = await energyLog.getTotalLogs();
    console.log("\\nTotal energy logs:", totalLogs.toString());
    
    console.log("\\nInteraction completed successfully!");
    
    callback();
  } catch (error) {
    console.error("Error:", error);
    callback(error);
  }
};
EOL

# Create a script to run the ML component
echo "Creating script to run the ML component..."
cat > scripts/run_ml_component.sh << EOL
#!/bin/bash

# Run the ML component
echo "Running ML energy predictor..."
cd ml
source venv/bin/activate
python profiler/energy_predictor.py
deactivate
cd ..

echo "ML component completed!"
EOL
chmod +x scripts/run_ml_component.sh

# Create a demo script that runs all components
echo "Creating demo script..."
cat > scripts/run_demo.sh << EOL
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

echo "=================================================="
echo "Demo completed successfully!"
echo "To stop the local blockchain, close the terminal window or press Ctrl+C"
EOL
chmod +x scripts/run_demo.sh

echo "Local testing environment setup completed successfully!"
echo "To run the demo, execute: ./scripts/run_demo.sh"
