import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  styled,
  useTheme,
  useScrollTrigger,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid',
  borderColor: theme.palette.grey[200],
  boxShadow: 'none',
}));

const IOSNavBar = ({
  title,
  showBack,
  onBack,
  showAdd,
  onAdd,
  showMenu,
  onMenu,
  rightComponent,
}) => {
  const theme = useTheme();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <>
      <StyledAppBar
        position="fixed"
        elevation={trigger ? 1 : 0}
        sx={{
          backgroundColor: trigger
            ? 'rgba(255, 255, 255, 0.72)'
            : 'rgba(255, 255, 255, 0.92)',
        }}
      >
        <Toolbar>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: '44px', // iOS navbar height
            }}
          >
            {/* Left side */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {showBack && (
                <IconButton
                  edge="start"
                  onClick={onBack}
                  sx={{
                    color: theme.palette.primary.main,
                    mr: 1,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <ArrowBackIcon />
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.primary.main,
                      ml: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    Back
                  </Typography>
                </IconButton>
              )}
              {showMenu && (
                <IconButton
                  edge="start"
                  onClick={onMenu}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

            {/* Center title */}
            <Typography
              variant="h3"
              component="h1"
              sx={{
                flex: 2,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '17px',
                color: theme.palette.grey[900],
              }}
            >
              {title}
            </Typography>

            {/* Right side */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flex: 1,
              }}
            >
              {showAdd && (
                <IconButton
                  edge="end"
                  onClick={onAdd}
                  sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              )}
              {rightComponent}
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Toolbar /> {/* Spacer */}
    </>
  );
};

export default IOSNavBar;
