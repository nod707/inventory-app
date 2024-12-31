import React from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  BrowserRouter as Router,
  createRoutesFromElements
} from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { iosTheme } from './theme/iosTheme';
import IPadLayout from './layouts/IPadLayout';
import { KeyboardShortcutOverlay } from './utils/IPadKeyboardShortcuts';
import InventoryPage from './pages/InventoryPage';
import StorePage from './pages/StorePage';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProductPage from './pages/AddProductPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={iosTheme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <>
            <IPadLayout>
              <Routes>
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/add" element={<AddProductPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/" element={<Navigate to="/inventory" />} />
              </Routes>
            </IPadLayout>
            <KeyboardShortcutOverlay />
          </>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
