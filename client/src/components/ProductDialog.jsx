import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
  Divider,
} from '@mui/material';
import PhotoUpload from './PhotoUpload';
import MeasurementsForm from './MeasurementsForm';

const INITIAL_FORM_STATE = {
  name: '',
  brand: '',
  style: '',
  size: '',
  category: '',
  quantity: '',
  purchasePrice: '',
  listPrice: '',
  purchaseDate: null,
  purchaseLocation: '',
  description: '',
  photos: [],
  measurements: {},
  platforms: {
    poshmark: false,
    mercari: false,
    ebay: false,
    etsy: false,
    therealreal: false,
  }
};

function ProductDialog({ open, handleClose, product, onSave }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [product]);

  useEffect(() => {
    // Cleanup photo URLs when component unmounts
    return () => {
      formData.photos.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Purchase price is required';
    if (formData.purchasePrice < 0) newErrors.purchasePrice = 'Purchase price cannot be negative';
    if (!formData.listPrice) newErrors.listPrice = 'List price is required';
    if (formData.listPrice < 0) newErrors.listPrice = 'List price cannot be negative';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePlatformChange = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms[platform],
      }
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      purchaseDate: date
    }));
  };

  const handlePhotosChange = (newPhotos) => {
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  const handleMeasurementChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...formData,
        quantity: Number(formData.quantity),
        purchasePrice: Number(formData.purchasePrice),
        listPrice: Number(formData.listPrice),
        status: Number(formData.quantity) <= 10 ? 'Low Stock' : 'In Stock',
      });
      handleClose();
      setFormData(INITIAL_FORM_STATE);
    } else {
      setErrors(newErrors);
    }
  };

  const categories = [
    'Clothing',
    'Shoes',
    'Accessories',
    'Electronics',
    'Home & Living',
    'Jewelry',
    'Vintage',
    'Designer',
    'Other',
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Photos Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Product Photos
            </Typography>
            <PhotoUpload
              photos={formData.photos}
              onPhotosChange={handlePhotosChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="name"
              label="Product Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="brand"
              label="Brand"
              fullWidth
              value={formData.brand}
              onChange={handleChange}
              error={!!errors.brand}
              helperText={errors.brand}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="style"
              label="Style"
              fullWidth
              value={formData.style}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="size"
              label="Size"
              fullWidth
              value={formData.size}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="category"
              label="Category"
              select
              fullWidth
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              value={formData.quantity}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
          </Grid>

          {/* Measurements Section */}
          <Grid item xs={12}>
            <MeasurementsForm
              category={formData.category}
              measurements={formData.measurements}
              onMeasurementChange={handleMeasurementChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Purchase Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Purchase Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="purchasePrice"
              label="Purchase Price"
              type="number"
              fullWidth
              value={formData.purchasePrice}
              onChange={handleChange}
              error={!!errors.purchasePrice}
              helperText={errors.purchasePrice}
              InputProps={{
                startAdornment: '$',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="listPrice"
              label="List Price"
              type="number"
              fullWidth
              value={formData.listPrice}
              onChange={handleChange}
              error={!!errors.listPrice}
              helperText={errors.listPrice}
              InputProps={{
                startAdornment: '$',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="purchaseDate"
              label="Purchase Date"
              type="date"
              fullWidth
              value={formData.purchaseDate ? formData.purchaseDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="purchaseLocation"
              label="Purchase Location"
              fullWidth
              value={formData.purchaseLocation}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Listing Platforms
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.platforms.poshmark}
                    onChange={() => handlePlatformChange('poshmark')}
                  />
                }
                label="Poshmark"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.platforms.mercari}
                    onChange={() => handlePlatformChange('mercari')}
                  />
                }
                label="Mercari"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.platforms.ebay}
                    onChange={() => handlePlatformChange('ebay')}
                  />
                }
                label="eBay"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.platforms.etsy}
                    onChange={() => handlePlatformChange('etsy')}
                  />
                }
                label="Etsy"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.platforms.therealreal}
                    onChange={() => handlePlatformChange('therealreal')}
                  />
                }
                label="The RealReal"
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Additional Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {product ? 'Save Changes' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductDialog;
