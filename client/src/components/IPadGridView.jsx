import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import IPadContextMenu from './IPadContextMenu';

const MotionGrid = motion(Grid);

const IPadGridView = ({
  items = [],
  renderItem,
  loading = false,
  emptyMessage = 'No items to display',
  contextMenuItems = [],
  onItemClick,
  gridProps = {},
  itemProps = {},
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));

  const getGridCols = () => {
    if (isLargeScreen) return 4;
    if (isMediumScreen) return 3;
    return 2;
  };

  const { contextMenu, handleContextMenu, handleClose } = IPadContextMenu.useContextMenu();

  if (loading) {
    return (
      <Grid container spacing={2} {...gridProps}>
        {[...Array(8)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index} {...itemProps}>
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
            <Box sx={{ pt: 1 }}>
              <Skeleton width="60%" height={24} />
              <Skeleton width="40%" height={20} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'grey.600',
            textAlign: 'center',
            mb: 2,
          }}
        >
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2} {...gridProps}>
        <AnimatePresence>
          {items.map((item, index) => (
            <MotionGrid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={item.id}
              {...itemProps}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
              }}
              onContextMenu={(e) => {
                if (contextMenuItems.length > 0) {
                  e.preventDefault();
                  handleContextMenu(e, item);
                }
              }}
              onClick={() => onItemClick?.(item)}
              sx={{
                cursor: onItemClick ? 'pointer' : 'default',
                '&:active': onItemClick ? {
                  transform: 'scale(0.98)',
                } : {},
              }}
            >
              {renderItem(item)}
            </MotionGrid>
          ))}
        </AnimatePresence>
      </Grid>

      {contextMenuItems.length > 0 && (
        <IPadContextMenu
          open={contextMenu !== null}
          position={contextMenu}
          onClose={handleClose}
          sections={[
            {
              items: contextMenuItems.map(menuItem => ({
                ...menuItem,
                onClick: () => {
                  menuItem.onClick(contextMenu?.item);
                  handleClose();
                },
              })),
            },
          ]}
        />
      )}
    </>
  );
};

// Optional GridItem component for consistent styling
IPadGridView.Item = function GridItem({ children, highlighted, ...props }) {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s',
        border: 1,
        borderColor: highlighted ? 'primary.main' : 'grey.200',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default IPadGridView;
