import React from 'react';
import {
  Box,
  Typography,
  Paper,
  styled,
  Switch as MuiSwitch,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const FormContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: 10,
  overflow: 'hidden',
  boxShadow: 'none',
}));

const FormItem = styled(Box)(({ theme, interactive }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '11px 16px',
  minHeight: 44,
  cursor: interactive ? 'pointer' : 'default',
  backgroundColor: theme.palette.common.white,
  '&:not(:last-child)': {
    borderBottom: `0.5px solid ${theme.palette.grey[200]}`,
  },
  '&:active': interactive ? {
    backgroundColor: theme.palette.grey[100],
  } : {},
}));

const IOSSwitch = styled(MuiSwitch)(({ theme }) => ({
  width: 51,
  height: 31,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 1,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.success.main,
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 27,
    height: 27,
    boxShadow: '0 2px 4px 0 rgba(0, 35, 11, 0.2)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 31 / 2,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

const IOSFormGroup = ({
  title,
  footer,
  children,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '13px',
            fontWeight: 400,
            color: 'grey.600',
            px: 2,
            pb: 1,
            display: 'block',
          }}
        >
          {title}
        </Typography>
      )}
      
      <FormContainer>
        {children}
      </FormContainer>

      {footer && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '13px',
            fontWeight: 400,
            color: 'grey.500',
            px: 2,
            pt: 1,
            display: 'block',
          }}
        >
          {footer}
        </Typography>
      )}
    </Box>
  );
};

// Sub-components
IOSFormGroup.Item = function FormGroupItem({
  label,
  value,
  onClick,
  children,
  showArrow = false,
}) {
  return (
    <FormItem interactive={!!onClick} onClick={onClick}>
      <Typography
        sx={{
          flex: 1,
          fontSize: '17px',
          color: 'grey.900',
        }}
      >
        {label}
      </Typography>
      
      {children || (
        <>
          {value && (
            <Typography
              sx={{
                mr: showArrow ? 1 : 0,
                fontSize: '17px',
                color: 'grey.500',
              }}
            >
              {value}
            </Typography>
          )}
          {showArrow && (
            <ChevronRightIcon sx={{ color: 'grey.400' }} />
          )}
        </>
      )}
    </FormItem>
  );
};

IOSFormGroup.Switch = function FormGroupSwitch({
  label,
  checked,
  onChange,
  disabled,
}) {
  return (
    <FormItem>
      <Typography
        sx={{
          flex: 1,
          fontSize: '17px',
          color: disabled ? 'grey.400' : 'grey.900',
        }}
      >
        {label}
      </Typography>
      <IOSSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </FormItem>
  );
};

export default IOSFormGroup;
