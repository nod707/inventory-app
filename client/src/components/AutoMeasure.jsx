import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Close from '@mui/icons-material/Close';
import CameraAlt from '@mui/icons-material/CameraAlt';

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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  },
}));

function AutoMeasure({ open, onClose, onMeasurementDetected, measurementType, unit }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('measurementType', measurementType);
      formData.append('unit', unit);

      // Send to API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/measurements/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      onMeasurementDetected(data.measurement);
      handleClose();
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err.message || 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Auto-Measure {measurementType}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'grey.500',
            '&:hover': { color: 'grey.700' },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 3,
          }}
        >
          {preview ? (
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
              }}
            >
              <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body1" color="grey.600">
                Take a photo or upload an image
              </Typography>
              <Typography variant="body2" color="grey.500" sx={{ mt: 1 }}>
                Make sure the {measurementType} is clearly visible
              </Typography>
            </Box>
          )}

          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="grey.600">
                Processing image...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleCameraCapture}
          startIcon={<CameraAlt />}
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            background: 'linear-gradient(45deg, #007AFF, #5856D6)',
            '&:hover': {
              background: 'linear-gradient(45deg, #0056b3, #4240b3)',
            },
          }}
        >
          Take Photo
        </Button>

        <VisuallyHiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
        />
      </DialogActions>
    </StyledDialog>
  );
}

export default AutoMeasure;
