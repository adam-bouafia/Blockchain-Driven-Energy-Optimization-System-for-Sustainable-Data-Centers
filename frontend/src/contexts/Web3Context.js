import React, { createContext, useContext, useState } from 'react';
import Web3 from 'web3';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      setError(null);
      
      // Check if MetaMask is installed
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create Web3 instance
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Create ethers provider - updated for ethers v6
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        
        // Set account
        setAccount(accounts[0]);
        
        // Get network ID
        const network = await web3Instance.eth.net.getId();
        setNetworkId(network);
        
        setIsConnected(true);
        
        // Setup event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        return true;
      } else {
        setError('Please install MetaMask to use this application');
        return false;
      }
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError(err.message || 'Failed to connect to wallet');
      return false;
    }
  };
  
  const disconnectWallet = () => {
    setWeb3(null);
    setProvider(null);
    setAccount(null);
    setNetworkId(null);
    setIsConnected(false);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
  
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setAccount(accounts[0]);
    }
  };
  
  const handleChainChanged = () => {
    // When chain changes, reload the page as recommended by MetaMask
    window.location.reload();
  };
  
  // Helper function to get contract instance
  const getContract = async (contractABI, contractAddress) => {
    if (!web3 || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return new web3.eth.Contract(contractABI, contractAddress);
    } catch (err) {
      console.error('Error creating contract instance:', err);
      throw err;
    }
  };
  
  // Helper function to get contract with ethers.js
  const getEthersContract = (contractABI, contractAddress) => {
    if (!provider || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signer = provider.getSigner();
      return new ethers.Contract(contractAddress, contractABI, signer);
    } catch (err) {
      console.error('Error creating ethers contract instance:', err);
      throw err;
    }
  };

  const value = {
    web3,
    provider,
    account,
    networkId,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    getContract,
    getEthersContract
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
