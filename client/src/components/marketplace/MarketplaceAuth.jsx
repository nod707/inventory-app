import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import marketplaceService from '../../services/marketplaces/marketplaceService';
import { marketplaces } from '../../services/marketplaces/marketplaceConfig';

const MarketplaceAuth = ({ platform, open, onClose, onSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await marketplaceService.authenticate(platform, credentials);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Connect to {marketplaces[platform]?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleLogin}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarketplaceAuth;
