import React from 'react';
import {
  Dialog,
  IconButton,
  Typography,
  Box,
  styled,
  useTheme,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
    maxHeight: '95vh',
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 4px',
  borderBottom: `0.5px solid ${theme.palette.grey[200]}`,
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(20px)',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));

const DragHandle = styled(Box)(({ theme }) => ({
  width: 36,
  height: 5,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 2.5,
  margin: '8px auto',
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const IOSModal = ({
  open,
  onClose,
  title,
  children,
  showDragHandle = true,
  leftButton = null,
  rightButton = null,
}) => {
  const theme = useTheme();

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth="sm"
    >
      {showDragHandle && <DragHandle />}
      
      <Header>
        <Box sx={{ width: 40, pl: 1 }}>
          {leftButton}
        </Box>

        <Typography
          variant="h6"
          sx={{
            flex: 1,
            textAlign: 'center',
            fontSize: '17px',
            fontWeight: 600,
            color: theme.palette.grey[900],
          }}
        >
          {title}
        </Typography>

        <Box sx={{ width: 40, pr: 1 }}>
          {rightButton || (
            <IconButton
              edge="end"
              onClick={onClose}
              sx={{ color: theme.palette.grey[600] }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Header>

      <Box
        sx={{
          height: '100%',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </Box>
    </StyledDialog>
  );
};

export default IOSModal;
