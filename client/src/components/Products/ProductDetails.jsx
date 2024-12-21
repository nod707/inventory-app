import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  ImageList,
  ImageListItem,
  Dialog,
  IconButton,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

const ProductDetails = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {product.title}
        </Typography>

        {/* Images */}
        {product.images && product.images.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <ImageList sx={{ width: '100%', height: 300 }} cols={3} rowHeight={164}>
              {product.images.map((image, index) => (
                <ImageListItem 
                  key={index}
                  sx={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.thumbnailPath}
                    alt={`Product ${index + 1}`}
                    loading="lazy"
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 4,
                      top: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}

        {/* Product Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Typography><strong>Category:</strong> {product.category}</Typography>
              <Typography><strong>Brand:</strong> {product.brand}</Typography>
              <Typography><strong>Color:</strong> {product.color}</Typography>
              <Typography><strong>Size:</strong> {product.size}</Typography>
              <Typography><strong>Condition:</strong> {product.condition}</Typography>
              <Typography><strong>Price:</strong> ${product.price}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Measurements
              </Typography>
              {product.measurements && (
                <>
                  <Typography>
                    <strong>Width:</strong> {product.measurements.width} {product.measurements.unit}
                  </Typography>
                  <Typography>
                    <strong>Height:</strong> {product.measurements.height} {product.measurements.unit}
                  </Typography>
                  {product.measurements.depth && (
                    <Typography>
                      <strong>Depth:</strong> {product.measurements.depth} {product.measurements.unit}
                    </Typography>
                  )}
                </>
              )}

              {product.images?.[0]?.dimensions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Image Dimensions
                  </Typography>
                  <Typography>
                    {product.images[0].dimensions.width} x {product.images[0].dimensions.height} pixels
                  </Typography>
                  {product.images[0].physicalDimensions && (
                    <Typography>
                      Estimated Size: {product.images[0].physicalDimensions.widthInches.toFixed(1)} x{' '}
                      {product.images[0].physicalDimensions.heightInches.toFixed(1)} inches
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {product.description && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography>{product.description}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Image Dialog */}
        <Dialog
          open={!!selectedImage}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
        >
          {selectedImage && (
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                onClick={handleCloseDialog}
              >
                <CloseIcon />
              </IconButton>
              <img
                src={selectedImage.originalPath}
                alt="Full size"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                }}
              />
              {selectedImage.dimensions && (
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <Typography>
                    Dimensions: {selectedImage.dimensions.width} x {selectedImage.dimensions.height} pixels
                  </Typography>
                  {selectedImage.physicalDimensions && (
                    <Typography>
                      Estimated Size: {selectedImage.physicalDimensions.widthInches.toFixed(1)} x{' '}
                      {selectedImage.physicalDimensions.heightInches.toFixed(1)} inches
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductDetails;
