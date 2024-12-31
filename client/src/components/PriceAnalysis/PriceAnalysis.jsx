import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ResultsGrid from './ResultsGrid';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const PriceAnalysis = () => {
  const [query, setQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query && !selectedImage) {
      setError('Please provide either a search query or an image');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setRecommendation(null);

    try {
      const formData = new FormData();
      if (query) formData.append('query', query);
      if (selectedImage) formData.append('image', selectedImage);

      const response = await axios.post('/api/priceAnalysis/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data.similarItems);
      setRecommendation(response.data.recommendations);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred during price analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Price Analysis
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Search Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              Upload Image
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
          </Box>
          {imagePreview && (
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                }}
                onClick={handleRemoveImage}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Prices'}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {recommendation && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Price Recommendation
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              ${recommendation.suggestedPrice.toFixed(2)}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Confidence: {(recommendation.confidence * 100).toFixed(0)}%
            </Typography>
            <Typography variant="body2">
              {recommendation.reasoning}
            </Typography>
          </CardContent>
        </Card>
      )}

      {results && <ResultsGrid results={results} />}
    </Box>
  );
};

export default PriceAnalysis;
