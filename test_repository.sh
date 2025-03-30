#!/bin/bash

# This script tests the fixed repository code

echo "Testing the fixed repository code..."

# Create a test directory
mkdir -p /tmp/blockchain-energy-test
cd /tmp/blockchain-energy-test

# Create the necessary directory structure
mkdir -p contracts/energy contracts/incentives contracts/oracle ml/profiler scripts

# Copy the fixed WorkloadOracle.sol
cat > contracts/oracle/WorkloadOracle.sol << 'EOL'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WorkloadOracle
 * @dev This contract receives workload data from off-chain sources and triggers
 * workload redistribution based on energy efficiency metrics.
 */
contract WorkloadOracle is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    // Event emitted when new workload data is received
    event WorkloadDataReceived(uint256 timestamp, uint256 predictedLoad, uint256 actualLoad);
    
    // Event emitted when workload redistribution is triggered
    event WorkloadRedistributionTriggered(uint256 timestamp, uint256 fromNodeId, uint256 toNodeId, uint256 amount);
    
    // Oracle parameters
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    // Workload data
    struct WorkloadData {
        uint256 timestamp;
        uint256 predictedLoad;
        uint256 actualLoad;
        bool isProcessed;
    }
    
    // Mapping from node ID to workload data
    mapping(uint256 => WorkloadData) public nodeWorkloads;
    
    // Array of node IDs
    uint256[] public nodeIds;
    
    /**
     * @dev Constructor initializes Chainlink parameters
     * @param _link The LINK token address
     * @param _oracle The oracle address
     * @param _jobId The job ID for the oracle request
     * @param _fee The fee for the oracle request
     */
    constructor(address _link, address _oracle, bytes32 _jobId, uint256 _fee) {
        setChainlinkToken(_link);
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }
    
    /**
     * @dev Requests workload data from the oracle
     * @param _nodeId The ID of the node to request data for
     */
    function requestWorkloadData(uint256 _nodeId) external {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        req.add("nodeId", toString(_nodeId));
        sendChainlinkRequestTo(oracle, req, fee);
    }
    
    /**
     * @dev Callback function for the oracle request
     * @param _requestId The ID of the request
     * @param _predictedLoad The predicted workload
     * @param _actualLoad The actual workload
     */
    function fulfill(bytes32 _requestId, uint256 _predictedLoad, uint256 _actualLoad) public recordChainlinkFulfillment(_requestId) {
        // Extract node ID from the request (simplified for demo)
        uint256 nodeId = nodeIds.length > 0 ? nodeIds[nodeIds.length - 1] : 0;
        
        // Store workload data
        nodeWorkloads[nodeId] = WorkloadData({
            timestamp: block.timestamp,
            predictedLoad: _predictedLoad,
            actualLoad: _actualLoad,
            isProcessed: false
        });
        
        // Add node ID to array if it doesn't exist
        bool exists = false;
        for (uint256 i = 0; i < nodeIds.length; i++) {
            if (nodeIds[i] == nodeId) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            nodeIds.push(nodeId);
        }
        
        emit WorkloadDataReceived(block.timestamp, _predictedLoad, _actualLoad);
    }
    
    /**
     * @dev Processes workload data and triggers redistribution if necessary
     */
    function processWorkloads() external {
        require(nodeIds.length >= 2, "Need at least 2 nodes for redistribution");
        
        // Find node with highest and lowest load
        uint256 highestLoadNodeId = 0;
        uint256 highestLoad = 0;
        uint256 lowestLoadNodeId = 0;
        uint256 lowestLoad = type(uint256).max;
        
        for (uint256 i = 0; i < nodeIds.length; i++) {
            uint256 nodeId = nodeIds[i];
            WorkloadData storage data = nodeWorkloads[nodeId];
            
            if (!data.isProcessed && data.actualLoad > highestLoad) {
                highestLoad = data.actualLoad;
                highestLoadNodeId = nodeId;
            }
            
            if (!data.isProcessed && data.actualLoad < lowestLoad) {
                lowestLoad = data.actualLoad;
                lowestLoadNodeId = nodeId;
            }
        }
        
        // Calculate load difference and amount to redistribute
        if (highestLoad > lowestLoad && (highestLoad - lowestLoad) > (highestLoad / 10)) {
            uint256 amountToRedistribute = (highestLoad - lowestLoad) / 2;
            
            // Mark workloads as processed
            nodeWorkloads[highestLoadNodeId].isProcessed = true;
            nodeWorkloads[lowestLoadNodeId].isProcessed = true;
            
            emit WorkloadRedistributionTriggered(
                block.timestamp,
                highestLoadNodeId,
                lowestLoadNodeId,
                amountToRedistribute
            );
        }
    }
    
    /**
     * @dev Manually sets workload data for testing
     * @param _nodeId The ID of the node
     * @param _predictedLoad The predicted workload
     * @param _actualLoad The actual workload
     */
    function setWorkloadData(uint256 _nodeId, uint256 _predictedLoad, uint256 _actualLoad) external onlyOwner {
        nodeWorkloads[_nodeId] = WorkloadData({
            timestamp: block.timestamp,
            predictedLoad: _predictedLoad,
            actualLoad: _actualLoad,
            isProcessed: false
        });
        
        // Add node ID to array if it doesn't exist
        bool exists = false;
        for (uint256 i = 0; i < nodeIds.length; i++) {
            if (nodeIds[i] == _nodeId) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            nodeIds.push(_nodeId);
        }
        
        emit WorkloadDataReceived(block.timestamp, _predictedLoad, _actualLoad);
    }
    
    /**
     * @dev Converts a uint256 to a string
     * @param _i The uint256 to convert
     * @return The string representation
     */
    function toString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
