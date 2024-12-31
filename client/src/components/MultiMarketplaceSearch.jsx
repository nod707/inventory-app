import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Link,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Search as SearchIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import ClipboardListener from './ClipboardListener';

const MARKETPLACE_CONFIGS = {
  mercari: {
    name: 'Mercari',
    searchUrl: 'https://www.mercari.com/search/?keyword=',
    color: 'red'
  },
  poshmark: {
    name: 'Poshmark',
    searchUrl: 'https://poshmark.com/search?query=',
    color: 'pink'
  },
  ebay: {
    name: 'eBay',
    searchUrl: 'https://www.ebay.com/sch/i.html?_nkw=',
    color: 'blue'
  }
};

const MultiMarketplaceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState({
    mercari: true,
    poshmark: true,
    ebay: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          platforms: Object.entries(selectedMarketplaces)
            .filter(([_, isSelected]) => isSelected)
            .map(([platform]) => platform)
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (platform) => {
    const config = MARKETPLACE_CONFIGS[platform];
    if (!searchQuery.trim() || !config) return;

    const encodedQuery = encodeURIComponent(searchQuery);
    window.open(`${config.searchUrl}${encodedQuery}`, `_blank_${platform}`);
  };

  const handleClipboardSave = async (itemData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: itemData.title,
          price: parseFloat(itemData.price.replace(/[^0-9.]/g, '')),
          description: itemData.description,
          imageUrl: itemData.imageUrl,
          sourceUrl: itemData.sourceUrl,
          sourcePlatform: itemData.platform,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save item');
      }

      setSnackbar({
        open: true,
        message: 'Item saved to inventory!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Save error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save item',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Multi-Marketplace Search
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Tip: After finding an item, copy (Ctrl/Cmd + C) its details and paste (Ctrl/Cmd + V) here to add it to your inventory!
      </Alert>

      <form onSubmit={handleSearch}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item xs>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across marketplaces..."
              variant="outlined"
              disabled={isLoading}
            />
          </Grid>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </form>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Object.entries(MARKETPLACE_CONFIGS).map(([key, config]) => (
          <Grid item key={key} xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{config.name}</Typography>
                  <Chip
                    label={selectedMarketplaces[key] ? 'Selected' : 'Not Selected'}
                    color={selectedMarketplaces[key] ? 'primary' : 'default'}
                    onClick={() => setSelectedMarketplaces(prev => ({
                      ...prev,
                      [key]: !prev[key]
                    }))}
                  />
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuickSearch(key)}
                  disabled={isLoading}
                >
                  Quick Search
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {error && (
        <Typography color="error" sx={{ mt: 2, mb: 4 }}>
          Error: {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        {results.map((item, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={item.image || 'https://via.placeholder.com/200'}
                alt={item.title}
                sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    component={Link} 
                    href={item.url} 
                    target="_blank"
                    sx={{ ml: 1 }}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Box>
                <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                  {item.price}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.description}
                </Typography>
                <Chip
                  label={item.platform}
                  size="small"
                  sx={{
                    bgcolor: MARKETPLACE_CONFIGS[item.platform.toLowerCase()]?.color || 'grey.500',
                    color: 'white'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ClipboardListener onSave={handleClipboardSave} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MultiMarketplaceSearch;
