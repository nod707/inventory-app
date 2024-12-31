import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Box,
  styled,
  alpha,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import IPadPopover from './IPadPopover';

const StyledButtonGroup = styled(ButtonGroup)(({ theme, size = 'medium' }) => {
  const height = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  
  return {
    borderRadius: height / 2,
    overflow: 'hidden',
    boxShadow: 'none',
    '& .MuiButton-root': {
      borderRadius: 0,
      height: height,
      textTransform: 'none',
      fontSize: size === 'small' ? 13 : size === 'large' ? 16 : 14,
      fontWeight: 500,
      padding: size === 'small' ? '0 12px' : size === 'large' ? '0 24px' : '0 16px',
      '&:hover': {
        boxShadow: 'none',
      },
    },
    '& .MuiButton-contained': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.9),
      },
    },
    '& .MuiButton-outlined': {
      borderColor: theme.palette.grey[300],
      color: theme.palette.grey[900],
      '&:hover': {
        backgroundColor: alpha(theme.palette.grey[500], 0.08),
        borderColor: theme.palette.grey[400],
      },
    },
  };
});

const DropdownButton = styled(Button)(({ theme }) => ({
  minWidth: 'unset !important',
  padding: '0 8px !important',
  borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.3)} !important`,
  '&.MuiButton-outlined': {
    borderLeft: `1px solid ${theme.palette.grey[300]} !important`,
  },
}));

const IPadSplitButton = ({
  options = [],
  defaultOption,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  disabled,
  fullWidth,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState(defaultOption || options[0]);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (selectedOption && selectedOption.onClick) {
      selectedOption.onClick();
    }
  };

  const handleMenuOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    handleMenuClose();
    if (option && option.onClick) {
      option.onClick();
    }
  };

  return (
    <>
      <StyledButtonGroup
        variant={variant}
        color={color}
        size={size}
        fullWidth={fullWidth}
      >
        <Button
          onClick={handleClick}
          startIcon={startIcon}
          disabled={disabled}
          sx={{ flex: fullWidth ? 1 : 'unset' }}
        >
          {selectedOption?.label || ''}
        </Button>
        <DropdownButton
          onClick={handleMenuOpen}
          disabled={disabled}
        >
          <ArrowDropDownIcon />
        </DropdownButton>
      </StyledButtonGroup>

      <IPadPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        sections={[
          {
            items: options.map(option => ({
              ...option,
              onClick: () => handleOptionSelect(option),
              bold: selectedOption?.value === option.value,
            })),
          },
        ]}
      />
    </>
  );
};

export default IPadSplitButton;
