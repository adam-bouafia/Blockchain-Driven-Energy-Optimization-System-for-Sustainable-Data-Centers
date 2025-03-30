const EnergyToken = artifacts.require("EnergyToken");

contract("EnergyToken", (accounts) => {
  const owner = accounts[0];
  const operator1 = accounts[1];
  const operator2 = accounts[2];
  
  let tokenInstance;
  const baseURI = "https://blockchain-energy-optimization.example.com/api/token/";
  
  beforeEach(async () => {
    tokenInstance = await EnergyToken.new(baseURI, { from: owner });
  });
  
  describe("Token Minting and Awards", () => {
    it("should award tokens to an operator", async () => {
      const tokenId = 0; // EFFICIENCY_TOKEN
      const amount = 100;
      
      const tx = await tokenInstance.awardTokens(
        operator1,
        tokenId,
        amount,
        { from: owner }
      );
      
      // Check event was emitted
      assert.equal(tx.logs.length, 2, "Two events should have been emitted");
      assert.equal(tx.logs[1].event, "TokensAwarded", "TokensAwarded event should be emitted");
      
      // Check balance
      const balance = await tokenInstance.balanceOf(operator1, tokenId);
      assert.equal(balance.toNumber(), amount, "Balance should match awarded amount");
    });
    
    it("should reject token awards from non-owner", async () => {
      const tokenId = 0;
      const amount = 100;
      
      try {
        await tokenInstance.awardTokens(
          operator1,
          tokenId,
          amount,
          { from: operator2 }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Ownable: caller is not the owner"), "Expected error message not received");
      }
    });
    
    it("should reject invalid token IDs", async () => {
      const invalidTokenId = 4; // Only 0, 1, 2 are valid
      const amount = 100;
      
      try {
        await tokenInstance.awardTokens(
          operator1,
          invalidTokenId,
          amount,
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Invalid token ID"), "Expected error message not received");
      }
    });
  });
  
  describe("Decay Rate Management", () => {
    it("should set decay rate for an operator", async () => {
      const newDecayRate = 9950; // 99.5% retention per day
      
      const tx = await tokenInstance.setDecayRate(
        operator1,
        newDecayRate,
        { from: owner }
      );
      
      // Check event was emitted
      assert.equal(tx.logs.length, 1, "One event should have been emitted");
      assert.equal(tx.logs[0].event, "DecayRateUpdated", "DecayRateUpdated event should be emitted");
      
      // Check operator data
      const operatorData = await tokenInstance.getOperatorData(operator1);
      assert.equal(operatorData.decayRate.toNumber(), newDecayRate, "Decay rate should be updated");
    });
    
    it("should reject invalid decay rates", async () => {
      const invalidDecayRate = 10001; // Max is 10000 (100%)
      
      try {
        await tokenInstance.setDecayRate(
          operator1,
          invalidDecayRate,
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Decay rate cannot exceed 100%"), "Expected error message not received");
      }
    });
  });
  
  describe("Token Balance and Decay", () => {
    beforeEach(async () => {
      // Award tokens to operator1
      await tokenInstance.awardTokens(
        operator1,
        0, // EFFICIENCY_TOKEN
        1000,
        { from: owner }
      );
      
      // Set a faster decay rate for testing
      await tokenInstance.setDecayRate(
        operator1,
        9000, // 90% retention per day
        { from: owner }
      );
    });
    
    it("should calculate effective balance after decay", async () => {
      // Advance time by 1 day (86400 seconds)
      await advanceTime(86400);
      
      const effectiveBalance = await tokenInstance.getEffectiveBalance(operator1, 0);
      
      // Expected: 1000 * 0.9 = 900
      assert.equal(effectiveBalance.toNumber(), 900, "Effective balance should reflect decay");
    });
    
    it("should handle multiple token types", async () => {
      // Award another token type
      await tokenInstance.awardTokens(
        operator1,
        1, // COMPLIANCE_TOKEN
        500,
        { from: owner }
      );
      
      // Check balances
      const efficiencyBalance = await tokenInstance.balanceOf(operator1, 0);
      const complianceBalance = await tokenInstance.balanceOf(operator1, 1);
      
      assert.equal(efficiencyBalance.toNumber(), 1000, "Efficiency token balance should be correct");
      assert.equal(complianceBalance.toNumber(), 500, "Compliance token balance should be correct");
    });
  });
  
  describe("URI Management", () => {
    it("should return the correct token URI", async () => {
      // Award tokens to make the token exist
      await tokenInstance.awardTokens(
        operator1,
        0, // EFFICIENCY_TOKEN
        100,
        { from: owner }
      );
      
      const uri = await tokenInstance.uri(0);
      assert.equal(uri, baseURI + "0.json", "URI should be correctly formatted");
    });
    
    it("should allow owner to update the base URI", async () => {
      const newBaseURI = "https://new-uri.example.com/token/";
      
      await tokenInstance.setURI(newBaseURI, { from: owner });
      
      // Award tokens to make the token exist
      await tokenInstance.awardTokens(
        operator1,
        0, // EFFICIENCY_TOKEN
        100,
        { from: owner }
      );
      
      const uri = await tokenInstance.uri(0);
      assert.equal(uri, newBaseURI + "0.json", "URI should be updated");
    });
  });
  
  // Helper function to advance time in the EVM
  async function advanceTime(seconds) {
    await web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [seconds],
      id: new Date().getTime()
    }, () => {});
    
    await web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [],
      id: new Date().getTime()
    }, () => {});
  }
});
