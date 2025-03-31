import { useWeb3 } from '../contexts/Web3Context';
import EnergyOptimizationSystemABI from '../contracts/EnergyOptimizationSystem.json';
import EnergyTokenABI from '../contracts/EnergyToken.json';

// Contract addresses - these would typically come from environment variables or a config file
// For demonstration purposes, we're using placeholder addresses
const CONTRACT_ADDRESSES = {
  ENERGY_SYSTEM: '0x123456789012345678901234567890123456789a',
  ENERGY_TOKEN: '0x987654321098765432109876543210987654321b'
};

export const useEnergyContracts = () => {
  const { web3, account, isConnected, getContract, getEthersContract } = useWeb3();

  // Get Energy Optimization System contract instance
  const getEnergySystemContract = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await getContract(EnergyOptimizationSystemABI, CONTRACT_ADDRESSES.ENERGY_SYSTEM);
    } catch (error) {
      console.error('Error getting Energy System contract:', error);
      throw error;
    }
  };

  // Get Energy Token contract instance
  const getEnergyTokenContract = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await getContract(EnergyTokenABI, CONTRACT_ADDRESSES.ENERGY_TOKEN);
    } catch (error) {
      console.error('Error getting Energy Token contract:', error);
      throw error;
    }
  };

  // Get system statistics
  const getSystemStats = async () => {
    try {
      const contract = await getEnergySystemContract();
      const stats = await contract.methods.getSystemStats().call();
      
      return {
        totalNodes: parseInt(stats.totalNodes),
        activeNodes: parseInt(stats.activeNodes),
        totalEnergyContributed: parseInt(stats.totalEnergyContributed),
        totalTokensDistributed: parseInt(stats.totalTokensDistributed)
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  };

  // Get all registered nodes
  const getRegisteredNodes = async () => {
    try {
      const contract = await getEnergySystemContract();
      const nodeAddresses = await contract.methods.getRegisteredNodes().call();
      
      // Get details for each node
      const nodePromises = nodeAddresses.map(async (address) => {
        const details = await contract.methods.getNodeDetails(address).call();
        return {
          address,
          name: details.name,
          active: details.active,
          totalEnergyContributed: parseInt(details.totalEnergyContributed),
          totalTokensEarned: parseInt(details.totalTokensEarned),
          lastActiveTime: parseInt(details.lastActiveTime)
        };
      });
      
      return Promise.all(nodePromises);
    } catch (error) {
      console.error('Error getting registered nodes:', error);
      throw error;
    }
  };

  // Register a new node
  const registerNode = async (name) => {
    try {
      const contract = await getEnergySystemContract();
      return await contract.methods.registerNode(name).send({ from: account });
    } catch (error) {
      console.error('Error registering node:', error);
      throw error;
    }
  };

  // Contribute energy
  const contributeEnergy = async (energyAmount) => {
    try {
      const contract = await getEnergySystemContract();
      return await contract.methods.contributeEnergy(energyAmount).send({ from: account });
    } catch (error) {
      console.error('Error contributing energy:', error);
      throw error;
    }
  };

  // Get token balance
  const getTokenBalance = async (address = account) => {
    try {
      const contract = await getEnergyTokenContract();
      const balance = await contract.methods.balanceOf(address).call();
      return parseInt(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  };

  // Transfer tokens
  const transferTokens = async (to, amount) => {
    try {
      const contract = await getEnergyTokenContract();
      return await contract.methods.transfer(to, amount).send({ from: account });
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  };

  return {
    getEnergySystemContract,
    getEnergyTokenContract,
    getSystemStats,
    getRegisteredNodes,
    registerNode,
    contributeEnergy,
    getTokenBalance,
    transferTokens
  };
};

export default useEnergyContracts;
