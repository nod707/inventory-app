import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { products } from '../../services/api';
import { GarmentMeasurement } from '../../services/garmentMeasurement';

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
  const [debugImage, setDebugImage] = useState(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const measurementService = useRef(new GarmentMeasurement());

  useEffect(() => {
    // Initialize measurement service
    measurementService.current.initialize();
  }, []);

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
        
        // Measure garment
        const result = await measurementService.current.measureGarment(file);
        console.log('Measurement result:', result);
        
        setFormData({
          ...formData,
          dimensions: result.dimensions,
        });

        // Set debug image if available
        if (result.debugImage) {
          setDebugImage(result.debugImage);
        }

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
            <Box sx={{ mb: 2 }}>
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
                {processing ? 'Measuring Garment...' : 'Upload Image'}
              </Button>
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
            </Box>
            
            {/* Debug View */}
            {debugImage && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Detected Garment
                </Typography>
                <Box
                  component="img"
                  src={debugImage}
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    border: '1px solid #ccc',
                  }}
                />
              </Box>
            )}
          </Grid>

          {/* Dimensions */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Dimensions (inches)
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Width"
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
              label="Height"
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
              label="Depth"
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
