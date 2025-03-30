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
│   └── src/                 # React components
└── scripts/                 # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- Python 3.8+
- Truffle Suite
- Ganache CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blockchain-energy-optimization.git
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

## HPC Deployment

For HPC deployment, additional configuration is provided in the `scripts/hpc_deploy.sh` file. This script handles:

- Environment setup on HPC clusters
- Data partitioning for federated learning
- Job submission for parallel processing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Prof. Klervie Toczé, Vrije Universiteit Amsterdam
- Green Lab HPC resources
