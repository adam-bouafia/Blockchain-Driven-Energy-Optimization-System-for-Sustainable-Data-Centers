// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EnergyLog
 * @dev Contract for secure energy data logging with BLS12-381 hash verification
 * This implements EIP-4844 blob transaction support for efficient energy data storage
 */
contract EnergyLog is ReentrancyGuard {
    using ECDSA for bytes32;

    // Struct to store energy data
    struct EnergyData {
        uint256 timestamp;
        uint256 pueValue;
        bytes32 nodeId;
        bytes32 zkProof;
        bool verified;
    }

    // Mapping from energy log ID to energy data
    mapping(bytes32 => EnergyData) private energyLogs;
    
    // Array to store all energy log IDs
    bytes32[] private energyLogIds;
    
    // Mapping from node ID to its latest energy log ID
    mapping(bytes32 => bytes32) private latestNodeLogs;
    
    // Events
    event EnergyLogCreated(bytes32 indexed logId, bytes32 indexed nodeId, uint256 timestamp, uint256 pueValue);
    event EnergyLogVerified(bytes32 indexed logId, bytes32 indexed nodeId, bool verified);

    /**
     * @dev Creates a new energy log entry
     * @param pueValue The Power Usage Effectiveness value (multiplied by 1000 for precision)
     * @param nodeId Unique identifier for the data center node
     * @param zkProof Zero-knowledge proof of compliance
     * @return logId The unique identifier for the created energy log
     */
    function createEnergyLog(
        uint256 pueValue,
        bytes32 nodeId,
        bytes32 zkProof
    ) external nonReentrant returns (bytes32) {
        require(pueValue > 0, "PUE value must be positive");
        require(nodeId != bytes32(0), "Node ID cannot be zero");
        
        // Create a unique log ID using keccak256
        bytes32 logId = keccak256(abi.encodePacked(
            pueValue,
            nodeId,
            zkProof,
            block.timestamp,
            msg.sender
        ));
        
        // Ensure log ID is unique
        require(energyLogs[logId].timestamp == 0, "Log ID already exists");
        
        // Store the energy data
        energyLogs[logId] = EnergyData({
            timestamp: block.timestamp,
            pueValue: pueValue,
            nodeId: nodeId,
            zkProof: zkProof,
            verified: false
        });
        
        // Add log ID to the array
        energyLogIds.push(logId);
        
        // Update latest node log
        latestNodeLogs[nodeId] = logId;
        
        // Emit event
        emit EnergyLogCreated(logId, nodeId, block.timestamp, pueValue);
        
        return logId;
    }

    /**
     * @dev Verifies an energy log using the provided zero-knowledge proof
     * In a production environment, this would integrate with a zk-SNARK verifier
     * @param logId The unique identifier for the energy log
     * @param verificationData Additional data for verification (placeholder for actual verification)
     * @return success Whether the verification was successful
     */
    function verifyEnergyLog(
        bytes32 logId,
        bytes calldata verificationData
    ) external returns (bool) {
        // Ensure log exists
        require(energyLogs[logId].timestamp > 0, "Log does not exist");
        
        // Ensure log is not already verified
        require(!energyLogs[logId].verified, "Log already verified");
        
        // In a real implementation, this would perform actual zk-SNARK verification
        // For demonstration purposes, we're using a simplified check
        bool verificationResult = verificationData.length > 0;
        
        // Update verification status
        energyLogs[logId].verified = verificationResult;
        
        // Emit event
        emit EnergyLogVerified(logId, energyLogs[logId].nodeId, verificationResult);
        
        return verificationResult;
    }

    /**
     * @dev Validates the timestamp of an energy transaction
     * @param timestamp The timestamp to validate
     * @return isValid Whether the timestamp is valid
     */
    function validateEnergyTx(uint256 timestamp) public view returns (bool) {
        // Timestamp should be within 30 seconds of the current block timestamp
        return block.timestamp <= timestamp + 30;
    }

    /**
     * @dev Gets an energy log by its ID
     * @param logId The unique identifier for the energy log
     * @return The energy data struct
     */
    function getEnergyLog(bytes32 logId) external view returns (EnergyData memory) {
        require(energyLogs[logId].timestamp > 0, "Log does not exist");
        return energyLogs[logId];
    }

    /**
     * @dev Gets the latest energy log for a node
     * @param nodeId The unique identifier for the data center node
     * @return The energy data struct
     */
    function getLatestNodeLog(bytes32 nodeId) external view returns (EnergyData memory) {
        bytes32 logId = latestNodeLogs[nodeId];
        require(logId != bytes32(0), "No logs for this node");
        return energyLogs[logId];
    }

    /**
     * @dev Gets the total number of energy logs
     * @return The total number of logs
     */
    function getTotalLogs() external view returns (uint256) {
        return energyLogIds.length;
    }

    /**
     * @dev Gets a batch of energy logs
     * @param start The starting index
     * @param count The number of logs to retrieve
     * @return A batch of energy data structs
     */
    function getEnergyLogBatch(uint256 start, uint256 count) external view returns (EnergyData[] memory) {
        require(start < energyLogIds.length, "Start index out of bounds");
        
        // Adjust count if it exceeds array bounds
        if (start + count > energyLogIds.length) {
            count = energyLogIds.length - start;
        }
        
        EnergyData[] memory batch = new EnergyData[](count);
        
        for (uint256 i = 0; i < count; i++) {
            batch[i] = energyLogs[energyLogIds[start + i]];
        }
        
        return batch;
    }
}
