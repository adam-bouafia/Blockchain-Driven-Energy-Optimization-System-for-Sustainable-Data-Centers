import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Box, Typography, Paper } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TokenDistributionChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    // In a real application, this data would come from the blockchain or an API
    // For demonstration purposes, we're generating sample data
    const generateData = () => {
      const labels = ['Node Alpha', 'Node Beta', 'Node Gamma', 'Node Delta', 'Node Epsilon', 'Other Nodes'];
      
      // Generate random data for token distribution
      const tokenDistribution = [
        Math.floor(Math.random() * 300) + 200,
        Math.floor(Math.random() * 250) + 150,
        Math.floor(Math.random() * 200) + 100,
        Math.floor(Math.random() * 180) + 120,
        Math.floor(Math.random() * 150) + 80,
        Math.floor(Math.random() * 400) + 300,
      ];
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Token Distribution',
            data: tokenDistribution,
            backgroundColor: [
              'rgba(25, 118, 210, 0.8)',
              'rgba(56, 142, 60, 0.8)',
              'rgba(255, 160, 0, 0.8)',
              'rgba(211, 47, 47, 0.8)',
              'rgba(2, 136, 209, 0.8)',
              'rgba(123, 31, 162, 0.8)',
            ],
            borderColor: [
              'rgba(25, 118, 210, 1)',
              'rgba(56, 142, 60, 1)',
              'rgba(255, 160, 0, 1)',
              'rgba(211, 47, 47, 1)',
              'rgba(2, 136, 209, 1)',
              'rgba(123, 31, 162, 1)',
            ],
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
        position: 'right',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} tokens (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Token Distribution
      </Typography>
      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Doughnut data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default TokenDistributionChart;
