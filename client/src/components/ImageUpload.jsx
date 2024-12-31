import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ images, onChange, maxImages = 3 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    onChange([...images, ...newImages].slice(0, maxImages));
  }, [images, onChange, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages
  });

  const handleDelete = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Images ({images.length}/{maxImages})
      </Typography>
      
      {images.length < maxImages && (
        <Paper
          {...getRootProps()}
          elevation={0}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
            mb: 2,
            backgroundColor: 'grey.50'
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
          <Typography>
            {isDragActive 
              ? 'Drop files here'
              : images.length === 0 
                ? 'Drag & drop or click to select images'
                : 'Add more images'}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={1}>
        {images.map((image, index) => (
          <Grid item xs={4} key={index}>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '100%',
                backgroundColor: 'grey.100',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src={image.preview}
                alt={`Upload ${index + 1}`}
                sx={{
                  position: 'absolute',
                  top: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleDelete(index)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImageUpload;
