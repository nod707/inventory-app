import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Button,
  Divider,
  styled,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(20px)',
}));

const ToolbarSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const IPadToolbar = ({
  title,
  subtitle,
  leftItems = [],
  rightItems = [],
  showBackButton,
  onBack,
  showMenuButton,
  onMenuClick,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const theme = useTheme();

  return (
    <ToolbarContainer>
      {/* Left Section */}
      <ToolbarSection>
        {showMenuButton && (
          <IconButton
            onClick={onToggleSidebar}
            sx={{ color: theme.palette.grey[700] }}
          >
            {isSidebarCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}

        {showBackButton && (
          <Button
            startIcon={<ChevronLeftIcon />}
            onClick={onBack}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            Back
          </Button>
        )}

        {leftItems.map((item, index) => (
          <React.Fragment key={index}>
            {item}
          </React.Fragment>
        ))}
      </ToolbarSection>

      {/* Center Section - Title */}
      {(title || subtitle) && (
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontSize: 17,
                fontWeight: 600,
                color: theme.palette.grey[900],
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 13,
                color: theme.palette.grey[600],
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Right Section */}
      <ToolbarSection>
        {rightItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 1,
                  borderColor: theme.palette.grey[300],
                }}
              />
            )}
            {item}
          </React.Fragment>
        ))}
      </ToolbarSection>
    </ToolbarContainer>
  );
};

export default IPadToolbar;
