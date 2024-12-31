import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  ImageList,
  ImageListItem,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  ListSubheader
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { MeasurementService } from '../../services/MeasurementService';
import { GarmentMeasurementService } from '../../services/GarmentMeasurementService';

const GARMENT_CATEGORIES = {
  TOPS: ['T-Shirt', 'Shirt', 'Sweater', 'Jacket', 'Blazer'],
  BOTTOMS: ['Pants', 'Jeans', 'Shorts', 'Skirt'],
  DRESSES: ['Dress', 'Jumpsuit', 'Romper'],
  OTHER: ['Other']
};

const ProductForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    category: initialData.category || '',
    condition: initialData.condition || '',
    brand: initialData.brand || '',
    color: initialData.color || '',
    size: initialData.size || '',
    price: initialData.price || '',
    status: initialData.status || 'draft',
    measurements: initialData.measurements || {
      shoulders: '',
      chest: '',
      waist: '',
      hip: '',
      length: '',
      sleeve: '',
      inseam: '',
      outseam: '',
      legOpening: '',
      unit: 'inches'
    },
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(initialData.images || []);
  const [loading, setLoading] = useState(false);
  const [measurementView, setMeasurementView] = useState('front');
  const [measurementError, setMeasurementError] = useState(null);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('measurements.')) {
      const measurementField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    console.log('Image change event:', e);
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    setImages(files);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    console.log('Created previews:', newPreviews);
    setPreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images first if any
      let imageUrls = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images');
        }

        const uploadResult = await uploadResponse.json();
        imageUrls = uploadResult.urls;
      }

      // Call the onSubmit prop with the form data and image URLs
      await onSubmit({
        ...formData,
        images: imageUrls,
        userId: user.id
      });

      // Clear form after successful submission if not editing
      if (!isEditing) {
        setFormData({
          name: '',
          description: '',
          category: '',
          condition: '',
          brand: '',
          color: '',
          size: '',
          price: '',
          status: 'draft',
          measurements: {
            shoulders: '',
            chest: '',
            waist: '',
            hip: '',
            length: '',
            sleeve: '',
            inseam: '',
            outseam: '',
            legOpening: '',
            unit: 'inches'
          },
        });
        setImages([]);
        setPreviews([]);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getGarmentType = () => {
    console.log('Category:', formData.category);
    const category = formData.category.toUpperCase();
    if (GARMENT_CATEGORIES.TOPS.includes(formData.category)) {
      console.log('Detected as SHIRT');
      return 'SHIRT';
    }
    if (GARMENT_CATEGORIES.BOTTOMS.includes(formData.category)) {
      console.log('Detected as PANTS');
      return 'PANTS';
    }
    if (GARMENT_CATEGORIES.DRESSES.includes(formData.category)) {
      console.log('Detected as DRESS');
      return 'DRESS';
    }
    console.log('No garment type detected');
    return null;
  };

  const handleAutoMeasure = async () => {
    console.log('Auto measure clicked');
    console.log('Images:', images);
    console.log('Current view:', measurementView);

    if (!images.length) {
      console.log('No images found');
      setMeasurementError('Please upload an image first');
      return;
    }

    const garmentType = getGarmentType();
    if (!garmentType) {
      console.log('No garment type found');
      setMeasurementError('Please select a valid garment category first');
      return;
    }

    try {
      console.log('Starting measurement process');
      setLoading(true);
      setMeasurementError(null);

      console.log('Calling GarmentMeasurementService with:', {
        imageFile: images[0],
        garmentType,
        view: measurementView
      });

      const measurements = await GarmentMeasurementService.measureGarment(
        images[0],
        garmentType,
        measurementView
      );
      
      console.log('Received measurements:', measurements);
      
      if (measurements) {
        console.log('Updating form data with measurements');
        setFormData(prev => ({
          ...prev,
          measurements: {
            ...prev.measurements,
            ...measurements
          }
        }));
      } else {
        console.log('No measurements returned');
        throw new Error('No measurements detected');
      }
    } catch (error) {
      console.error('Error measuring garment:', error);
      setMeasurementError(
        error.message || 'Failed to measure garment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMeasurementFields = () => {
    const garmentType = getGarmentType();
    if (!garmentType) return null;

    const fields = {
      SHIRT: ['shoulders', 'chest', 'waist', 'length', 'sleeve'],
      PANTS: ['waist', 'hip', 'inseam', 'outseam', 'legOpening'],
      DRESS: ['shoulders', 'bust', 'waist', 'hip', 'length']
    }[garmentType] || [];

    return (
      <Grid container spacing={2}>
        {fields.map(field => (
          <Grid item xs={12} sm={4} key={field}>
            <TextField
              fullWidth
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={`measurements.${field}`}
              type="number"
              value={formData.measurements[field]}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: <Typography>{formData.measurements.unit}</Typography>
              }}
            />
          </Grid>
        ))}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Unit</InputLabel>
            <Select
              name="measurements.unit"
              value={formData.measurements.unit}
              onChange={handleChange}
              label="Unit"
            >
              <MenuItem value="inches">Inches</MenuItem>
              <MenuItem value="centimeters">Centimeters</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required variant="outlined">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              {Object.entries(GARMENT_CATEGORIES).map(([group, items]) => [
                <ListSubheader key={group}>{group}</ListSubheader>,
                ...items.map(item => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required variant="outlined">
            <InputLabel>Condition</InputLabel>
            <Select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              label="Condition"
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="like_new">Like New</MenuItem>
              <MenuItem value="excellent">Excellent</MenuItem>
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="fair">Fair</MenuItem>
              <MenuItem value="poor">Poor</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            variant="outlined"
            InputProps={{
              startAdornment: <Typography>$</Typography>
            }}
          />
        </Grid>

        {/* Measurements */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Measurements
          </Typography>
          {getGarmentType() && (
            <Box sx={{ mb: 2 }}>
              <ToggleButtonGroup
                value={measurementView}
                exclusive
                onChange={(e, value) => value && setMeasurementView(value)}
                size="small"
              >
                <ToggleButton value="front">Front View</ToggleButton>
                <ToggleButton value="back">Back View</ToggleButton>
                <ToggleButton value="side">Side View</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
          {renderMeasurementFields()}
          {measurementError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {measurementError}
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleAutoMeasure}
              disabled={!images.length || loading || !getGarmentType()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Auto Measure from Images
            </Button>
          </Box>
        </Grid>

        {/* Images */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Images
          </Typography>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            multiple
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button variant="contained" component="span" sx={{ mb: 2 }}>
              Upload Images
            </Button>
          </label>

          {previews.length > 0 && (
            <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={164}>
              {previews.map((preview, index) => (
                <ImageListItem key={index}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    loading="lazy"
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 4,
                      top: 4,
                      bgcolor: 'background.paper'
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              isEditing ? 'Update Product' : 'Create Product'
            )}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
