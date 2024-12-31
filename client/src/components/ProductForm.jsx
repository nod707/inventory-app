import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ImageUpload from './ImageUpload';
import HashtagInput from './HashtagInput';
import MeasurementGuide from './MeasurementGuide';
import { validateProduct, formatValidationErrors } from '../utils/validation';
import { products } from '../services/api';

const garmentTypes = [
  { value: 'shirt', label: 'Shirt', measurements: ['neck', 'chest', 'waist', 'length', 'sleeve'] },
  { value: 'pants', label: 'Pants', measurements: ['waist', 'inseam', 'length', 'hip'] },
  { value: 'dress', label: 'Dress', measurements: ['bust', 'waist', 'hip', 'length'] },
  { value: 'skirt', label: 'Skirt', measurements: ['waist', 'hip', 'length'] },
];

const conditions = [
  { value: 'new', label: 'New with Tags' },
  { value: 'likenew', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const ProductForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    type: '',
    brand: '',
    style: '',
    date: new Date(),
    purchasePrice: '',
    soldPrice: '',
    condition: '',
    measurements: {},
    images: [],
    hashtags: [],
    description: '',
    useMetric: false,
  });
  
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'type' && { measurements: {} })
    }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMeasurementChange = (measurement) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [measurement]: formData.useMetric ? value : value * 2.54
      }
    }));
    // Clear measurement error when edited
    if (errors.measurements?.[measurement]) {
      setErrors(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurement]: null
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(formatValidationErrors(validation.errors));
      setSnackbar({
        open: true,
        message: 'Please fix the errors before submitting',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data
      const data = new FormData();
      
      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images') {
          if (key === 'measurements' || key === 'hashtags') {
            data.append(key, JSON.stringify(value));
          } else if (key === 'date') {
            data.append(key, value.toISOString());
          } else {
            data.append(key, value);
          }
        }
      });

      // Append images
      formData.images.forEach((image, index) => {
        data.append(`images`, image.file);
      });

      // Send to API
      if (initialData?._id) {
        await products.update(initialData._id, data);
      } else {
        await products.create(data);
      }

      setSnackbar({
        open: true,
        message: `Product ${initialData?._id ? 'updated' : 'created'} successfully!`,
        severity: 'success'
      });

      // Call parent's onSubmit
      onSubmit(formData);
      
    } catch (error) {
      console.error('Error submitting product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving product. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getMeasurementLabel = (measurement) => {
    return measurement.charAt(0).toUpperCase() + measurement.slice(1) +
      (formData.useMetric ? ' (cm)' : ' (in)');
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: '100%', margin: 'auto' }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Type"
              value={formData.type}
              onChange={handleChange('type')}
              margin="normal"
              {...errors.type}
            >
              {garmentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Brand"
              value={formData.brand}
              onChange={handleChange('brand')}
              margin="normal"
              {...errors.brand}
            />

            <TextField
              fullWidth
              label="Style"
              value={formData.style}
              onChange={handleChange('style')}
              margin="normal"
              {...errors.style}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Purchase Date"
                value={formData.date}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, date: newValue }));
                  if (errors.date) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.date;
                      return newErrors;
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    margin="normal"
                    {...errors.date}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              select
              fullWidth
              label="Condition"
              value={formData.condition}
              onChange={handleChange('condition')}
              margin="normal"
              {...errors.condition}
            >
              {conditions.map((condition) => (
                <MenuItem key={condition.value} value={condition.value}>
                  {condition.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Purchase Price"
              value={formData.purchasePrice}
              onChange={handleChange('purchasePrice')}
              margin="normal"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              {...errors.purchasePrice}
            />

            <TextField
              fullWidth
              label="Sold Price"
              value={formData.soldPrice}
              onChange={handleChange('soldPrice')}
              margin="normal"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              {...errors.soldPrice}
            />
          </Grid>

          {/* Middle Column - Images and Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <ImageUpload
                images={formData.images}
                onChange={(images) => {
                  setFormData(prev => ({ ...prev, images }));
                  if (errors.images) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.images;
                      return newErrors;
                    });
                  }
                }}
              />
              {errors.images && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {errors.images.helperText}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                margin="normal"
                {...errors.description}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <HashtagInput
                hashtags={formData.hashtags}
                onChange={(hashtags) => {
                  setFormData(prev => ({ ...prev, hashtags }));
                  if (errors.hashtags) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.hashtags;
                      return newErrors;
                    });
                  }
                }}
                error={errors.hashtags?.error}
                helperText={errors.hashtags?.helperText}
              />
            </Box>
          </Grid>

          {/* Right Column - Measurements */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Measurements
              </Typography>
              <IconButton size="small" onClick={() => setShowGuide(true)}>
                <InfoIcon />
              </IconButton>
              <Box sx={{ flexGrow: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useMetric}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      useMetric: e.target.checked
                    }))}
                  />
                }
                label="Use Metric (cm)"
              />
            </Box>

            {formData.type && garmentTypes
              .find(t => t.value === formData.type)
              ?.measurements.map((measurement) => (
                <TextField
                  key={measurement}
                  fullWidth
                  label={getMeasurementLabel(measurement)}
                  value={formData.measurements[measurement] || ''}
                  onChange={handleMeasurementChange(measurement)}
                  margin="normal"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.useMetric ? 'cm' : 'in'}
                      </InputAdornment>
                    ),
                  }}
                  {...(errors.measurements?.[measurement] || {})}
                />
              ))}
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <MeasurementGuide
        open={showGuide}
        onClose={() => setShowGuide(false)}
        garmentType={formData.type}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProductForm;
