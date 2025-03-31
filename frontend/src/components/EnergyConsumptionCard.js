import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const EnergyConsumptionCard = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Energy Consumption
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Current Usage</Typography>
            <Typography variant="body2" color="primary">245 kWh</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={65} 
            color="primary"
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Optimized Usage</Typography>
            <Typography variant="body2" color="secondary">187 kWh</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={45} 
            color="secondary"
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <ElectricBoltIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Peak Reduction" 
              secondary="23.6% decrease in peak load"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SavingsIcon color="secondary" />
            </ListItemIcon>
            <ListItemText 
              primary="Cost Savings" 
              secondary="$127.45 this month"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUpIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Efficiency Trend" 
              secondary="12% improvement from last month"
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default EnergyConsumptionCard;
