import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import useEnergyContracts from '../utils/contractService';

const ContractInteraction = () => {
  const { isConnected, account } = useWeb3();
  const { 
    getSystemStats, 
    getRegisteredNodes, 
    registerNode, 
    contributeEnergy, 
    getTokenBalance 
  } = useEnergyContracts();
  
  const [systemStats, setSystemStats] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected, account]);

  const fetchData = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get system stats
      const stats = await getSystemStats();
      setSystemStats(stats);
      
      // Get token balance
      const balance = await getTokenBalance();
      setTokenBalance(balance);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch blockchain data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNode = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const nodeName = `Node-${account.substring(2, 8)}`;
      await registerNode(nodeName);
      setSuccess(`Successfully registered node: ${nodeName}`);
      fetchData();
    } catch (err) {
      console.error('Error registering node:', err);
      setError('Failed to register node. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContributeEnergy = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Contribute a random amount of energy between 10 and 100
      const energyAmount = Math.floor(Math.random() * 90) + 10;
      await contributeEnergy(energyAmount);
      setSuccess(`Successfully contributed ${energyAmount} kWh of energy`);
      fetchData();
    } catch (err) {
      console.error('Error contributing energy:', err);
      setError('Failed to contribute energy. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Smart Contract Interaction
        </Typography>
        <Alert severity="info">
          Please connect your wallet to interact with the energy optimization system.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Smart Contract Interaction
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ my: 2 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              System Statistics
            </Typography>
            {systemStats ? (
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">
                  Total Nodes: {systemStats.totalNodes}
                </Typography>
                <Typography variant="body2">
                  Active Nodes: {systemStats.activeNodes}
                </Typography>
                <Typography variant="body2">
                  Total Energy Contributed: {systemStats.totalEnergyContributed} kWh
                </Typography>
                <Typography variant="body2">
                  Total Tokens Distributed: {systemStats.totalTokensDistributed}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No data available
              </Typography>
            )}
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Your Token Balance
            </Typography>
            <Typography variant="h5" color="secondary">
              {tokenBalance} ENRG
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRegisterNode}
              disabled={loading}
            >
              Register as Node
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleContributeEnergy}
              disabled={loading}
            >
              Contribute Energy
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={fetchData}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ContractInteraction;
