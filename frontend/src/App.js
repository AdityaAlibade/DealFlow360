import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { QuotationProvider } from './contexts/QuotationContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuotationProvider>
          <Router>
            <AppRoutes />
          </Router>
        </QuotationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
