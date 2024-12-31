import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  styled,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: 10,
    fontSize: 17,
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
      boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    '&::placeholder': {
      color: theme.palette.grey[500],
      opacity: 1,
    },
  },
  '& .MuiInputAdornment-root': {
    marginRight: 8,
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 400,
  color: theme.palette.grey[600],
  marginBottom: 6,
}));

const Helper = styled(Typography)(({ theme, error }) => ({
  fontSize: 13,
  fontWeight: 400,
  color: error ? theme.palette.error.main : theme.palette.grey[500],
  marginTop: 6,
}));

const IOSTextField = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  clearable = true,
  type = 'text',
  multiline = false,
  rows,
  startAdornment,
  endAdornment,
  ...props
}) => {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <Box>
      {label && <Label>{label}</Label>}
      
      <StyledTextField
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        multiline={multiline}
        rows={rows}
        error={error}
        InputProps={{
          startAdornment: startAdornment && (
            <InputAdornment position="start">
              {startAdornment}
            </InputAdornment>
          ),
          endAdornment: (
            <>
              {clearable && value && (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={handleClear}
                    size="small"
                    sx={{ color: 'grey.500' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )}
              {endAdornment}
            </>
          ),
        }}
        {...props}
      />

      {helperText && (
        <Helper error={error}>{helperText}</Helper>
      )}
    </Box>
  );
};

export default IOSTextField;
