import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Grid,
  Chip
} from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';

const tokenTransactions = [
  { id: 1, type: 'Earned', amount: 45, node: 'Node Alpha', timestamp: '10:23 AM' },
  { id: 2, type: 'Spent', amount: 12, node: 'Grid Optimization', timestamp: '11:45 AM' },
  { id: 3, type: 'Earned', amount: 28, node: 'Node Delta', timestamp: '01:12 PM' },
  { id: 4, type: 'Transferred', amount: 15, node: 'Energy Market', timestamp: '03:30 PM' },
  { id: 5, type: 'Earned', amount: 32, node: 'Node Beta', timestamp: '04:55 PM' },
];

const getTransactionColor = (type) => {
  switch (type) {
    case 'Earned':
      return 'success';
    case 'Spent':
      return 'error';
    case 'Transferred':
      return 'info';
    default:
      return 'default';
  }
};

const TokenManagementCard = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Token Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TokenIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="h5" color="secondary">1,250</Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">Earned</Typography>
              <Typography variant="h6" color="success.dark">+875</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">Spent</Typography>
              <Typography variant="h6" color="error.dark">-320</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">Rate</Typography>
              <Typography variant="h6" color="info.dark">0.05 kWh</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Recent Transactions
        </Typography>
        
        <List dense>
          {tokenTransactions.map((transaction) => (
            <ListItem key={transaction.id} divider>
              <Avatar 
                sx={{ 
                  bgcolor: `${getTransactionColor(transaction.type)}.light`,
                  color: `${getTransactionColor(transaction.type)}.dark`,
                  width: 32,
                  height: 32,
                  mr: 2
                }}
              >
                <TokenIcon fontSize="small" />
              </Avatar>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{transaction.node}</Typography>
                    <Typography 
                      variant="body2" 
                      color={transaction.type === 'Spent' ? 'error.main' : 'success.main'}
                    >
                      {transaction.type === 'Spent' ? '-' : '+'}{transaction.amount}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Chip 
                      label={transaction.type} 
                      size="small" 
                      color={getTransactionColor(transaction.type)}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {transaction.timestamp}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TokenManagementCard;
