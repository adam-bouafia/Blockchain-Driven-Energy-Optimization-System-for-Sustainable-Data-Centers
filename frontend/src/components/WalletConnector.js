import React from 'react';
import { Button, Box, Typography, CircularProgress, Chip, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWeb3 } from '../contexts/Web3Context';

const WalletConnector = () => {
  const { 
    account, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    networkId, 
    error 
  } = useWeb3();

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getNetworkName = (id) => {
    switch (id) {
      case 1:
        return 'Ethereum Mainnet';
      case 3:
        return 'Ropsten Testnet';
      case 4:
        return 'Rinkeby Testnet';
      case 5:
        return 'Goerli Testnet';
      case 42:
        return 'Kovan Testnet';
      case 56:
        return 'Binance Smart Chain';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai';
      default:
        return `Network ID: ${id}`;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isConnected ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<AccountBalanceWalletIcon />}
              label={formatAddress(account)}
              color="primary"
              variant="outlined"
            />
            {networkId && (
              <Chip
                label={getNetworkName(networkId)}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleDisconnect}
            startIcon={<AccountBalanceWalletIcon />}
          >
            Disconnect Wallet
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnect}
          startIcon={<AccountBalanceWalletIcon />}
        >
          Connect Wallet
        </Button>
      )}
    </Box>
  );
};

export default WalletConnector;
