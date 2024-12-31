import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid
} from '@mui/material';

const ClipboardListener = ({ onSave }) => {
  const [open, setOpen] = useState(false);
  const [clipboardData, setClipboardData] = useState({
    title: '',
    price: '',
    description: '',
    imageUrl: '',
    sourceUrl: '',
    platform: ''
  });

  useEffect(() => {
    const handlePaste = async (e) => {
      // Get clipboard data
      const clipText = e.clipboardData.getData('text');
      const clipHtml = e.clipboardData.getData('text/html');
      
      // Try to extract image URL from HTML
      const imageUrlMatch = clipHtml.match(/src=["'](https:\/\/[^"']+)["']/);
      const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';

      // Try to extract URL from text
      const urlMatch = clipText.match(/(https?:\/\/[^\s]+)/);
      const sourceUrl = urlMatch ? urlMatch[0] : '';

      // Detect platform from URL
      let platform = '';
      if (sourceUrl.includes('poshmark.com')) platform = 'Poshmark';
      else if (sourceUrl.includes('mercari.com')) platform = 'Mercari';
      else if (sourceUrl.includes('ebay.com')) platform = 'eBay';

      // Update state and open dialog
      setClipboardData({
        title: '',
        price: '',
        description: clipText,
        imageUrl,
        sourceUrl,
        platform
      });
      setOpen(true);
    };

    // Listen for paste events
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSave = () => {
    onSave(clipboardData);
    setOpen(false);
    setClipboardData({
      title: '',
      price: '',
      description: '',
      imageUrl: '',
      sourceUrl: '',
      platform: ''
    });
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        Add Item from Clipboard
        {clipboardData.platform && (
          <Typography variant="subtitle1" color="text.secondary">
            Source: {clipboardData.platform}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title"
              value={clipboardData.title}
              onChange={(e) => setClipboardData(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Price"
              value={clipboardData.price}
              onChange={(e) => setClipboardData(prev => ({ ...prev, price: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Source URL"
              value={clipboardData.sourceUrl}
              onChange={(e) => setClipboardData(prev => ({ ...prev, sourceUrl: e.target.value }))}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {clipboardData.imageUrl && (
              <Box
                component="img"
                src={clipboardData.imageUrl}
                alt="Product"
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'contain',
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={clipboardData.description}
              onChange={(e) => setClipboardData(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save to Inventory
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClipboardListener;
