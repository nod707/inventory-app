import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Dialog,
  IconButton,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../services/api';
import ProductCard from '../Inventory/ProductCard';
import ProductForm from '../ProductForm';

const Dashboard = () => {
  const [productList, setProductList] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const { logout, user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await products.getAll();
      setProductList(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editProduct) {
        await products.update(editProduct._id, formData);
      } else {
        await products.create(formData);
      }
      setOpenForm(false);
      setEditProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setOpenForm(true);
  };

  const handleDelete = async (productId) => {
    try {
      await products.delete(productId);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = productList.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateTotalProfit = () => {
    return productList
      .filter(product => product.soldDate)
      .reduce((total, product) => total + (product.sellingPrice - product.purchasePrice), 0);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Manager
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.username}
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <TextField
                placeholder="Search products or hashtags"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditProduct(null);
                  setOpenForm(true);
                }}
              >
                Add Product
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Total Profit: ${calculateTotalProfit().toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <ProductCard
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Dialog
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setEditProduct(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <ProductForm
            onSubmit={handleSubmit}
            initialData={editProduct}
            onCancel={() => {
              setOpenForm(false);
              setEditProduct(null);
            }}
          />
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
