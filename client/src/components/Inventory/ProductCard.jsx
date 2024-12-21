import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { api } from '../../services/api';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [listingDialog, setListingDialog] = useState(false);
  const [listingStatus, setListingStatus] = useState({
    loading: false,
    error: null,
    results: null
  });

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(product.hashtags.join(' '));
  };

  const calculateProfit = () => {
    const profit = product.sellingPrice - product.purchasePrice;
    const profitMargin = ((profit / product.purchasePrice) * 100).toFixed(2);
    return { profit, profitMargin };
  };

  const handleListProduct = async () => {
    setListingStatus({ loading: true, error: null, results: null });
    try {
      const response = await api.post(`/marketplace/list/${product._id}`);
      setListingStatus({
        loading: false,
        error: null,
        results: response.data.results
      });
    } catch (error) {
      setListingStatus({
        loading: false,
        error: error.response?.data?.message || 'Failed to list product',
        results: null
      });
    }
  };

  const { profit, profitMargin } = calculateProfit();

  return (
    <>
      <Card sx={{ maxWidth: 345, m: 1 }}>
        <CardMedia
          component="img"
          height="200"
          image={product.imageUrl}
          alt={product.name}
        />
        <CardContent>
          <Typography variant="h6" component="div">
            {product.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Purchase Price: ${product.purchasePrice}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Selling Price: ${product.sellingPrice}
          </Typography>
          
          <Typography variant="body2" color={profit > 0 ? "success.main" : "error.main"}>
            Profit Margin: {profitMargin}% (${profit})
          </Typography>

          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {product.hashtags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <IconButton onClick={() => onEdit(product)} aria-label="edit">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(product._id)} aria-label="delete">
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={handleCopyHashtags} aria-label="copy">
                <ContentCopyIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              startIcon={<ShoppingBagIcon />}
              onClick={() => setListingDialog(true)}
            >
              List Product
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={listingDialog}
        onClose={() => setListingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>List Product on Marketplaces</DialogTitle>
        <DialogContent>
          {listingStatus.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : listingStatus.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {listingStatus.error}
            </Alert>
          ) : listingStatus.results ? (
            <Box sx={{ mt: 2 }}>
              {listingStatus.results.poshmark && (
                <Alert 
                  severity={listingStatus.results.poshmark.success ? "success" : "error"}
                  sx={{ mb: 2 }}
                >
                  Poshmark: {listingStatus.results.poshmark.success ? (
                    <a href={listingStatus.results.poshmark.url} target="_blank" rel="noopener noreferrer">
                      View Listing
                    </a>
                  ) : listingStatus.results.poshmark.error}
                </Alert>
              )}
              {listingStatus.results.mercari && (
                <Alert 
                  severity={listingStatus.results.mercari.success ? "success" : "error"}
                >
                  Mercari: {listingStatus.results.mercari.success ? (
                    <a href={listingStatus.results.mercari.url} target="_blank" rel="noopener noreferrer">
                      View Listing
                    </a>
                  ) : listingStatus.results.mercari.error}
                </Alert>
              )}
            </Box>
          ) : (
            <Typography>
              List this product on your connected marketplace accounts?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListingDialog(false)}>
            Close
          </Button>
          {!listingStatus.loading && !listingStatus.results && (
            <Button onClick={handleListProduct} variant="contained" color="primary">
              List Now
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
