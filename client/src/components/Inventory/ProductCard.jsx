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
  Alert,
  Collapse
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { api } from '../../services/api';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [listingDialog, setListingDialog] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
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
          image={product.imageUrl || product.images?.[0] || '/placeholder.png'}
          alt={product.title || product.name}
        />
        <CardContent>
          <Typography variant="h6" component="div">
            {product.title || product.name}
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

          {product.garmentType && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Type: {product.garmentType.toLowerCase()}
              </Typography>
              <Button
                size="small"
                onClick={() => setShowMeasurements(!showMeasurements)}
                endIcon={showMeasurements ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showMeasurements ? 'Hide' : 'Show'} Measurements
              </Button>
              <Collapse in={showMeasurements}>
                <Box sx={{ mt: 1, pl: 2 }}>
                  {product.measurements && Object.entries(product.measurements).map(([key, value]) => (
                    <Typography key={key} variant="body2" color="text.secondary">
                      {key.charAt(0).toUpperCase() + key.slice(1)}: {value}"
                    </Typography>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}

          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {product.hashtags?.map((tag, index) => (
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
              {product.hashtags?.length > 0 && (
                <IconButton onClick={handleCopyHashtags} aria-label="copy hashtags">
                  <ContentCopyIcon />
                </IconButton>
              )}
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<ShoppingBagIcon />}
              onClick={() => setListingDialog(true)}
            >
              List
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={listingDialog} onClose={() => setListingDialog(false)}>
        <DialogTitle>List Product</DialogTitle>
        <DialogContent>
          {listingStatus.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : listingStatus.error ? (
            <Alert severity="error">{listingStatus.error}</Alert>
          ) : listingStatus.results ? (
            <Alert severity="success">
              Successfully listed product!
              {listingStatus.results.url && (
                <Box sx={{ mt: 1 }}>
                  <a href={listingStatus.results.url} target="_blank" rel="noopener noreferrer">
                    View Listing
                  </a>
                </Box>
              )}
            </Alert>
          ) : (
            <Typography>
              Are you sure you want to list this product on the marketplace?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListingDialog(false)}>Cancel</Button>
          <Button
            onClick={handleListProduct}
            disabled={listingStatus.loading || listingStatus.results}
            variant="contained"
          >
            List Product
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
