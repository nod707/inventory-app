import React from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  styled,
  Badge,
} from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  Store as StoreIcon,
  Assessment as StatsIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid',
  borderColor: theme.palette.grey[200],
  height: '83px', // iOS tab bar height
  paddingBottom: '20px', // Safe area padding
}));

const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  color: theme.palette.grey[600],
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '& .MuiBottomNavigationAction-label': {
    fontSize: '11px',
    '&.Mui-selected': {
      fontSize: '11px',
    },
  },
}));

const IOSTabBar = ({ value, onChange, notifications = {} }) => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: 'none',
      }}
      elevation={0}
    >
      <StyledBottomNavigation
        value={value}
        onChange={(event, newValue) => {
          onChange(newValue);
        }}
        showLabels
      >
        <StyledBottomNavigationAction
          label="Inventory"
          icon={
            <Badge badgeContent={notifications.inventory} color="error">
              <InventoryIcon />
            </Badge>
          }
        />
        <StyledBottomNavigationAction
          label="Store"
          icon={
            <Badge badgeContent={notifications.store} color="error">
              <StoreIcon />
            </Badge>
          }
        />
        <StyledBottomNavigationAction
          label="Stats"
          icon={
            <Badge badgeContent={notifications.stats} color="error">
              <StatsIcon />
            </Badge>
          }
        />
        <StyledBottomNavigationAction
          label="Profile"
          icon={
            <Badge badgeContent={notifications.profile} color="error">
              <ProfileIcon />
            </Badge>
          }
        />
      </StyledBottomNavigation>
    </Paper>
  );
};

export default IOSTabBar;
