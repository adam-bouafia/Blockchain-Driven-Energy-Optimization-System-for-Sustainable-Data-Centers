/**
 * Script to interact with deployed contracts
 * Run this with: truffle exec scripts/interact_with_contracts.js
 */

const EnergyLog = artifacts.require("EnergyLog");
const EnergyToken = artifacts.require("EnergyToken");
const WorkloadOracle = artifacts.require("WorkloadOracle");

module.exports = async function(callback) {
  try {
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
    const nodeOperator = accounts[1];
    
    console.log("\nAccounts:");
    console.log("Owner:", owner);
    console.log("Node Operator:", nodeOperator);
    
    // Create a sample energy log
    console.log("\nCreating sample energy log...");
    const pueValue = 1250; // 1.25 PUE * 1000 for precision
    const nodeId = web3.utils.keccak256("node1");
    const zkProof = web3.utils.keccak256("proof1");
    
    const tx = await energyLog.createEnergyLog(
      pueValue,
      nodeId,
      zkProof,
      { from: nodeOperator }
    );
    
    console.log("Energy log created with transaction hash:", tx.tx);
    
    // Get the log ID from the event
    const logId = tx.logs[0].args.logId;
    console.log("Log ID:", logId);
    
    // Retrieve the log
    const log = await energyLog.getEnergyLog(logId);
    console.log("\nRetrieved energy log:");
    console.log("Timestamp:", log.timestamp.toString());
    console.log("PUE Value:", log.pueValue.toString());
    console.log("Node ID:", log.nodeId);
    console.log("ZK Proof:", log.zkProof);
    console.log("Verified:", log.verified);
    
    // Award tokens to the node operator
    console.log("\nAwarding tokens to node operator...");
    const tokenId = 0; // EFFICIENCY_TOKEN
    const amount = 100;
    
    await energyToken.awardTokens(
      nodeOperator,
      tokenId,
      amount,
      { from: owner }
    );
    
    // Check token balance
    const balance = await energyToken.balanceOf(nodeOperator, tokenId);
    console.log("Node operator token balance:", balance.toString());
    
    // Get total logs
    const totalLogs = await energyLog.getTotalLogs();
    console.log("\nTotal energy logs:", totalLogs.toString());
    
    console.log("\nInteraction completed successfully!");
    
    callback();
  } catch (error) {
    console.error("Error:", error);
    callback(error);
  }
};
