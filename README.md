# Blockchain-Driven Energy Optimization System for Sustainable Data Centers

This repository contains the implementation of a blockchain-ML hybrid system designed to reduce Power Usage Effectiveness (PUE) variance in multi-tenant data centers while maintaining sub-2ms latency for real-time energy transactions.

## Project Overview

Modern hyperscale data centers consume a significant portion of global electricity, with individual facilities reaching power capacities of 650 MW. This project addresses critical challenges in data center energy management:

- 31% discrepancy between reported and actual PUE values
- 19-day delays in efficiency incentive distribution
- Limited adoption of predictive load balancing (37% penetration)

Our solution combines:
- SHA-3 hashed energy logging with zk-SNARK verification
- ERC-1155 multi-token incentive system
- Hybrid Prophet-Transformer forecasting model for energy load optimization
- React-based dashboard with comprehensive visualizations and blockchain integration

## Repository Structure

```
blockchain-energy-optimization/
├── contracts/               # Smart contract source files
│   ├── energy/              # Energy data logging contracts
│   ├── incentives/          # Token incentive system
│   └── oracle/              # Chainlink oracle integration
├── migrations/              # Deployment scripts
├── test/                    # Test files
├── ml/                      # Machine learning components
│   ├── profiler/            # Energy profiling tools
│   └── federated/           # Federated learning implementation
├── frontend/                # React.js dashboard
│   ├── public/              # Static assets
│   ├── src/                 # React components
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── utils/           # Utility functions
│   │   └── contracts/       # Smart contract ABIs
│   └── build/               # Production build (generated)
└── scripts/                 # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- Python 3.8+ (Python 3.12 recommended for best compatibility)
- Truffle Suite
- Ganache CLI
- MetaMask or other Web3 wallet for blockchain interaction

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adam-bouafia/Blockchain-Driven-Energy-Optimization-System-for-Sustainable-Data-Centers.git
   cd blockchain-energy-optimization
   ```

2. Install JavaScript dependencies:
   ```bash
   npm install
   ```

3. Set up Python environment:
   ```bash
   cd ml
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

4. Start local blockchain:
   ```bash
   ganache-cli
   ```

5. Compile and deploy contracts:
   ```bash
   truffle compile
   truffle migrate --network development
   ```

6. Run tests:
   ```bash
   truffle test
   ```

7. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

8. Start the frontend development server:
   ```bash
   npm start
   ```

9. Alternatively, run the demo script (recommended):
   ```bash
   ./scripts/run_demo.sh
   ```
   This script will:
   - Start a local blockchain
   - Deploy all contracts
   - Set up the Python environment if needed
   - Run the ML component
   - Interact with the contracts

## Python 3.12 Compatibility

This project supports Python 3.12 with the following features:

1. **Automatic Environment Setup**:
   ```bash
   cd ml
   python3.12 -m venv venv312
   source venv312/bin/activate
   pip install -r requirements.txt
   ```

2. **Self-contained ML Component**:
   The `run_ml_component.sh` script automatically:
   - Creates a Python 3.12 virtual environment if it doesn't exist
   - Installs all required dependencies
   - Runs the ML component with the correct environment

3. **Compatible Package Versions**:
   - numpy==1.26.4
   - tensorflow==2.19.0
   - pandas==2.2.1
   - scikit-learn==1.4.2
   - matplotlib==3.8.3
   - web3==6.15.1

## Core Components

### Energy Logging with zk-SNARK Verification

The system uses BLS12-381 elliptic curves for zk-SNARK proofs, reducing setup time by 9× compared to legacy BN254 implementations. Energy transactions are validated through:

```
EnergyTx = BLS12_Hash(PUEt) ∥ NodeID ∥ zk-SNARK(Compliance) ∥ TIMESTAMP
```

### ERC-1155 Token Incentive System

A multi-token reward system incentivizes energy-efficient behavior with temporal decay:

```solidity
function calculateReward(address operator) public view returns (uint256) {
    uint256 timeDelta = block.timestamp - lastUpdate[operator];
    return balances[operator] * (decayRate ** timeDelta);
}
```

### Chainlink-Triggered Workload Redistribution

Automated workload redistribution is triggered through Chainlink oracles when efficiency thresholds are crossed, targeting 15% cooling load reduction without violating SLA thresholds.

### Interactive Dashboard

The frontend dashboard provides:
- Energy consumption monitoring with historical trends
- Token distribution and management interface
- Node status visualization with real-time updates
- Smart contract interaction capabilities
- Wallet integration for blockchain transactions

## HPC Deployment

For HPC deployment, additional configuration is provided in the `scripts/hpc_deploy.sh` file. This script handles:

- Environment setup on HPC clusters
- Data partitioning for federated learning
- Job submission for parallel processing

## License

This project is licensed under the MIT License - see the LICENSE file for details.