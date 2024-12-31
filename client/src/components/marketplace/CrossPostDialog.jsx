import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import marketplaceService from '../../services/marketplaces/marketplaceService';
import { marketplaces } from '../../services/marketplaces/marketplaceConfig';
import MarketplaceAuth from './MarketplaceAuth';

const CrossPostDialog = ({ open, onClose, product }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [posting, setPosting] = useState(false);
  const [results, setResults] = useState(null);

  const handlePlatformToggle = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      if (!marketplaceService.isAuthenticated(platform)) {
        setCurrentPlatform(platform);
        setAuthDialogOpen(true);
      } else {
        setSelectedPlatforms([...selectedPlatforms, platform]);
      }
    }
  };

  const handleAuthSuccess = () => {
    if (currentPlatform) {
      setSelectedPlatforms([...selectedPlatforms, currentPlatform]);
    }
  };

  const handleCrossPost = async () => {
    setPosting(true);
    try {
      const postResults = await marketplaceService.crossPostProduct(
        product,
        selectedPlatforms
      );
      setResults(postResults);
    } catch (error) {
      console.error('Cross-posting failed:', error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cross-Post Product</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select platforms to post to:
            </Typography>
            {Object.entries(marketplaces).map(([key, platform]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={selectedPlatforms.includes(key)}
                    onChange={() => handlePlatformToggle(key)}
                  />
                }
                label={platform.name}
              />
            ))}
            {results && (
              <Box sx={{ mt: 2 }}>
                {Object.entries(results).map(([platform, result]) => (
                  <Alert
                    key={platform}
                    severity={result.success ? 'success' : 'error'}
                    sx={{ mb: 1 }}
                  >
                    {platform}: {result.success ? 'Posted successfully' : result.error}
                  </Alert>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleCrossPost}
            variant="contained"
            disabled={posting || selectedPlatforms.length === 0}
          >
            {posting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Posting...
              </>
            ) : (
              'Post to Selected Platforms'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <MarketplaceAuth
        platform={currentPlatform}
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default CrossPostDialog;
