#!/bin/bash

# Run the ML component
echo "Running ML energy predictor..."
cd ml

# Create virtual environment if it doesn't exist
if [ ! -d "venv312" ]; then
  echo "Creating virtual environment..."
  python3.12 -m venv venv312
  source venv312/bin/activate
  echo "Installing required packages..."
  pip install numpy==1.26.4 tensorflow==2.19.0 pandas==2.2.1 scikit-learn==1.4.2 matplotlib==3.8.3 web3==6.15.1
else
  source venv312/bin/activate
fi

python profiler/energy_predictor.py
deactivate
cd ..

echo "ML component completed!"
