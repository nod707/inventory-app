import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_WIDTH = 280;

const MenuContainer = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.modal,
  display: 'inline-block',
  pointerEvents: 'auto',
}));

const MenuPaper = styled(Paper)(({ theme }) => ({
  width: MENU_WIDTH,
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(20px)',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
}));

const Section = styled(Box)(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
}));

const MenuItem = styled(ListItem)(({ theme, destructive }) => ({
  padding: '10px 16px',
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

const Backdrop = styled(motion.div)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  touchAction: 'none',
  WebkitTapHighlightColor: 'transparent',
});

const useContextMenu = () => {
  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX,
            mouseY: event.clientY,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return { contextMenu, handleContextMenu, handleClose };
};

const IPadContextMenu = ({
  open,
  position,
  onClose,
  sections = [],
  title,
}) => {
  const containerRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, onClose]);

  // Calculate position to keep menu in viewport
  const getMenuPosition = () => {
    if (!position) return { top: 0, left: 0 };

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let { mouseX, mouseY } = position;

    // Check right edge
    if (mouseX + MENU_WIDTH > viewport.width) {
      mouseX = mouseX - MENU_WIDTH;
    }

    // Check bottom edge
    const estimatedHeight = sections.reduce((acc, section) => 
      acc + (section.items.length * 44) + 1, 0); // 44px per item + 1px border

    if (mouseY + estimatedHeight > viewport.height) {
      mouseY = mouseY - estimatedHeight;
    }

    return {
      top: mouseY,
      left: mouseX,
    };
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <MenuContainer
            ref={containerRef}
            style={getMenuPosition()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          >
            <MenuPaper elevation={0}>
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
                <Section key={sectionIndex}>
                  <List disablePadding>
                    {section.items.map((item, itemIndex) => (
                      <MenuItem
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
                      </MenuItem>
                    ))}
                  </List>
                </Section>
              ))}
            </MenuPaper>
          </MenuContainer>
        </>
      )}
    </AnimatePresence>
  );
};

IPadContextMenu.useContextMenu = useContextMenu;

export default IPadContextMenu;
