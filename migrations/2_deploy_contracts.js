const EnergyLog = artifacts.require("EnergyLog");
const EnergyToken = artifacts.require("EnergyToken");
const WorkloadOracle = artifacts.require("WorkloadOracle");

module.exports = function(deployer, network, accounts) {
  // Deploy EnergyLog contract
  deployer.deploy(EnergyLog)
    .then(() => {
      console.log("EnergyLog deployed at:", EnergyLog.address);
      
      // Deploy EnergyToken contract with base URI
      const baseTokenURI = "https://blockchain-energy-optimization.example.com/api/token/";
      return deployer.deploy(EnergyToken, baseTokenURI);
    })
    .then(() => {
      console.log("EnergyToken deployed at:", EnergyToken.address);
      
      // For local development, use placeholder values for Chainlink parameters
      // In production, these would be actual Chainlink network values
      let linkToken, oracle, jobId, fee;
      
      if (network === 'development') {
        // Placeholder values for local development
        linkToken = "0x0000000000000000000000000000000000000000";
        oracle = "0x0000000000000000000000000000000000000000";
        jobId = "0x3666636566333330623533626461393835363963396631663630643034306661";
        fee = web3.utils.toWei("0.1", "ether");
      } else if (network === 'goerli') {
        // Goerli testnet values
        linkToken = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
        oracle = "0xCC79157eb46F5624204f47AB42b3906cAA40eaB7";
        jobId = "0x3666636566333330623533626461393835363963396631663630643034306661";
        fee = web3.utils.toWei("0.1", "ether");
      } else if (network === 'hpc') {
        // HPC network values (would be configured for actual deployment)
        linkToken = process.env.HPC_LINK_TOKEN;
        oracle = process.env.HPC_ORACLE;
        jobId = process.env.HPC_JOB_ID;
        fee = web3.utils.toWei("0.1", "ether");
      }
      
      // Deploy WorkloadOracle contract
      return deployer.deploy(WorkloadOracle, linkToken, oracle, jobId, fee);
    })
    .then(() => {
      console.log("WorkloadOracle deployed at:", WorkloadOracle.address);
      console.log("All contracts deployed successfully!");
    });
};
