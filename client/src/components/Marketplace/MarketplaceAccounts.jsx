import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../services/api';

const MarketplaceAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, platform: null });
  const [connectDialog, setConnectDialog] = useState({ open: false, platform: null });
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/marketplace/accounts');
      setAccounts(response.data);
    } catch (error) {
      setError('Failed to fetch connected accounts');
    }
  };

  const handleConnect = async () => {
    try {
      const platform = connectDialog.platform;
      const response = await api.post(`/marketplace/${platform}/connect`, credentials);
      
      if (response.data.success) {
        fetchAccounts();
        setConnectDialog({ open: false, platform: null });
        setCredentials({ username: '', password: '' });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to connect account');
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      await api.post(`/marketplace/${platform}/disconnect`);
      setAccounts(accounts.filter(account => account.platform !== platform));
      setConfirmDialog({ open: false, platform: null });
    } catch (error) {
      setError('Failed to disconnect account');
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Connected Marketplaces
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <List>
        {accounts.map((account) => (
          <ListItem key={account.platform}>
            <ListItemText
              primary={account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
              secondary={`Connected as: ${account.username}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => setConfirmDialog({ open: true, platform: account.platform })}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {!accounts.find(a => a.platform === 'poshmark') && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setConnectDialog({ open: true, platform: 'poshmark' })}
          >
            Connect Poshmark
          </Button>
        )}

        {!accounts.find(a => a.platform === 'mercari') && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setConnectDialog({ open: true, platform: 'mercari' })}
          >
            Connect Mercari
          </Button>
        )}
      </Box>

      {/* Connect Account Dialog */}
      <Dialog
        open={connectDialog.open}
        onClose={() => {
          setConnectDialog({ open: false, platform: null });
          setCredentials({ username: '', password: '' });
        }}
      >
        <DialogTitle>
          Connect {connectDialog.platform?.charAt(0).toUpperCase() + connectDialog.platform?.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleInputChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConnectDialog({ open: false, platform: null });
            setCredentials({ username: '', password: '' });
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect}
            variant="contained"
            color="primary"
            disabled={!credentials.username || !credentials.password}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, platform: null })}
      >
        <DialogTitle>Confirm Disconnection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to disconnect your {confirmDialog.platform} account?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, platform: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDisconnect(confirmDialog.platform)}
            color="error"
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketplaceAccounts;
