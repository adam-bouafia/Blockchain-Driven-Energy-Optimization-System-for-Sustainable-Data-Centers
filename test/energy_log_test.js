const EnergyLog = artifacts.require("EnergyLog");

contract("EnergyLog", (accounts) => {
  const owner = accounts[0];
  const nodeOperator = accounts[1];
  
  let energyLogInstance;
  
  beforeEach(async () => {
    energyLogInstance = await EnergyLog.new({ from: owner });
  });
  
  describe("Energy Log Creation", () => {
    it("should create a new energy log entry", async () => {
      const pueValue = 1250; // 1.25 PUE * 1000 for precision
      const nodeId = web3.utils.keccak256("node1");
      const zkProof = web3.utils.keccak256("proof1");
      
      const tx = await energyLogInstance.createEnergyLog(
        pueValue,
        nodeId,
        zkProof,
        { from: nodeOperator }
      );
      
      // Check event was emitted
      assert.equal(tx.logs.length, 1, "One event should have been emitted");
      assert.equal(tx.logs[0].event, "EnergyLogCreated", "EnergyLogCreated event should be emitted");
      
      // Get the log ID from the event
      const logId = tx.logs[0].args.logId;
      
      // Retrieve the log and verify its data
      const log = await energyLogInstance.getEnergyLog(logId);
      assert.equal(log.pueValue.toNumber(), pueValue, "PUE value should match");
      assert.equal(log.nodeId, nodeId, "Node ID should match");
      assert.equal(log.zkProof, zkProof, "ZK proof should match");
      assert.equal(log.verified, false, "Log should not be verified initially");
    });
    
    it("should reject creation with invalid parameters", async () => {
      const nodeId = web3.utils.keccak256("node1");
      const zkProof = web3.utils.keccak256("proof1");
      
      try {
        await energyLogInstance.createEnergyLog(
          0, // Invalid PUE value
          nodeId,
          zkProof,
          { from: nodeOperator }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("PUE value must be positive"), "Expected error message not received");
      }
      
      try {
        await energyLogInstance.createEnergyLog(
          1250,
          "0x0000000000000000000000000000000000000000000000000000000000000000", // Invalid node ID
          zkProof,
          { from: nodeOperator }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Node ID cannot be zero"), "Expected error message not received");
      }
    });
  });
  
  describe("Energy Log Verification", () => {
    let logId;
    
    beforeEach(async () => {
      const pueValue = 1250;
      const nodeId = web3.utils.keccak256("node1");
      const zkProof = web3.utils.keccak256("proof1");
      
      const tx = await energyLogInstance.createEnergyLog(
        pueValue,
        nodeId,
        zkProof,
        { from: nodeOperator }
      );
      
      logId = tx.logs[0].args.logId;
    });
    
    it("should verify an energy log with valid verification data", async () => {
      // In a real implementation, this would be actual zk-SNARK verification data
      const verificationData = web3.utils.asciiToHex("valid_verification_data");
      
      const tx = await energyLogInstance.verifyEnergyLog(
        logId,
        verificationData,
        { from: owner }
      );
      
      // Check event was emitted
      assert.equal(tx.logs.length, 1, "One event should have been emitted");
      assert.equal(tx.logs[0].event, "EnergyLogVerified", "EnergyLogVerified event should be emitted");
      assert.equal(tx.logs[0].args.verified, true, "Log should be verified");
      
      // Retrieve the log and verify its status
      const log = await energyLogInstance.getEnergyLog(logId);
      assert.equal(log.verified, true, "Log should be verified");
    });
    
    it("should reject verification with invalid log ID", async () => {
      const invalidLogId = web3.utils.keccak256("invalid_log_id");
      const verificationData = web3.utils.asciiToHex("valid_verification_data");
      
      try {
        await energyLogInstance.verifyEnergyLog(
          invalidLogId,
          verificationData,
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Log does not exist"), "Expected error message not received");
      }
    });
  });
  
  describe("Energy Log Retrieval", () => {
    let logId;
    let nodeId;
    
    beforeEach(async () => {
      const pueValue = 1250;
      nodeId = web3.utils.keccak256("node1");
      const zkProof = web3.utils.keccak256("proof1");
      
      const tx = await energyLogInstance.createEnergyLog(
        pueValue,
        nodeId,
        zkProof,
        { from: nodeOperator }
      );
      
      logId = tx.logs[0].args.logId;
    });
    
    it("should retrieve the latest log for a node", async () => {
      const log = await energyLogInstance.getLatestNodeLog(nodeId);
      assert.equal(log.nodeId, nodeId, "Node ID should match");
    });
    
    it("should retrieve the total number of logs", async () => {
      const totalLogs = await energyLogInstance.getTotalLogs();
      assert.equal(totalLogs.toNumber(), 1, "Should have one log");
    });
    
    it("should retrieve a batch of logs", async () => {
      // Create a second log
      const pueValue = 1300;
      const zkProof = web3.utils.keccak256("proof2");
      
      await energyLogInstance.createEnergyLog(
        pueValue,
        nodeId,
        zkProof,
        { from: nodeOperator }
      );
      
      const logs = await energyLogInstance.getEnergyLogBatch(0, 2);
      assert.equal(logs.length, 2, "Should retrieve two logs");
    });
  });
});
