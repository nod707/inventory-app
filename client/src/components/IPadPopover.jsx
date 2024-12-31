import React from 'react';
import {
  Popover,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  styled,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    borderRadius: 12,
    minWidth: 200,
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, destructive }) => ({
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[500], 0.08),
  },
  '& .MuiListItemIcon-root': {
    minWidth: 36,
    color: destructive ? theme.palette.error.main : theme.palette.grey[700],
  },
  '& .MuiListItemText-primary': {
    fontSize: 15,
    color: destructive ? theme.palette.error.main : theme.palette.grey[900],
  },
  '& .MuiListItemText-secondary': {
    fontSize: 13,
    color: theme.palette.grey[600],
  },
}));

const PopoverSection = styled(Box)(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
}));

const IPadPopover = ({
  open,
  anchorEl,
  onClose,
  sections = [],
  title,
  transformOrigin,
  anchorOrigin,
}) => {
  return (
    <StyledPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin || {
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={transformOrigin || {
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          {title && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'grey.600',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </Typography>
            </Box>
          )}

          {sections.map((section, sectionIndex) => (
            <PopoverSection key={sectionIndex}>
              <List disablePadding>
                {section.items.map((item, itemIndex) => (
                  <StyledListItem
                    key={itemIndex}
                    onClick={() => {
                      item.onClick();
                      onClose();
                    }}
                    destructive={item.destructive}
                    button
                  >
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontWeight: item.bold ? 600 : 400,
                      }}
                    />
                  </StyledListItem>
                ))}
              </List>
            </PopoverSection>
          ))}
        </motion.div>
      </AnimatePresence>
    </StyledPopover>
  );
};

export default IPadPopover;
