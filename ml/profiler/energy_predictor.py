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
