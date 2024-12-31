import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Tooltip,
  styled,
  alpha,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  padding: 0,
  marginBottom: 4,
  borderRadius: 8,
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
  '& .MuiListItemButton-root': {
    padding: '8px 12px',
    borderRadius: 8,
  },
  '& .MuiListItemIcon-root': {
    color: selected ? theme.palette.primary.main : theme.palette.grey[600],
    minWidth: 40,
  },
  '& .MuiListItemText-primary': {
    fontSize: 15,
    fontWeight: selected ? 600 : 400,
    color: selected ? theme.palette.primary.main : theme.palette.grey[900],
  },
  '&:hover': {
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.grey[500], 0.08),
  },
}));

const CollapsedListItem = styled(ListItem)(({ theme, selected }) => ({
  padding: 0,
  marginBottom: 4,
  '& .MuiListItemButton-root': {
    padding: '8px',
    borderRadius: '50%',
    width: 44,
    height: 44,
    margin: '0 auto',
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
  },
  '& .MuiListItemIcon-root': {
    color: selected ? theme.palette.primary.main : theme.palette.grey[600],
    minWidth: 'auto',
  },
  '&:hover .MuiListItemButton-root': {
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.grey[500], 0.08),
  },
}));

const IPadSidebar = ({
  items = [],
  isCollapsed = false,
  onItemClick,
  header,
  footer,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  if (isCollapsed) {
    return (
      <Box sx={{ py: 2, px: 1 }}>
        {header && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            {header({ isCollapsed })}
          </Box>
        )}

        <List sx={{ px: 0 }}>
          {items.map((item) => (
            <CollapsedListItem
              key={item.id}
              selected={location.pathname === item.path}
              disablePadding
            >
              <Tooltip title={item.label} placement="right">
                <ListItemButton
                  onClick={() => handleClick(item)}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </CollapsedListItem>
          ))}
        </List>

        {footer && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {footer({ isCollapsed })}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, px: 2 }}>
      {header && (
        <Box sx={{ mb: 2 }}>
          {header({ isCollapsed })}
        </Box>
      )}

      <List sx={{ px: 0 }}>
        {items.map((item) => (
          <StyledListItem
            key={item.id}
            selected={location.pathname === item.path}
            disablePadding
          >
            <ListItemButton
              onClick={() => handleClick(item)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                secondaryTypographyProps={{
                  sx: {
                    fontSize: 13,
                    color: 'grey.500',
                  },
                }}
              />
              {item.badge}
            </ListItemButton>
          </StyledListItem>
        ))}
      </List>

      {footer && (
        <Box sx={{ mt: 2 }}>
          {footer({ isCollapsed })}
        </Box>
      )}
    </Box>
  );
};

export default IPadSidebar;
