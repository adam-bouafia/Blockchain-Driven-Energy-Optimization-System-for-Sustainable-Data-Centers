# Deployment Instructions

This document provides detailed instructions for deploying the Blockchain-Based Energy Optimization System in both laptop and HPC environments.

## Laptop Deployment

### Prerequisites

- **Operating System**: Linux, macOS, or Windows with WSL
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **Python**: v3.8 or higher
- **Git**: Latest version
- **MetaMask**: Browser extension for Ethereum wallet

### Step 1: Clone the Repository

```bash
git clone https://github.com/adam-bouafia/Blockchain-Driven-Energy-Optimization-System-for-Sustainable-Data-Centers.git
cd blockchain-energy-optimization
```

### Step 2: Set Up the Environment

Run the setup script to install dependencies and prepare the environment:

```bash
chmod +x setup_local_environment.sh
./setup_local_environment.sh
```

This script will:
- Install global dependencies (Truffle, Ganache CLI)
- Install project dependencies
- Create a `.env` file with default values
- Set up the Python virtual environment for ML components
- Create necessary scripts for running the system

### Step 3: Start the Local Blockchain

Start a local Ethereum blockchain using Ganache CLI:

```bash
./scripts/start_local_blockchain.sh
```

This will start Ganache CLI with a deterministic mnemonic, making addresses consistent across restarts.

### Step 4: Deploy Smart Contracts

In a new terminal, deploy the smart contracts to the local blockchain:

```bash
./scripts/deploy_contracts.sh
```

This will compile the contracts and deploy them to the local blockchain.

### Step 5: Run the ML Component

Run the ML energy predictor to generate sample data:

```bash
./scripts/run_ml_component.sh
```

This will:
- Generate sample energy consumption data
- Create predictions for future PUE values
- Prepare blockchain-ready data
- Generate a visualization of the predictions

### Step 6: Set Up the Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Update the contract addresses in the frontend configuration:

1. Open `src/utils/contractService.js`
2. Update the `CONTRACT_ADDRESSES` object with your deployed contract addresses:
   ```javascript
   const CONTRACT_ADDRESSES = {
     ENERGY_SYSTEM: 'your-energy-system-contract-address',
     ENERGY_TOKEN: 'your-energy-token-contract-address'
   };
   ```

Start the frontend development server:

```bash
npm start
```

This will launch the application at http://localhost:3000

### Step 7: Interact with Deployed Contracts

Interact with the deployed contracts to demonstrate functionality:

```bash
truffle exec scripts/interact_with_contracts.js
```

This will:
- Create a sample energy log
- Award tokens to a node operator
- Retrieve and display contract data

### Step 8: Run Tests

Run the test suite to verify contract functionality:

```bash
./scripts/run_tests.sh
```

### Step 9: Run the Complete Demo

For a full demonstration, run the demo script:

```bash
./scripts/run_demo.sh
```

This script automates steps 3-7 in sequence.

### Step 10: Build the Frontend for Production

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

The build files will be created in the `frontend/build` directory and can be deployed to any static hosting service.

## HPC Deployment

### Prerequisites

- Access to university HPC resources
- SSH access to the HPC cluster
- Python modules: TensorFlow, NumPy, Pandas, Matplotlib
- Node.js and npm installed on the HPC (or available as modules)

### Step 1: Prepare the Code for HPC

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/blockchain-energy-optimization.git
   cd blockchain-energy-optimization
   ```

2. Modify the `.env` file to include HPC-specific settings:
   ```
   HPC_HOST="your-hpc-hostname"
   HPC_PORT="8545"
   HPC_LINK_TOKEN="your-link-token-address"
   HPC_ORACLE="your-oracle-address"
   HPC_JOB_ID="your-job-id"
   ```

3. Create an HPC configuration file (`hpc_config.json`):
   ```json
   {
     "cluster": "your-hpc-cluster-name",
     "partition": "gpu",
     "nodes": 1,
     "ntasks": 1,
     "cpus-per-task": 4,
     "gpus-per-node": 1,
     "time": "01:00:00",
     "memory": "16G"
   }
   ```

### Step 2: Transfer Files to HPC

Transfer the repository to the HPC cluster:

```bash
scp -r blockchain-energy-optimization username@hpc-hostname:~/
```

### Step 3: Set Up the HPC Environment

SSH into the HPC cluster and set up the environment:

```bash
ssh username@hpc-hostname
cd blockchain-energy-optimization

# Create HPC setup script
cat > setup_hpc_environment.sh << 'EOL'
#!/bin/bash

# Load required modules (adjust based on your HPC's available modules)
module load python/3.8
module load nodejs/16
module load cuda/11.7

# Install project dependencies
npm install

# Set up Python environment
python -m venv venv
source venv/bin/activate
pip install -r ml/requirements.txt
deactivate

echo "HPC environment setup completed!"
EOL

chmod +x setup_hpc_environment.sh
./setup_hpc_environment.sh
```

### Step 4: Create HPC Job Submission Script

Create a job submission script for the HPC scheduler (e.g., SLURM):

```bash
cat > submit_hpc_job.sh << 'EOL'
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

# Load required modules
module load python/3.8
module load nodejs/16
module load cuda/11.7

# Activate Python environment
source venv/bin/activate

# Run ML component with increased dataset size
cd ml/profiler
python energy_predictor.py --nodes=10 --days=90 --hpc=true

# Deploy contracts to HPC network
cd ../..
truffle migrate --network hpc

