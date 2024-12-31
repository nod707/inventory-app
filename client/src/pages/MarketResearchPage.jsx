import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  OpenInNew as OpenInNewIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PriceAnalytics from '../components/PriceAnalytics';

const MarketResearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState({
    mercari: [],
    poshmark: [],
    ebay: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const theme = useTheme();

  const fetchListings = async (query) => {
    setLoading(true);
    try {
      // This will be handled by our browser extension
      const response = await fetch('http://localhost:3000/api/market-research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchListings(query);
  };

  const handleImport = async (listing) => {
    try {
      await fetch('http://localhost:3000/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listing)
      });
      // Show success notification
    } catch (error) {
      console.error('Error importing listing:', error);
      // Show error notification
    }
  };

  const renderListingCard = (listing) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={listing.images[0]}
          alt={listing.title}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          label={listing.source.marketplace}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {listing.title}
        </Typography>
        
        <Typography variant="h5" color="primary" gutterBottom>
          ${listing.price}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {listing.condition}
        </Typography>

        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Tooltip title="Add to Inventory">
              <IconButton onClick={() => handleImport(listing)} color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open Original">
              <IconButton onClick={() => window.open(listing.source.url, '_blank')}>
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Seller: {listing.seller}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const getFilteredListings = () => {
    if (activeTab === 'all') {
      return [
        ...listings.mercari,
        ...listings.poshmark,
        ...listings.ebay
      ];
    }
    return listings[activeTab] || [];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Market Research
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Compare listings across multiple marketplaces
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="All" value="all" />
          <Tab label="Mercari" value="mercari" />
          <Tab label="Poshmark" value="poshmark" />
          <Tab label="eBay" value="ebay" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <PriceAnalytics listings={listings} />
          
          <Divider sx={{ my: 4 }} />
          
          <Grid container spacing={3}>
            {getFilteredListings().map((listing, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                {renderListingCard(listing)}
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MarketResearchPage;
