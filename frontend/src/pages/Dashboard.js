import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import NodeTable from '../components/NodeTable';
import EnergyConsumptionCard from '../components/EnergyConsumptionCard';
import TokenManagementCard from '../components/TokenManagementCard';
import ContractInteraction from '../components/ContractInteraction';
import EnergyConsumptionChart from '../components/EnergyConsumptionChart';
import TokenDistributionChart from '../components/TokenDistributionChart';
import NodeStatusVisualization from '../components/NodeStatusVisualization';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Main Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <EnergyConsumptionCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <TokenManagementCard />
        </Grid>
      </Grid>
      
      {/* Contract Interaction */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <ContractInteraction />
        </Grid>
      </Grid>
      
      {/* Energy Consumption Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <EnergyConsumptionChart />
        </Grid>
      </Grid>
      
      {/* Token Distribution and Node Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TokenDistributionChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <NodeStatusVisualization />
        </Grid>
      </Grid>
      
      {/* Node Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NodeTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
