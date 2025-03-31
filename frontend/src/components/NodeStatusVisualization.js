import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, Paper } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const NodeStatusVisualization = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    // In a real application, this data would come from the blockchain or an API
    // For demonstration purposes, we're generating sample data
    const generateData = () => {
      const labels = ['Node Alpha', 'Node Beta', 'Node Gamma', 'Node Delta', 'Node Epsilon'];
      
      // Generate random data for energy contribution
      const energyContribution = [
        Math.floor(Math.random() * 30) + 40,
        Math.floor(Math.random() * 25) + 30,
        0, // Offline node
        Math.floor(Math.random() * 35) + 45,
        Math.floor(Math.random() * 10) + 10,
      ];
      
      // Generate token rewards based on energy contribution
      const tokenRewards = energyContribution.map(value => 
        value === 0 ? 0 : Math.floor(value * (Math.random() * 0.5 + 2.5))
      );
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Energy Contribution (kWh)',
            data: energyContribution,
            backgroundColor: 'rgba(25, 118, 210, 0.8)',
            borderColor: 'rgba(25, 118, 210, 1)',
            borderWidth: 1,
          },
          {
            label: 'Token Rewards',
            data: tokenRewards,
            backgroundColor: 'rgba(56, 142, 60, 0.8)',
            borderColor: 'rgba(56, 142, 60, 1)',
            borderWidth: 1,
          }
        ]
      });
    };
    
    generateData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Node'
        }
      }
    },
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Node Status
      </Typography>
      <Box sx={{ height: 300 }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default NodeStatusVisualization;
