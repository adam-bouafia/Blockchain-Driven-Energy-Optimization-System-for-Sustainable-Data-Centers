/**
 * Truffle configuration file
 * 
 * See https://trufflesuite.com/docs/truffle/reference/configuration
 */

require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    // Development network configuration (local)
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 6721975,
    },
    
    // Testnet configuration (for when you're ready to deploy to a testnet)
    goerli: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC || "", 
        `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
      ),
      network_id: 5,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    
    // HPC configuration (for university HPC deployment)
    hpc: {
      host: process.env.HPC_HOST || "127.0.0.1",
      port: process.env.HPC_PORT || 8545,
      network_id: "*",
      gas: 6721975,
    }
  },
  
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "london"
      }
    }
  },
  
  // Plugin configuration
  plugins: [
    'solidity-coverage',
    'truffle-plugin-verify',
    'eth-gas-reporter'
  ],
  
  // Gas reporter configuration
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      excludeContracts: ['Migrations']
    }
  }
};
