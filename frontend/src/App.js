import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { Web3Provider } from './contexts/Web3Context';

function App() {
  return (
    <Web3Provider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Web3Provider>
  );
}

export default App;
