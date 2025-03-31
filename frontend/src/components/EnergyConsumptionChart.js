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
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
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
  Legend,
  Filler
);

const EnergyConsumptionChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    // In a real application, this data would come from the blockchain or an API
    // For demonstration purposes, we're generating sample data
    const generateData = () => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Generate random data for regular consumption
      const regularConsumption = labels.map(() => Math.floor(Math.random() * 100) + 200);
      
      // Generate optimized consumption (always lower than regular)
      const optimizedConsumption = regularConsumption.map(value => 
        value - (Math.floor(Math.random() * 50) + 30)
      );
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Regular Consumption',
            data: regularConsumption,
            borderColor: 'rgb(25, 118, 210)',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Optimized Consumption',
            data: optimizedConsumption,
            borderColor: 'rgb(56, 142, 60)',
            backgroundColor: 'rgba(56, 142, 60, 0.1)',
            fill: true,
            tension: 0.4,
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
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Energy (kWh)'
        },
        min: 0,
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Energy Consumption Over Time
      </Typography>
      <Box sx={{ height: 350 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default EnergyConsumptionChart;
