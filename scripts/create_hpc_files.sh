#!/bin/bash

# Script to create HPC-specific ML profiler with enhanced capabilities
# This script demonstrates how the ML component would be modified for HPC deployment

# Create the HPC-specific ML profiler directory
mkdir -p /home/ubuntu/blockchain-energy-optimization/ml/profiler/hpc

# Create the enhanced energy predictor for HPC
cat > /home/ubuntu/blockchain-energy-optimization/ml/profiler/hpc/energy_predictor_hpc.py << 'EOL'
#!/usr/bin/env python3
"""
Enhanced Energy Predictor for HPC Environment
This script provides advanced ML capabilities for the Blockchain Energy Optimization System
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout
from tensorflow.keras.optimizers import Adam
from datetime import datetime, timedelta
import json
import os
import argparse

# Parse command line arguments
parser = argparse.ArgumentParser(description='Enhanced Energy Predictor for HPC')
parser.add_argument('--nodes', type=int, default=10, help='Number of data center nodes')
parser.add_argument('--days', type=int, default=90, help='Number of days of historical data')
parser.add_argument('--hpc', type=bool, default=True, help='Enable HPC-specific optimizations')
args = parser.parse_args()

# Enhanced data generation with more complex patterns
def generate_enhanced_data(days=90, nodes=10):
    """Generate enhanced energy consumption data for HPC simulation"""
    timestamps = [datetime.now() - timedelta(days=i) for i in range(days)]
    timestamps.sort()  # Ensure chronological order
    data = []
    
    for node_id in range(nodes):
        # More complex base PUE with node-specific characteristics
        base_pue = 1.2 + (node_id * 0.05)
        
        # Node-specific parameters
        cooling_efficiency = 0.8 + (node_id % 3) * 0.1
        maintenance_schedule = [7, 14, 21, 28][node_id % 4]  # Different maintenance days
        
        for ts in timestamps:
            # Complex temporal patterns
            hour_factor = 1.0 + 0.15 * np.sin(ts.hour * np.pi / 12)
            day_factor = 1.0 + 0.08 * np.sin(ts.weekday() * np.pi / 3.5)
            
            # Monthly seasonality
            month_factor = 1.0 + 0.1 * np.sin(ts.day * 2 * np.pi / 30)
            
            # Maintenance effect (higher PUE on maintenance days)
            maintenance_effect = 1.2 if ts.day % maintenance_schedule == 0 else 1.0
            
            # Random component with occasional spikes
            random_factor = 1.0 + 0.03 * np.random.randn()
            if np.random.random() < 0.01:  # 1% chance of a spike
                random_factor += 0.2
            
            # Calculate PUE with all factors
            pue = base_pue * hour_factor * day_factor * month_factor * maintenance_effect * random_factor
            
            # Calculate related metrics
            cooling_load = 100 + 30 * np.sin(ts.hour * np.pi / 12) * cooling_efficiency + 15 * np.random.randn()
            compute_load = 80 + 20 * np.sin(ts.hour * np.pi / 12) + 10 * np.random.randn()
            
            # Add to dataset
            data.append({
                'timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
                'node_id': f'node_{node_id}',
                'pue': round(pue, 3),
                'cooling_load': round(cooling_load, 1),
                'compute_load': round(compute_load, 1),
                'temperature': round(22 + 3 * np.sin(ts.hour * np.pi / 12) + np.random.randn(), 1),
                'humidity': round(50 + 10 * np.sin(ts.hour * np.pi / 12) + 5 * np.random.randn(), 1),
                'power_consumption': round(compute_load * pue, 1)
            })
    
    return pd.DataFrame(data)

# LSTM model for time series prediction
def build_lstm_model(X_train):
    """Build an LSTM model for PUE prediction"""
    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])))
    model.add(Dropout(0.2))
    model.add(LSTM(50, return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(25))
    model.add(Dense(1))
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mean_squared_error')
    return model

# Prepare data for LSTM
def prepare_lstm_data(data, node_id, lookback=24, horizon=24, test_split=0.2):
    """Prepare data for LSTM model with lookback window"""
    # Filter data for specific node
    node_data = data[data['node_id'] == node_id].copy()
    node_data['timestamp'] = pd.to_datetime(node_data['timestamp'])
    node_data = node_data.sort_values('timestamp')
    
    # Create features
    features = ['pue', 'cooling_load', 'compute_load', 'temperature', 'humidity']
    
    # Add time features
    node_data['hour'] = node_data['timestamp'].dt.hour / 23.0  # Normalize to [0,1]
    node_data['day'] = node_data['timestamp'].dt.day / 31.0
    node_data['month'] = node_data['timestamp'].dt.month / 12.0
    node_data['weekday'] = node_data['timestamp'].dt.weekday / 6.0
    
    features += ['hour', 'day', 'month', 'weekday']
    
    # Create sequences
    X, y = [], []
    for i in range(len(node_data) - lookback - horizon + 1):
        X.append(node_data[features].iloc[i:i+lookback].values)
        y.append(node_data['pue'].iloc[i+lookback:i+lookback+horizon].values)
    
    X = np.array(X)
    y = np.array(y)
    
    # Split into train and test
    split_idx = int(len(X) * (1 - test_split))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    return X_train, X_test, y_train, y_test, node_data

# Advanced prediction with LSTM
def predict_pue_lstm(data, node_id, lookback=24, horizon=24):
    """Advanced PUE prediction using LSTM model"""
    X_train, X_test, y_train, y_test, node_data = prepare_lstm_data(data, node_id, lookback, horizon)
    
    # Build and train model
    model = build_lstm_model(X_train)
    model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.1, verbose=1)
    
    # Evaluate model
    test_loss = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test MSE for {node_id}: {test_loss}")
    
    # Make predictions
    last_sequence = X_test[-1].reshape(1, X_test.shape[1], X_test.shape[2])
    predicted_pue = model.predict(last_sequence)[0]
    
    # Generate future timestamps
    last_timestamp = node_data['timestamp'].iloc[-1]
    future_timestamps = [last_timestamp + timedelta(hours=i+1) for i in range(horizon)]
    
    # Create prediction dataframe
    predictions = []
    for i, ts in enumerate(future_timestamps):
        predictions.append({
            'timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
            'node_id': node_id,
            'predicted_pue': round(float(predicted_pue[i]), 3)
        })
    
    return pd.DataFrame(predictions), model

# Generate zk-SNARK compatible proofs (simulated)
def generate_zk_proof(data_point, private_key=None):
    """
    Simulate zk-SNARK proof generation
    In a real implementation, this would use a zk-SNARK library
    """
    # In a real implementation, this would use a library like snarkjs
    # For simulation, we'll create a deterministic but unique hash
    import hashlib
    
    # Create a string representation of the data point
    data_str = f"{data_point['node_id']}:{data_point['timestamp']}:{data_point['predicted_pue']}"
    
    # Add a private key if provided (simulating private inputs)
    if private_key:
        data_str += f":{private_key}"
    
    # Generate a hash
    hash_obj = hashlib.sha256(data_str.encode())
    
    # Convert to hex string with 0x prefix
    return f"0x{hash_obj.hexdigest()}"

# Main function
def main():
    print(f"Enhanced Energy Predictor for HPC - Running with {args.nodes} nodes, {args.days} days")
    
    # Generate enhanced data
    print("Generating enhanced dataset...")
    data = generate_enhanced_data(days=args.days, nodes=args.nodes)
    
    # Save to CSV
    data.to_csv('enhanced_energy_data.csv', index=False)
    print(f"Enhanced data saved to enhanced_energy_data.csv ({len(data)} records)")
    
    # Generate predictions for each node using LSTM
    all_predictions = []
    models = {}
    
    print("Training LSTM models for each node...")
    for node_id in data['node_id'].unique():
        print(f"Processing {node_id}...")
        predictions, model = predict_pue_lstm(data, node_id)
        all_predictions.append(predictions)
        models[node_id] = model
        
        # Save model for this node
        model_dir = f"models/{node_id}"
        os.makedirs(model_dir, exist_ok=True)
        model.save(f"{model_dir}/lstm_model")
    
    # Combine predictions
    combined_predictions = pd.concat(all_predictions)
    combined_predictions.to_csv('lstm_predicted_pue_values.csv', index=False)
    print(f"LSTM predictions saved to lstm_predicted_pue_values.csv ({len(combined_predictions)} records)")
    
    # Plot sample data and predictions for the first node
    node_id = data['node_id'].unique()[0]
    node_data = data[data['node_id'] == node_id].copy()
    node_data['timestamp'] = pd.to_datetime(node_data['timestamp'])
    node_predictions = combined_predictions[combined_predictions['node_id'] == node_id].copy()
    node_predictions['timestamp'] = pd.to_datetime(node_predictions['timestamp'])
    
    plt.figure(figsize=(15, 8))
    
    # Plot historical data
    plt.subplot(2, 1, 1)
    plt.plot(node_data['timestamp'], node_data['pue'], label='Historical PUE')
    plt.xlabel('Timestamp')
    plt.ylabel('PUE Value')
    plt.title(f'Historical PUE Values for {node_id}')
    plt.legend()
    plt.grid(True)
    
    # Plot predictions
    plt.subplot(2, 1, 2)
    plt.plot(node_predictions['timestamp'], node_predictions['predicted_pue'], 'r-', label='LSTM Predicted PUE')
    plt.xlabel('Timestamp')
    plt.ylabel('PUE Value')
    plt.title(f'Predicted PUE Values for {node_id}')
    plt.legend()
    plt.grid(True)
    
    plt.tight_layout()
    plt.savefig('lstm_pue_prediction_plot.png')
    print("Plot saved to lstm_pue_prediction_plot.png")
    
    # Generate blockchain-ready data with zk-proofs
    print("Generating blockchain-ready data with zk-proofs...")
    blockchain_data = []
    
    # Simulate a private key for each node (in production, this would be securely managed)
    node_private_keys = {node_id: os.urandom(32).hex() for node_id in data['node_id'].unique()}
    
    for _, row in combined_predictions.iterrows():
        # Convert PUE to integer (multiply by 1000 for precision)
        pue_value = int(row['predicted_pue'] * 1000)
        
        # Generate a zk-proof
        zk_proof = generate_zk_proof(row, node_private_keys.get(row['node_id']))
        
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
    
    # Generate performance metrics
    print("Generating performance metrics...")
    metrics = {
        'nodes': args.nodes,
        'days': args.days,
        'records': len(data),
        'predictions': len(combined_predictions),
        'model_type': 'LSTM',
        'training_time': {}, # Will be populated below
        'prediction_time': {},
        'mse': {}
    }
    
    # Calculate metrics for each node
    for node_id in data['node_id'].unique():
        # Measure prediction time
        start_time = datetime.now()
        X_train, X_test, y_train, y_test, _ = prepare_lstm_data(data, node_id)
        model = models[node_id]
        _ = model.predict(X_test)
        end_time = datetime.now()
        prediction_time = (end_time - start_time).total_seconds()
        
        # Calculate MSE
        y_pred = model.predict(X_test)
        mse = np.mean((y_pred - y_test) ** 2)
        
        # Store metrics
        metrics['prediction_time'][node_id] = prediction_time
        metrics['mse'][node_id] = float(mse)
    
    # Save metrics
    with open('performance_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print("Performance metrics saved to performance_metrics.json")
    
    print("Enhanced Energy Predictor completed successfully")

if __name__ == "__main__":
    main()
EOL

# Create a requirements file for HPC environment
cat > /home/ubuntu/blockchain-energy-optimization/ml/requirements_hpc.txt << 'EOL'
tensorflow==2.11.0
tensorflow-lite==2.11.0
numpy==1.23.5
pandas==1.5.3
matplotlib==3.7.1
web3==6.0.0
chainlink-contracts==0.6.1
scikit-learn==1.2.2
snarkjs==0.5.0
EOL

# Create an HPC job submission script
cat > /home/ubuntu/blockchain-energy-optimization/scripts/hpc_job.sh << 'EOL'
#!/bin/bash
#SBATCH --job-name=blockchain-energy
#SBATCH --output=blockchain-energy-%j.out
#SBATCH --error=blockchain-energy-%j.err
#SBATCH --partition=gpu
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4
#SBATCH --gpus-per-node=1
#SBATCH --time=01:00:00
#SBATCH --mem=16G

# Load required modules (adjust based on your HPC's available modules)
module load python/3.8
module load nodejs/16
module load cuda/11.7

# Set up environment
cd $SLURM_SUBMIT_DIR
source venv/bin/activate

# Run enhanced ML component
cd ml/profiler/hpc
python energy_predictor_hpc.py --nodes=10 --days=90

# Deploy contracts
cd ../../..
truffle migrate --network hpc

# Run benchmarking
truffle exec scripts/hpc_benchmark.js --network hpc

# Deactivate Python environment
deactivate

echo "HPC job completed!"
EOL
chmod +x /home/ubuntu/blockchain-energy-optimization/scripts/hpc_job.sh

echo "HPC-specific files created successfully"
