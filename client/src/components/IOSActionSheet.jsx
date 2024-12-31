import React from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
  IconButton,
  styled,
  Slide,
} from '@mui/material';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    position: 'fixed',
    bottom: 0,
    margin: 0,
    width: '100%',
    maxWidth: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '85vh',
    backgroundColor: 'rgba(250, 250, 250, 0.92)',
    backdropFilter: 'blur(20px)',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
}));

const ActionButton = styled(Button)(({ theme, destructive }) => ({
  width: '100%',
  justifyContent: 'center',
  padding: '16px',
  fontSize: '20px',
  fontWeight: 400,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  color: destructive ? theme.palette.error.main : theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  width: '100%',
  justifyContent: 'center',
  padding: '16px',
  fontSize: '20px',
  fontWeight: 600,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const IOSActionSheet = ({
  open,
  onClose,
  title,
  message,
  actions = [],
  cancelLabel = 'Cancel',
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
    >
      <DialogContent sx={{ p: 2 }}>
        {(title || message) && (
          <Box sx={{ px: 2, pb: 2, textAlign: 'center' }}>
            {title && (
              <Typography
                variant="h6"
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'grey.500',
                  mb: message ? 1 : 0,
                }}
              >
                {title}
              </Typography>
            )}
            {message && (
              <Typography
                variant="body1"
                sx={{
                  fontSize: '13px',
                  color: 'grey.500',
                }}
              >
                {message}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {actions.map((action, index) => (
            <ActionButton
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              destructive={action.destructive}
            >
              {action.label}
            </ActionButton>
          ))}
          
          <Box sx={{ pt: 1 }}>
            <CancelButton onClick={onClose}>
              {cancelLabel}
            </CancelButton>
          </Box>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default IOSActionSheet;
