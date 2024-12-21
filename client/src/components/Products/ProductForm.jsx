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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';

const ProductForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    condition: initialData.condition || '',
    brand: initialData.brand || '',
    color: initialData.color || '',
    size: initialData.size || '',
    price: initialData.price || '',
    measurements: initialData.measurements || {
      width: '',
      height: '',
      depth: '',
      unit: 'inches'
    },
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(initialData.images || []);
  const [loading, setLoading] = useState(false);
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
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviews = files.map(file => ({
      thumbnailPath: URL.createObjectURL(file),
      filename: file.name
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'measurements') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                label="Condition"
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="like-new">Like New</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
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
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Size"
              name="size"
              value={formData.size}
              onChange={handleChange}
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
            />
          </Grid>

          {/* Measurements */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Measurements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Width"
                  name="measurements.width"
                  type="number"
                  value={formData.measurements.width}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Height"
                  name="measurements.height"
                  type="number"
                  value={formData.measurements.height}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Depth"
                  name="measurements.depth"
                  type="number"
                  value={formData.measurements.depth}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="measurements.unit"
                    value={formData.measurements.unit}
                    onChange={handleChange}
                    label="Unit"
                  >
                    <MenuItem value="inches">Inches</MenuItem>
                    <MenuItem value="cm">Centimeters</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span">
                Upload Images
              </Button>
            </label>
          </Grid>

          {/* Image Previews */}
          {previews.length > 0 && (
            <Grid item xs={12}>
              <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={164}>
                {previews.map((preview, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={preview.thumbnailPath}
                      alt={`Preview ${index + 1}`}
                      loading="lazy"
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 4,
                        top: 4,
                        bgcolor: 'background.paper'
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                isEditing ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProductForm;
