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
  CircularProgress,
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
  const [error, setError] = useState('');
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

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
        setError('');
        console.log('Processing image:', file.name);
        const dimensions = await detectDimensions(file);
        console.log('Dimensions detected:', dimensions);
        setFormData({
          ...formData,
          dimensions,
        });
      } catch (error) {
        console.error('Error detecting dimensions:', error);
        setError(`Failed to detect dimensions: ${error.message}. Please enter them manually.`);
        setFormData({
          ...formData,
          dimensions: [0, 0, 0],
        });
      } finally {
        setProcessing(false);
      }
    }
  };

  const detectDimensions = async (imageFile) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Starting dimension detection...');
        // Create image element
        const img = new Image();
        const imageUrl = URL.createObjectURL(imageFile);
        console.log('Created image URL:', imageUrl);
        
        img.onload = async () => {
          try {
            console.log('Image loaded, dimensions:', img.width, 'x', img.height);
            // Load TensorFlow.js
            console.log('Loading TensorFlow...');
            const tf = await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js');
            await tf.ready();
            console.log('TensorFlow loaded and ready');
            
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            console.log('Image drawn to canvas');
            
            // Convert image to tensor
            console.log('Converting to tensor...');
            const imageTensor = tf.browser.fromPixels(canvas)
              .expandDims(0)
              .toFloat()
              .div(255.0);
            console.log('Created image tensor:', imageTensor.shape);
            
            // Load COCO-SSD model
            console.log('Loading COCO-SSD model...');
            const model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1/model.json');
            console.log('Model loaded');
            
            // Get predictions
            console.log('Getting predictions...');
            const predictions = await model.predict(imageTensor);
            const boxes = await predictions.array();
            console.log('Predictions:', boxes);
            
            if (boxes && boxes[0] && boxes[0].length > 0) {
              console.log('Object detected');
              // Get the first detected object
              const box = boxes[0][0];
              const [y1, x1, y2, x2] = box.slice(0, 4);
              
              // Calculate pixel dimensions
              const pixelWidth = Math.abs(x2 - x1) * img.width;
              const pixelHeight = Math.abs(y2 - y1) * img.height;
              console.log('Pixel dimensions:', pixelWidth, 'x', pixelHeight);
              
              // Convert to inches (assuming 96 DPI)
              const PIXELS_PER_INCH = 96;
              const width = Math.round((pixelWidth / PIXELS_PER_INCH) * 10) / 10;
              const height = Math.round((pixelHeight / PIXELS_PER_INCH) * 10) / 10;
              const depth = Math.round((Math.min(width, height) * 0.4) * 10) / 10; // Estimate depth
              
              console.log('Final dimensions (inches):', [width, height, depth]);
              
              // Cleanup
              imageTensor.dispose();
              predictions.dispose();
              URL.revokeObjectURL(imageUrl);
              
              resolve([width, height, depth]);
            } else {
              console.log('No objects detected');
              reject(new Error('No objects detected in image'));
            }
          } catch (error) {
            console.error('Error in image processing:', error);
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          console.error('Error loading image:', error);
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
      } catch (error) {
        console.error('Error in dimension detection:', error);
        reject(error);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'dimensions') {
        formDataToSubmit.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSubmit.append(key, formData[key]);
      }
    });
    
    // Append image if exists
    if (image) {
      formDataToSubmit.append('image', image);
    }
    
    try {
      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    }
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

  const handleDeleteHashtag = (tagToDelete) => {
    setFormData({
      ...formData,
      hashtags: formData.hashtags.filter((tag) => tag !== tagToDelete),
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Product Details
            </Typography>
          </Grid>
          
          {/* Basic Information */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          
          {/* Image Upload */}
          <Grid item xs={12}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-upload"
              ref={imageRef}
            />
            <Button
              variant="contained"
              onClick={() => imageRef.current.click()}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {processing ? 'Processing Image...' : 'Upload Image'}
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Grid>

          {/* Dimensions */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Width (inches)"
              type="number"
              inputProps={{ step: '0.1' }}
              value={formData.dimensions[0]}
              onChange={(e) => {
                const newDimensions = [...formData.dimensions];
                newDimensions[0] = parseFloat(e.target.value) || 0;
                setFormData({ ...formData, dimensions: newDimensions });
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Height (inches)"
              type="number"
              inputProps={{ step: '0.1' }}
              value={formData.dimensions[1]}
              onChange={(e) => {
                const newDimensions = [...formData.dimensions];
                newDimensions[1] = parseFloat(e.target.value) || 0;
                setFormData({ ...formData, dimensions: newDimensions });
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Depth (inches)"
              type="number"
              inputProps={{ step: '0.1' }}
              value={formData.dimensions[2]}
              onChange={(e) => {
                const newDimensions = [...formData.dimensions];
                newDimensions[2] = parseFloat(e.target.value) || 0;
                setFormData({ ...formData, dimensions: newDimensions });
              }}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={processing}
            >
              Save Product
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ProductForm;
