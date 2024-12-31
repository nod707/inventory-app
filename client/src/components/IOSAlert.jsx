import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  styled,
  Zoom,
} from '@mui/material';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 14,
    padding: 0,
    margin: 20,
    backgroundColor: 'rgba(250, 250, 250, 0.92)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)',
  },
  '& .MuiDialogTitle-root': {
    textAlign: 'center',
    padding: '16px 16px 0',
  },
  '& .MuiDialogContent-root': {
    textAlign: 'center',
    padding: '16px',
    paddingTop: 0,
  },
  '& .MuiDialogActions-root': {
    padding: 0,
    borderTop: `0.5px solid ${theme.palette.grey[300]}`,
    display: 'flex',
    flexDirection: 'row',
  },
}));

const AlertButton = styled(Button)(({ theme, destructive, bold }) => ({
  flex: 1,
  padding: '12px 16px',
  fontSize: '17px',
  fontWeight: bold ? 600 : 400,
  color: destructive ? theme.palette.error.main : theme.palette.primary.main,
  borderRadius: 0,
  borderLeft: `0.5px solid ${theme.palette.grey[300]}`,
  '&:first-of-type': {
    borderLeft: 'none',
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const IOSAlert = ({
  open,
  onClose,
  title,
  message,
  actions = [],
  vertical = false,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
    >
      {title && (
        <DialogTitle>
          <Typography
            variant="h6"
            sx={{
              fontSize: '17px',
              fontWeight: 600,
              color: 'grey.900',
            }}
          >
            {title}
          </Typography>
        </DialogTitle>
      )}
      
      {message && (
        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              fontSize: '13px',
              color: 'grey.600',
            }}
          >
            {message}
          </Typography>
        </DialogContent>
      )}

      <DialogActions
        sx={{
          flexDirection: vertical ? 'column' : 'row',
          '& > button': {
            borderLeft: vertical ? 'none' : undefined,
            borderTop: vertical ? `0.5px solid ${theme => theme.palette.grey[300]}` : undefined,
          },
        }}
      >
        {actions.map((action, index) => (
          <AlertButton
            key={index}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            destructive={action.destructive}
            bold={action.bold}
            fullWidth={vertical}
          >
            {action.label}
          </AlertButton>
        ))}
      </DialogActions>
    </StyledDialog>
  );
};

export default IOSAlert;
