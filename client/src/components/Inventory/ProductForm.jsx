import React, { useState, useRef } from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { products } from '../../services/api';

const ProductForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    purchaseLocation: '',
    purchasePrice: '',
    sellingLocation: '',
    sellingPrice: '',
    dimensions: [0, 0, 0],
    purchaseDate: new Date().toISOString().split('T')[0],
    hashtags: [],
  });

  const [image, setImage] = useState(null);
  const [hashtag, setHashtag] = useState('');
  const [processing, setProcessing] = useState(false);
  const imageRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      try {
        setProcessing(true);
        const dimensions = await detectDimensions(file);
        setFormData({
          ...formData,
          dimensions,
        });
      } catch (error) {
        console.error('Error detecting dimensions:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const detectDimensions = async (imageFile) => {
    // Load the image
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);
    
    return new Promise((resolve) => {
      img.onload = async () => {
        // Load COCO-SSD model
        const tf = await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js');
        const model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/coco-ssd/1/default/1');
        
        // Convert image to tensor
        const tensor = tf.browser.fromPixels(img)
          .expandDims(0);
        
        // Get predictions
        const predictions = await model.predict(tensor);
        const boxes = await predictions.array();
        
        // Calculate dimensions based on bounding box
        if (boxes && boxes[0] && boxes[0].length > 0) {
          const box = boxes[0][0];
          const [y1, x1, y2, x2] = box.slice(0, 4);
          
          // Convert to real-world dimensions (you'll need to calibrate this)
          const width = Math.abs(x2 - x1) * 0.1; // Convert to inches/cm
          const height = Math.abs(y2 - y1) * 0.1;
          const depth = Math.min(width, height) * 0.3; // Estimate depth
          
          resolve([
            Math.round(width * 10) / 10,
            Math.round(height * 10) / 10,
            Math.round(depth * 10) / 10,
          ]);
        } else {
          resolve([0, 0, 0]);
        }
        
        // Cleanup
        tensor.dispose();
        predictions.dispose();
        URL.revokeObjectURL(imageUrl);
      };
      
      img.src = imageUrl;
    });
  };

  const handleAddHashtag = () => {
    if (hashtag && !formData.hashtags.includes(hashtag)) {
      setFormData({
        ...formData,
        hashtags: [...formData.hashtags, hashtag],
      });
      setHashtag('');
    }
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setFormData({
      ...formData,
      hashtags: formData.hashtags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'dimensions' || key === 'hashtags') {
        productData.append(key, JSON.stringify(formData[key]));
      } else {
        productData.append(key, formData[key]);
      }
    });

    if (image) {
      productData.append('image', image);
    }

    await onSubmit(productData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Product' : 'Add New Product'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              name="name"
              label="Product Name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="purchaseLocation"
              label="Purchase Location"
              value={formData.purchaseLocation}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              name="purchasePrice"
              label="Purchase Price"
              value={formData.purchasePrice}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="sellingLocation"
              label="Selling Location"
              value={formData.sellingLocation}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              name="sellingPrice"
              label="Selling Price"
              value={formData.sellingPrice}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              type="date"
              name="purchaseDate"
              label="Purchase Date"
              value={formData.purchaseDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <input
              accept="image/*"
              type="file"
              id="image-input"
              hidden
              onChange={handleImageChange}
              ref={imageRef}
            />
            <Button
              variant="outlined"
              component="span"
              onClick={() => imageRef.current.click()}
              fullWidth
            >
              Upload Image
            </Button>
            {processing && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Processing image dimensions...
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Dimensions (inches)
            </Typography>
            <Grid container spacing={1}>
              {['Length', 'Width', 'Height'].map((dim, index) => (
                <Grid item xs={4} key={dim}>
                  <TextField
                    fullWidth
                    label={dim}
                    type="number"
                    value={formData.dimensions[index]}
                    onChange={(e) => {
                      const newDimensions = [...formData.dimensions];
                      newDimensions[index] = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        dimensions: newDimensions,
                      });
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                label="Add Hashtag"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleAddHashtag}
                disabled={!hashtag}
              >
                <AddIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.hashtags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveHashtag(tag)}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
            >
              {initialData ? 'Update Product' : 'Add Product'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProductForm;