EOL

# Create a simple Python test script for ML component
cat > ml/profiler/test_imports.py << 'EOL'
#!/usr/bin/env python3

try:
    print("Testing numpy import...")
    import numpy as np
    print("✓ Numpy imported successfully")
    
    print("Testing TensorFlow import...")
    import tensorflow as tf
    print(f"✓ TensorFlow {tf.__version__} imported successfully")
    
    print("Testing pandas import...")
    import pandas as pd
    print("✓ Pandas imported successfully")
    
    print("Testing scikit-learn import...")
    import sklearn
    print("✓ Scikit-learn imported successfully")
    
    print("Testing matplotlib import...")
    import matplotlib.pyplot as plt
    print("✓ Matplotlib imported successfully")
    
    print("Testing web3 import...")
    import web3
    print("✓ Web3 imported successfully")
    
    print("\nAll imports successful! The Python environment is correctly configured.")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nPlease install the missing dependencies with: pip install -r requirements.txt")
EOL

# Create requirements.txt
cat > requirements.txt << 'EOL'
numpy==1.26.4
tensorflow==2.16.1
pandas==2.2.1
scikit-learn==1.4.1
matplotlib==3.8.3
web3==6.15.1
EOL

# Create a simple test script
cat > test_repository.sh << 'EOL'
#!/bin/bash

echo "Testing repository fixes..."

# Test Python imports
echo "Testing Python dependencies..."
python3 ml/profiler/test_imports.py

# Test Solidity compilation
echo -e "\nTesting Solidity compilation..."
if command -v solc &> /dev/null; then
    solc --version
    solc --optimize --bin contracts/oracle/WorkloadOracle.sol 2>&1 | grep -q "Binary:" && echo "✓ Solidity compilation successful" || echo "❌ Solidity compilation failed"
else
    echo "❌ Solidity compiler not found. Install with: npm install -g solc"
fi

echo -e "\nTest completed!"
EOL

chmod +x test_repository.sh

echo "Test environment setup complete. Run ./test_repository.sh to test the fixes."
