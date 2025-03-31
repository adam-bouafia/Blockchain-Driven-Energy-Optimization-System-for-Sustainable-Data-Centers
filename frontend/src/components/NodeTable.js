import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

const createData = (id, name, status, lastActive, energyContribution, tokens) => {
  return { id, name, status, lastActive, energyContribution, tokens };
};

const rows = [
  createData(1, 'Node Alpha', 'online', '2 minutes ago', '45.2 kWh', 128),
  createData(2, 'Node Beta', 'online', '5 minutes ago', '32.7 kWh', 94),
  createData(3, 'Node Gamma', 'offline', '2 days ago', '0 kWh', 0),
  createData(4, 'Node Delta', 'online', '1 minute ago', '51.3 kWh', 145),
  createData(5, 'Node Epsilon', 'warning', '30 minutes ago', '12.8 kWh', 36),
];

const getStatusChip = (status) => {
  switch (status) {
    case 'online':
      return <Chip icon={<CheckCircleIcon />} label="Online" color="success" size="small" />;
    case 'offline':
      return <Chip icon={<ErrorIcon />} label="Offline" color="error" size="small" />;
    case 'warning':
      return <Chip icon={<WarningIcon />} label="Warning" color="warning" size="small" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

const NodeTable = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Network Nodes
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="node table">
          <TableHead>
            <TableRow>
              <TableCell>Node ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell>Energy Contribution</TableCell>
              <TableCell>Tokens</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  #{row.id}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{getStatusChip(row.status)}</TableCell>
                <TableCell>{row.lastActive}</TableCell>
                <TableCell>{row.energyContribution}</TableCell>
                <TableCell>{row.tokens}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default NodeTable;
