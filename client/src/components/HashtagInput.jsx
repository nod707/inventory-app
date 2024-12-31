import React, { useState } from 'react';
import {
  Box,
  TextField,
  Chip,
  Typography,
  InputAdornment,
} from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';

const HashtagInput = ({ hashtags, onChange }) => {
  const [input, setInput] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    // Remove spaces and special characters, only allow letters, numbers, and underscores
    setInput(value.replace(/[^a-zA-Z0-9_]/g, ''));
  };

  const handleInputKeyPress = (event) => {
    if (event.key === 'Enter' && input.trim()) {
      event.preventDefault();
      const newTag = input.toLowerCase();
      if (!hashtags.includes(newTag)) {
        onChange([...hashtags, newTag]);
      }
      setInput('');
    }
  };

  const handleDelete = (tagToDelete) => {
    onChange(hashtags.filter(tag => tag !== tagToDelete));
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Hashtags
      </Typography>
      
      <TextField
        fullWidth
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyPress}
        placeholder="Type and press Enter"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <TagIcon color="action" />
            </InputAdornment>
          ),
        }}
        helperText="Press Enter to add hashtag"
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {hashtags.map((tag) => (
          <Chip
            key={tag}
            label={`#${tag}`}
            onDelete={() => handleDelete(tag)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
};

export default HashtagInput;
