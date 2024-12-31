import React from 'react';
import {
  InputBase,
  IconButton,
  Paper,
  Box,
  styled,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const StyledSearchInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '8px 0',
    fontSize: '17px',
    width: '100%',
    color: theme.palette.grey[900],
    '&::placeholder': {
      color: theme.palette.grey[500],
      opacity: 1,
    },
  },
}));

const IOSSearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search',
  autoFocus = false,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        backgroundColor: theme.palette.grey[200],
        borderRadius: '10px',
        border: 'none',
      }}
    >
      <SearchIcon
        sx={{
          color: theme.palette.grey[500],
          mr: 1,
          fontSize: 20,
        }}
      />
      <StyledSearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <IconButton
          size="small"
          onClick={onClear}
          sx={{
            color: theme.palette.grey[500],
            p: 0.5,
            '&:hover': {
              backgroundColor: 'transparent',
              color: theme.palette.grey[700],
            },
          }}
        >
          <ClearIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}
    </Paper>
  );
};

export default IOSSearchBar;