# Run benchmarking tests
truffle exec scripts/hpc_benchmark.js --network hpc

# Deactivate Python environment
deactivate

echo "HPC job completed!"
EOL

chmod +x submit_hpc_job.sh
```

### Step 5: Create HPC-Specific Scripts

Create an HPC benchmarking script:

```bash
mkdir -p scripts
cat > scripts/hpc_benchmark.js << 'EOL'
/**
 * HPC benchmarking script
 * Run with: truffle exec scripts/hpc_benchmark.js --network hpc
 */

const EnergyLog = artifacts.require("EnergyLog");
const EnergyToken = artifacts.require("EnergyToken");
const WorkloadOracle = artifacts.require("WorkloadOracle");
const fs = require('fs');

module.exports = async function(callback) {
  try {
    console.log("Starting HPC benchmarking...");
    
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
    
    // Load blockchain-ready data
    const blockchainData = JSON.parse(fs.readFileSync('../ml/blockchain_ready_data.json', 'utf8'));
    console.log(`Loaded ${blockchainData.length} data points for benchmarking`);
    
    // Benchmark energy log creation
    console.log("\nBenchmarking energy log creation...");
    const startTime = Date.now();
    
    // Create a batch of energy logs
    const batchSize = 10;
    const promises = [];
    
    for (let i = 0; i < batchSize && i < blockchainData.length; i++) {
      const data = blockchainData[i];
      const nodeId = web3.utils.keccak256(data.node_id);
      
      promises.push(
        energyLog.createEnergyLog(
          data.pue_value,
          nodeId,
          data.zk_proof,
          { from: owner }
        )
      );
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const throughput = batchSize / duration;
    
    console.log(`Created ${batchSize} energy logs in ${duration.toFixed(2)} seconds`);
    console.log(`Throughput: ${throughput.toFixed(2)} transactions per second`);
    
    // Get total logs
    const totalLogs = await energyLog.getTotalLogs();
    console.log("Total energy logs:", totalLogs.toString());
    
    // Write benchmark results to file
    const results = {
      timestamp: new Date().toISOString(),
      batchSize,
      duration,
      throughput,
      totalLogs: totalLogs.toString()
    };
    
    fs.writeFileSync('hpc_benchmark_results.json', JSON.stringify(results, null, 2));
    console.log("Benchmark results saved to hpc_benchmark_results.json");
    
    console.log("\nHPC benchmarking completed successfully!");
    
    callback();
  } catch (error) {
    console.error("Error:", error);
    callback(error);
  }
};
EOL
```

### Step 6: Submit the HPC Job

Submit the job to the HPC scheduler:

```bash
sbatch submit_hpc_job.sh
```

### Step 7: Monitor Job Progress

Monitor the job's progress:

```bash
squeue -u username
```

### Step 8: Analyze Results

Once the job completes, analyze the results:

```bash
cat blockchain-energy-*.out
cat hpc_benchmark_results.json
```

## Frontend Deployment Options

The frontend can be deployed in several ways:

### Option 1: Static Hosting

Deploy the contents of the `frontend/build` directory to any static hosting service:

1. **GitHub Pages**:
   ```bash
   cd frontend
   npm install -g gh-pages
   npm run build
   gh-pages -d build
   ```

2. **Netlify**:
   - Create a new site from the Netlify dashboard
   - Drag and drop the `build` folder or connect to your GitHub repository

3. **Vercel**:
   - Install Vercel CLI: `npm install -g vercel`
   - Deploy: `vercel`

4. **AWS S3**:
   ```bash
   aws s3 sync frontend/build/ s3://your-bucket-name
   ```

### Option 2: Serve Locally

Serve the production build locally:

```bash
cd frontend
npm install -g serve
serve -s build
```

## Comparing Laptop and HPC Performance

After running the system on both laptop and HPC environments, you can compare performance metrics:

1. **Transaction Throughput**: HPC should achieve higher transactions per second
2. **ML Model Training Time**: HPC should train models faster, especially with larger datasets
3. **Prediction Accuracy**: HPC may achieve better accuracy with more complex models
4. **Gas Optimization**: Compare gas costs between environments
5. **Dashboard Responsiveness**: Compare frontend performance with different data volumes

Create a comparison report using the benchmark results from both environments to demonstrate the benefits of HPC resources for your thesis project.

## Troubleshooting

### Laptop Environment

- **Ganache Connection Issues**: Ensure Ganache is running and listening on port 8545
- **Truffle Migration Failures**: Check that Ganache has sufficient funds in the deployment account
- **Python Environment Issues**: Verify that all dependencies are installed in the virtual environment
- **Wallet Connection Problems**: Ensure MetaMask is connected to the correct network

### HPC Environment

- **Module Load Errors**: Verify available modules with `module avail` and adjust accordingly
- **Job Submission Failures**: Check resource requests against HPC limits
- **Out of Memory Errors**: Increase memory allocation in the job submission script
- **GPU Availability**: Ensure GPUs are available in the requested partition

### Frontend Issues

- **Contract Connection Errors**: Verify contract addresses are correctly configured
- **Visualization Problems**: Check browser console for detailed error messages
- **Wallet Integration Issues**: Ensure your wallet is properly connected and on the correct network

## Next Steps

After successful deployment in both environments, consider:

1. Implementing the full zk-SNARK verification logic
2. Enhancing the ML model with real data center data
3. Expanding the dashboard with additional visualizations
4. Integrating with actual Chainlink oracles on a testnet