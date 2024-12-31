import React, { useState, useEffect } from 'react';
import { Box, Paper, useTheme, useMediaQuery, styled } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_WIDTH = 320;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const TOOLBAR_HEIGHT = 50;

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[100],
}));

const Sidebar = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.grey[200]}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 2,
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
}));

const IPadSplitView = ({
  sidebarContent,
  mainContent,
  sidebarToolbar,
  mainToolbar,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);

  // Reset collapse state when screen size changes
  useEffect(() => {
    if (!isLargeScreen) {
      setIsSidebarCollapsed(false);
    }
  }, [isLargeScreen]);

  const sidebarWidth = isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Container>
      {/* Sidebar */}
      <Sidebar
        elevation={0}
        component={motion.div}
        animate={{ width: sidebarWidth }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 40,
        }}
        sx={{
          display: { xs: 'none', md: 'flex' },
        }}
      >
        {/* Sidebar Toolbar */}
        {sidebarToolbar && (
          <Box
            sx={{
              height: TOOLBAR_HEIGHT,
              borderBottom: `1px solid ${theme.palette.grey[200]}`,
              display: 'flex',
              alignItems: 'center',
              px: 2,
            }}
          >
            {sidebarToolbar({
              isCollapsed: isSidebarCollapsed,
              onToggleCollapse: () => collapsible && setIsSidebarCollapsed(!isSidebarCollapsed),
            })}
          </Box>
        )}

        {/* Sidebar Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {typeof sidebarContent === 'function'
            ? sidebarContent({
                isCollapsed: isSidebarCollapsed,
                onToggleCollapse: () => collapsible && setIsSidebarCollapsed(!isSidebarCollapsed),
              })
            : sidebarContent}
        </Box>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        {/* Main Toolbar */}
        {mainToolbar && (
          <Box
            sx={{
              height: TOOLBAR_HEIGHT,
              borderBottom: `1px solid ${theme.palette.grey[200]}`,
              display: 'flex',
              alignItems: 'center',
              px: 2,
              backgroundColor: 'background.paper',
            }}
          >
            {mainToolbar({
              isSidebarCollapsed,
              onToggleSidebar: () => collapsible && setIsSidebarCollapsed(!isSidebarCollapsed),
            })}
          </Box>
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {typeof mainContent === 'function'
            ? mainContent({
                isSidebarCollapsed,
                onToggleSidebar: () => collapsible && setIsSidebarCollapsed(!isSidebarCollapsed),
              })
            : mainContent}
        </Box>
      </MainContent>
    </Container>
  );
};

export default IPadSplitView;
