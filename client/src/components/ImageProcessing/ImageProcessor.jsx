import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
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

const ImageCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  '&:hover .actions': {
    opacity: 1,
  },
}));

const ImageActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '0 4px 0 4px',
}));

const ImageProcessor = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [processedImages, setProcessedImages] = useState([]);
  const [options, setOptions] = useState({
    removeBackground: true,
    enhance: true,
    resize: true,
    watermark: false,
    platform: ''
  });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (event) => {
    const { name, checked, value } = event.target;
    setOptions(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post('/api/imageProcessing/batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProcessedImages(response.data.results);
      setSelectedFiles([]);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to process images');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed-image.png');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download image');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Image Processor
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                name="platform"
                value={options.platform}
                onChange={handleOptionChange}
                label="Platform"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="poshmark">Poshmark</MenuItem>
                <MenuItem value="ebay">eBay</MenuItem>
                <MenuItem value="mercari">Mercari</MenuItem>
                <MenuItem value="therealreal">The RealReal</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={options.removeBackground}
                  onChange={handleOptionChange}
                  name="removeBackground"
                />
              }
              label="Remove Background"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.enhance}
                  onChange={handleOptionChange}
                  name="enhance"
                />
              }
              label="Enhance Image"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.resize}
                  onChange={handleOptionChange}
                  name="resize"
                />
              }
              label="Resize for Platform"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.watermark}
                  onChange={handleOptionChange}
                  name="watermark"
                />
              }
              label="Add Watermark"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Images
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </Button>

            {selectedFiles.length > 0 && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedFiles.length} files selected
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleProcess}
              disabled={processing || selectedFiles.length === 0}
              fullWidth
            >
              {processing ? <CircularProgress size={24} /> : 'Process Images'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Images
            </Typography>
            <Grid container spacing={2}>
              {selectedFiles.map((file, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <ImageCard>
                    <CardMedia
                      component="img"
                      height="200"
                      image={URL.createObjectURL(file)}
                      alt={file.name}
                    />
                    <ImageActions className="actions">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        sx={{ color: 'white' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ImageActions>
                    <CardContent>
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                    </CardContent>
                  </ImageCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Processed Images */}
        {processedImages.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Processed Images
            </Typography>
            <Grid container spacing={2}>
              {processedImages.map((result, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <ImageCard>
                    <CardMedia
                      component="img"
                      height="200"
                      image={result.processedImage}
                      alt={result.originalName}
                    />
                    <ImageActions className="actions">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(result.processedImage)}
                        sx={{ color: 'white' }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </ImageActions>
                    <CardContent>
                      <Typography variant="body2" noWrap>
                        {result.originalName}
                      </Typography>
                    </CardContent>
                  </ImageCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ImageProcessor;
