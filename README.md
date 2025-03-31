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

## Quick Start

The project now features a simplified setup and demo process:

1. **Setup the environment**:
   ```bash
   chmod +x setup_local_environment.sh
   ./setup_local_environment.sh
   ```
   This script sets up everything: blockchain, ML components with Python 3.12, and the frontend.

2. **Run the demo**:
   ```bash
   ./scripts/run_demo.sh
   ```
   This launches all components: local blockchain, smart contracts, ML predictions, and the frontend dashboard.

## Prerequisites

- Node.js (v16+)
- npm (v8+)
- Python 3.12
- MetaMask or other Web3 wallet for blockchain interaction

## Detailed Installation

If you prefer to set up components individually:

1. Clone the repository:
   ```bash
   git clone https://github.com/adam-bouafia/Blockchain-Driven-Energy-Optimization-System-for-Sustainable-Data-Centers.git
   cd Blockchain-Driven-Energy-Optimization-System-for-Sustainable-Data-Centers
   ```

2. Install JavaScript dependencies:
   ```bash
   npm install
   ```

3. Set up Python environment:
   ```bash
   cd ml
   python3.12 -m venv venv312
   source venv312/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

4. Start local blockchain:
   ```bash
   ./scripts/start_local_blockchain.sh
   ```

5. Deploy contracts:
   ```bash
   ./scripts/deploy_contracts.sh
   ```

6. Run ML component:
   ```bash
   ./scripts/run_ml_component.sh
   ```

7. Start the frontend:
   ```bash
   ./scripts/start_frontend.sh
   ```

## Python 3.12 Compatibility

This project is optimized for Python 3.12 with the following features:

1. **Automatic Environment Setup**:
   ```bash
   cd ml
   python3.12 -m venv venv312
   source venv312/bin/activate
   pip install -r requirements.txt
   ```

2. **Self-contained ML Component**:
   The `run_ml_component.sh` script automatically:
   - Uses the Python 3.12 virtual environment
   - Runs the ML component with the correct Python version
   - Handles all dependencies

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
