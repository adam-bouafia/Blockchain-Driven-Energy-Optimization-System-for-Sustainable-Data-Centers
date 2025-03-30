const WorkloadOracle = artifacts.require("WorkloadOracle");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("WorkloadOracle", (accounts) => {
  const owner = accounts[0];
  const nonOwner = accounts[1];
  
  // Mock Chainlink parameters
  const mockLinkToken = "0x0000000000000000000000000000000000000001";
  const mockOracle = "0x0000000000000000000000000000000000000002";
  const mockJobId = "0x3666636566333330623533626461393835363963396631663630643034306661";
  const mockFee = web3.utils.toWei("0.1", "ether");
  
  let oracleInstance;
  
  beforeEach(async () => {
    oracleInstance = await WorkloadOracle.new(
      mockLinkToken,
      mockOracle,
      mockJobId,
      mockFee,
      { from: owner }
    );
  });
  
  describe("Initialization", () => {
    it("should initialize with correct thresholds", async () => {
      const redistributionThreshold = await oracleInstance.redistributionThreshold();
      const slaVarianceThreshold = await oracleInstance.slaVarianceThreshold();
      
      assert.equal(redistributionThreshold.toNumber(), 15, "Redistribution threshold should be 15%");
      assert.equal(slaVarianceThreshold.toNumber(), 5, "SLA variance threshold should be 5%");
    });
  });
  
  describe("Threshold Management", () => {
    it("should allow owner to update redistribution threshold", async () => {
      const newThreshold = 20;
      
      const tx = await oracleInstance.updateRedistributionThreshold(newThreshold, { from: owner });
      
      // Check event was emitted
      assert.equal(tx.logs.length, 1, "One event should have been emitted");
      assert.equal(tx.logs[0].event, "ThresholdUpdated", "ThresholdUpdated event should be emitted");
      
      // Check threshold was updated
      const redistributionThreshold = await oracleInstance.redistributionThreshold();
      assert.equal(redistributionThreshold.toNumber(), newThreshold, "Redistribution threshold should be updated");
    });
    
    it("should allow owner to update SLA variance threshold", async () => {
      const newThreshold = 10;
      
      const tx = await oracleInstance.updateSlaVarianceThreshold(newThreshold, { from: owner });
      
      // Check event was emitted
      assert.equal(tx.logs.length, 1, "One event should have been emitted");
      assert.equal(tx.logs[0].event, "ThresholdUpdated", "ThresholdUpdated event should be emitted");
      
      // Check threshold was updated
      const slaVarianceThreshold = await oracleInstance.slaVarianceThreshold();
      assert.equal(slaVarianceThreshold.toNumber(), newThreshold, "SLA variance threshold should be updated");
    });
    
    it("should reject threshold updates from non-owner", async () => {
      await expectRevert(
        oracleInstance.updateRedistributionThreshold(20, { from: nonOwner }),
        "Ownable: caller is not the owner"
      );
      
      await expectRevert(
        oracleInstance.updateSlaVarianceThreshold(10, { from: nonOwner }),
        "Ownable: caller is not the owner"
      );
    });
    
    it("should reject invalid threshold values", async () => {
      await expectRevert(
        oracleInstance.updateRedistributionThreshold(0, { from: owner }),
        "Invalid threshold value"
      );
      
      await expectRevert(
        oracleInstance.updateRedistributionThreshold(101, { from: owner }),
        "Invalid threshold value"
      );
    });
  });
  
  describe("Oracle Parameter Management", () => {
    it("should allow owner to update oracle parameters", async () => {
      const newOracle = "0x0000000000000000000000000000000000000003";
      const newJobId = "0x3666636566333330623533626461393835363963396631663630643034306662";
      const newFee = web3.utils.toWei("0.2", "ether");
      
      await oracleInstance.updateOracleParameters(
        newOracle,
        newJobId,
        newFee,
        { from: owner }
      );
      
      // Note: We can't directly check private variables, but we could add getter functions
      // or check indirectly through behavior if needed
    });
    
    it("should reject oracle parameter updates from non-owner", async () => {
      const newOracle = "0x0000000000000000000000000000000000000003";
      const newJobId = "0x3666636566333330623533626461393835363963396631663630643034306662";
      const newFee = web3.utils.toWei("0.2", "ether");
      
      await expectRevert(
        oracleInstance.updateOracleParameters(
          newOracle,
          newJobId,
          newFee,
          { from: nonOwner }
        ),
        "Ownable: caller is not the owner"
      );
    });
  });
  
  // Note: Testing the Chainlink request/response cycle would require more complex setup
  // with mock Chainlink contracts. For a simple test suite, we focus on the contract's
  // internal logic and access control.
  
  describe("Workload Redistribution Logic", () => {
    // We can't directly test the fulfillWorkloadData function without mocking Chainlink,
    // but we can test the checkAndTriggerRedistribution function by manually setting up
    // the workload data first.
    
    it("should reject redistribution check for non-existent node", async () => {
      const nodeId = web3.utils.keccak256("non_existent_node");
      
      await expectRevert(
        oracleInstance.checkAndTriggerRedistribution(nodeId, { from: owner }),
        "Node data not available"
      );
    });
    
    // Additional tests would require more complex setup to simulate the Chainlink oracle
    // response and populate the workload data.
  });
});
