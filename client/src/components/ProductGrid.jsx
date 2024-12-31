import React, { useState } from 'react';
import {
  Grid,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Fade,
  Typography,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ProductCard from './ProductCard';
import ProductDialog from './ProductDialog';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'priceLow', label: 'Price: Low to High' },
];

const ProductGrid = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAnchor, setSortAnchor] = useState(null);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSortClick = (event) => {
    setSortAnchor(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchor(null);
  };

  const handleSortSelect = (value) => {
    setSelectedSort(value);
    handleSortClose();
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products
    .filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.brand?.toLowerCase().includes(searchLower) ||
        product.style?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.hashtags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'priceHigh':
          return b.price - a.price;
        case 'priceLow':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddProduct}
          >
            Add Product
          </Button>
        </Box>

        {/* Search and Filter Section */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 4,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={handleSortClick}
            endIcon={<FilterListIcon />}
          >
            Sort
          </Button>
          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={handleSortClose}
            TransitionComponent={Fade}
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={selectedSort === option.value}
                onClick={() => handleSortSelect(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Product Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard
                product={product}
                onClick={() => handleProductClick(product)}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
              />
            </Grid>
          ))}
        </Grid>

        {/* Product Detail Dialog */}
        <ProductDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          product={selectedProduct}
        />
      </Box>
    </Container>
  );
};

export default ProductGrid;
