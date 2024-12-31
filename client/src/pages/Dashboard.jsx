import { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ProductDialog from '../components/ProductDialog';

function Dashboard() {
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'T-Shirt', 
      brand: 'Nike',
      style: 'Athletic',
      size: 'L',
      quantity: 50, 
      purchasePrice: 10.99,
      listPrice: 19.99, 
      status: 'In Stock',
      category: 'Clothing',
      description: 'Comfortable cotton t-shirt',
      purchaseDate: new Date('2023-12-20'),
      purchaseLocation: 'Target',
      platforms: {
        poshmark: true,
        mercari: true,
        ebay: false,
        etsy: false,
        therealreal: false,
      }
    },
    { 
      id: 2, 
      name: 'Jeans', 
      brand: 'Levi\'s',
      style: '501',
      size: '32x34',
      quantity: 30, 
      purchasePrice: 25.99,
      listPrice: 49.99, 
      status: 'Low Stock',
      category: 'Clothing',
      description: 'Classic blue jeans',
      purchaseDate: new Date('2023-12-15'),
      purchaseLocation: 'Macy\'s',
      platforms: {
        poshmark: true,
        mercari: false,
        ebay: true,
        etsy: false,
        therealreal: false,
      }
    },
    { 
      id: 3, 
      name: 'Sneakers', 
      brand: 'Adidas',
      style: 'Ultraboost',
      size: '10',
      quantity: 25, 
      purchasePrice: 45.99,
      listPrice: 79.99, 
      status: 'In Stock',
      category: 'Shoes',
      description: 'Casual sneakers',
      purchaseDate: new Date('2023-12-10'),
      purchaseLocation: 'Adidas Outlet',
      platforms: {
        poshmark: true,
        mercari: true,
        ebay: true,
        etsy: false,
        therealreal: false,
      }
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((acc, product) => acc + (product.listPrice * product.quantity), 0),
    lowStock: products.filter(product => product.status === 'Low Stock').length,
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleSaveProduct = (productData) => {
    if (selectedProduct) {
      // Edit existing product
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...productData, id: p.id } : p
      ));
    } else {
      // Add new product
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      setProducts([...products, { ...productData, id: newId }]);
    }
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      handleDeleteDialogClose();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalProducts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h5">
                    ${stats.totalValue.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5">
                    {stats.lowStock}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Inventory
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Product
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Style</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Purchase Price</TableCell>
                <TableCell align="right">List Price</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Platforms</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.style}</TableCell>
                  <TableCell>{product.size}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell align="right">${product.purchasePrice.toFixed(2)}</TableCell>
                  <TableCell align="right">${product.listPrice.toFixed(2)}</TableCell>
                  <TableCell>{product.purchaseDate?.toLocaleDateString()}</TableCell>
                  <TableCell>{product.purchaseLocation}</TableCell>
                  <TableCell>
                    {Object.entries(product.platforms)
                      .filter(([_, isListed]) => isListed)
                      .map(([platform]) => platform.charAt(0).toUpperCase())
                      .join(', ')}
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        color: product.status === 'Low Stock' ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {product.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(product)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(product)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {productToDelete?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
