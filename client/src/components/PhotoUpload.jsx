import { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function PhotoUpload({ photos, onPhotosChange }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newPhotos = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    onPhotosChange([...photos, ...newPhotos]);
  };

  const handleDelete = (index) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        sx={{
          p: 2,
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          bgcolor: dragOver ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          id="photo-upload"
          onChange={handleFileSelect}
        />
        <label htmlFor="photo-upload">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={2}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" align="center" gutterBottom>
              Drag and drop photos here or click to select
            </Typography>
            <Button
              component="span"
              variant="contained"
              startIcon={<AddPhotoAlternateIcon />}
            >
              Upload Photos
            </Button>
          </Box>
        </label>
      </Paper>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {photos.map((photo, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper
                sx={{
                  position: 'relative',
                  paddingTop: '100%', // 1:1 Aspect Ratio
                  '&:hover .delete-button': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  src={photo.preview}
                  alt={`Product photo ${index + 1}`}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  className="delete-button"
                  onClick={() => handleDelete(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'background.paper',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'white',
                    },
                  }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default PhotoUpload;
