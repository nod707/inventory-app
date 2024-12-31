import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const measurementGuides = {
  shirt: [
    {
      measurement: 'Neck',
      instruction: 'Measure around the base of the neck, where a collar would sit.',
      tips: 'Keep the measuring tape snug but not tight.'
    },
    {
      measurement: 'Chest',
      instruction: 'Measure around the fullest part of the chest, keeping the tape parallel to the ground.',
      tips: 'Keep arms relaxed at sides.'
    },
    {
      measurement: 'Waist',
      instruction: 'Measure around the natural waistline, typically above the belly button.',
      tips: 'Don\'t pull the tape too tight; keep it comfortably snug.'
    },
    {
      measurement: 'Length',
      instruction: 'Measure from the highest point of the shoulder to the desired length.',
      tips: 'For dress shirts, measure to where you want the shirt to fall.'
    },
    {
      measurement: 'Sleeve',
      instruction: 'Measure from the shoulder seam to the end of the sleeve.',
      tips: 'Keep arm slightly bent for accurate measurement.'
    }
  ],
  pants: [
    {
      measurement: 'Waist',
      instruction: 'Measure around the natural waistline where the pants would sit.',
      tips: 'Keep the tape parallel to the ground.'
    },
    {
      measurement: 'Inseam',
      instruction: 'Measure from the crotch seam to the bottom of the leg.',
      tips: 'Measure along the inside of the leg.'
    },
    {
      measurement: 'Length',
      instruction: 'Measure from the top of the waistband to the bottom of the leg.',
      tips: 'This is the full length of the pants.'
    },
    {
      measurement: 'Hip',
      instruction: 'Measure around the fullest part of the hip area.',
      tips: 'Keep the tape level and parallel to the ground.'
    }
  ],
  dress: [
    {
      measurement: 'Bust',
      instruction: 'Measure around the fullest part of the bust.',
      tips: 'Keep the tape parallel to the ground.'
    },
    {
      measurement: 'Waist',
      instruction: 'Measure around the natural waistline.',
      tips: 'Usually the smallest part of the torso.'
    },
    {
      measurement: 'Hip',
      instruction: 'Measure around the fullest part of the hips.',
      tips: 'Keep tape parallel to the ground.'
    },
    {
      measurement: 'Length',
      instruction: 'Measure from shoulder to desired length.',
      tips: 'Measure from the highest point of the shoulder.'
    }
  ],
  skirt: [
    {
      measurement: 'Waist',
      instruction: 'Measure around the natural waistline where the skirt sits.',
      tips: 'Keep the tape snug but not tight.'
    },
    {
      measurement: 'Hip',
      instruction: 'Measure around the fullest part of the hips.',
      tips: 'Usually about 7-9 inches below the waist.'
    },
    {
      measurement: 'Length',
      instruction: 'Measure from the waist to the desired length.',
      tips: 'Consider the style of the skirt when measuring length.'
    }
  ]
};

const MeasurementGuide = ({ open, onClose, garmentType }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const guide = measurementGuides[garmentType] || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth={!isMobile}
      fullScreen={isMobile}
    >
      <DialogTitle>
        Measurement Guide for {garmentType?.charAt(0).toUpperCase() + garmentType?.slice(1)}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {guide.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {item.measurement}
                </Typography>
                <Typography variant="body1" paragraph>
                  {item.instruction}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tip: {item.tips}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default MeasurementGuide;
