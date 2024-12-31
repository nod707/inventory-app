import React, { useState } from 'react';
import { Box, Typography, Snackbar, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/Products/ProductForm';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      setSnackbar({
        open: true,
        message: 'Product created successfully!',
        severity: 'success'
      });

      // Navigate back to inventory after successful creation
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error) {
      console.error('Error creating product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create product. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Add New Product
        </Typography>
        <ProductForm onSubmit={handleSubmit} />
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddProductPage;
