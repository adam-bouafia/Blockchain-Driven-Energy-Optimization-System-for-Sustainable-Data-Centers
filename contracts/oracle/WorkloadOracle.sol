// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WorkloadOracle
 * @dev Contract for Chainlink-triggered workload redistribution
 * Uses SGX-enhanced oracles for secure off-chain data integration
 */
contract WorkloadOracle is ChainlinkClient, ConfirmedOwner, ReentrancyGuard {
    using Chainlink for Chainlink.Request;
    
    // Oracle parameters
    bytes32 private jobId;
    uint256 private fee;
    
    // Workload data structure
    struct WorkloadData {
        uint256 timestamp;
        uint256 coolingLoad;
        uint256 computeLoad;
        uint256 slaThreshold;
        bool redistributionTriggered;
    }
    
    // Mapping from node ID to its workload data
    mapping(bytes32 => WorkloadData) private nodeWorkloads;
    
    // Array of node IDs
    bytes32[] private nodeIds;
    
    // Redistribution threshold (15% target)
    uint256 public redistributionThreshold = 15;
    
    // SLA variance threshold (5% target)
    uint256 public slaVarianceThreshold = 5;
    
    // Events
    event WorkloadDataReceived(bytes32 indexed nodeId, uint256 coolingLoad, uint256 computeLoad);
    event RedistributionTriggered(bytes32 indexed nodeId, uint256 coolingLoad, uint256 timestamp);
    event ThresholdUpdated(string thresholdType, uint256 newValue);
    
    /**
     * @dev Constructor
     * @param _chainlinkToken Address of the LINK token
     * @param _oracle Address of the Chainlink oracle
     * @param _jobId Job ID for the Chainlink request
     * @param _fee Fee in LINK for the Chainlink request
     */
    constructor(
        address _chainlinkToken,
        address _oracle,
        bytes32 _jobId,
        uint256 _fee
    ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(_chainlinkToken);
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = _fee;
    }
    
    /**
     * @dev Requests workload data from a Chainlink oracle
     * @param nodeId Unique identifier for the data center node
     * @return requestId The ID of the Chainlink request
     */
    function requestWorkloadData(bytes32 nodeId) external onlyOwner returns (bytes32) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillWorkloadData.selector
        );
        
        // Add parameters to the request
        req.add("nodeId", bytes32ToString(nodeId));
        req.add("endpoint", "workload");
        
        // Send the request
        return sendChainlinkRequest(req, fee);
    }
    
    /**
     * @dev Callback function for Chainlink oracle response
     * @param _requestId The ID of the Chainlink request
     * @param _nodeId Unique identifier for the data center node
     * @param _coolingLoad Cooling load value
     * @param _computeLoad Compute load value
     * @param _slaThreshold SLA threshold value
     */
    function fulfillWorkloadData(
        bytes32 _requestId,
        bytes32 _nodeId,
        uint256 _coolingLoad,
        uint256 _computeLoad,
        uint256 _slaThreshold
    ) external recordChainlinkFulfillment(_requestId) {
        // Store the workload data
        if (nodeWorkloads[_nodeId].timestamp == 0) {
            // New node
            nodeIds.push(_nodeId);
        }
        
        nodeWorkloads[_nodeId] = WorkloadData({
            timestamp: block.timestamp,
            coolingLoad: _coolingLoad,
            computeLoad: _computeLoad,
            slaThreshold: _slaThreshold,
            redistributionTriggered: false
        });
        
        emit WorkloadDataReceived(_nodeId, _coolingLoad, _computeLoad);
        
        // Check if redistribution should be triggered
        checkAndTriggerRedistribution(_nodeId);
    }
    
    /**
     * @dev Checks if workload redistribution should be triggered
     * @param nodeId Unique identifier for the data center node
     * @return Whether redistribution was triggered
     */
    function checkAndTriggerRedistribution(bytes32 nodeId) public returns (bool) {
        WorkloadData storage workload = nodeWorkloads[nodeId];
        require(workload.timestamp > 0, "Node data not available");
        
        // Calculate cooling efficiency (lower is better)
        uint256 coolingEfficiency = (workload.coolingLoad * 100) / workload.computeLoad;
        
        // Calculate SLA headroom (higher is better)
        uint256 slaHeadroom = workload.slaThreshold > workload.computeLoad 
            ? ((workload.slaThreshold - workload.computeLoad) * 100) / workload.slaThreshold
            : 0;
        
        // Check if redistribution should be triggered
        // Trigger if cooling efficiency is high and there's enough SLA headroom
        if (coolingEfficiency > redistributionThreshold && slaHeadroom > slaVarianceThreshold) {
            workload.redistributionTriggered = true;
            emit RedistributionTriggered(nodeId, workload.coolingLoad, block.timestamp);
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Updates the redistribution threshold
     * @param newThreshold New threshold value (percentage)
     */
    function updateRedistributionThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0 && newThreshold <= 100, "Invalid threshold value");
        redistributionThreshold = newThreshold;
        emit ThresholdUpdated("redistribution", newThreshold);
    }
    
    /**
     * @dev Updates the SLA variance threshold
     * @param newThreshold New threshold value (percentage)
     */
    function updateSlaVarianceThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0 && newThreshold <= 100, "Invalid threshold value");
        slaVarianceThreshold = newThreshold;
        emit ThresholdUpdated("slaVariance", newThreshold);
    }
    
    /**
     * @dev Gets workload data for a node
     * @param nodeId Unique identifier for the data center node
     * @return The workload data struct
     */
    function getNodeWorkload(bytes32 nodeId) external view returns (WorkloadData memory) {
        require(nodeWorkloads[nodeId].timestamp > 0, "Node data not available");
        return nodeWorkloads[nodeId];
    }
    
    /**
     * @dev Gets all node IDs
     * @return Array of node IDs
     */
    function getAllNodeIds() external view returns (bytes32[] memory) {
        return nodeIds;
    }
    
    /**
     * @dev Updates the Chainlink oracle parameters
     * @param _oracle New oracle address
     * @param _jobId New job ID
     * @param _fee New fee
     */
    function updateOracleParameters(
        address _oracle,
        bytes32 _jobId,
        uint256 _fee
    ) external onlyOwner {
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = _fee;
    }
    
    /**
     * @dev Withdraws LINK tokens from the contract
     */
    function withdrawLink() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }
    
    /**
     * @dev Converts bytes32 to string
     * @param _bytes32 The bytes32 value to convert
     * @return string representation
     */
    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
}
