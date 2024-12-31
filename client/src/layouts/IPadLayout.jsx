import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  Store as StoreIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import IPadSplitView from '../components/IPadSplitView';
import IPadSidebar from '../components/IPadSidebar';
import IPadToolbar from '../components/IPadToolbar';
import IPadSearchBar from '../components/IOSSearchBar';
import IPadSplitButton from '../components/IPadSplitButton';
import IPadPopover from '../components/IPadPopover';

const navigationItems = [
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <InventoryIcon />,
    path: '/inventory',
    description: 'Manage your products',
  },
  {
    id: 'store',
    label: 'Store',
    icon: <StoreIcon />,
    path: '/store',
    description: 'View your store front',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <StatsIcon />,
    path: '/analytics',
    description: 'View sales and metrics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    description: 'App preferences',
  },
];

const IPadLayout = ({ children }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Reset sidebar state on screen size change
  useEffect(() => {
    if (!isLargeScreen) {
      setIsSidebarCollapsed(false);
    }
  }, [isLargeScreen]);

  const getCurrentSection = () => {
    const path = location.pathname.split('/')[1];
    return navigationItems.find(item => item.path.includes(path)) || navigationItems[0];
  };

  const handleAddProduct = () => {
    navigate('/inventory/add');
  };

  const renderMainToolbar = ({ isSidebarCollapsed }) => (
    <IPadToolbar
      title={getCurrentSection().label}
      showMenuButton={!isLargeScreen}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      rightItems={[
        <IPadSplitButton
          key="add-button"
          defaultOption={{
            label: 'Add Product',
            value: 'product',
            onClick: handleAddProduct,
          }}
          options={[
            {
              label: 'Add Product',
              value: 'product',
              onClick: handleAddProduct,
            },
            {
              label: 'Import Products',
              value: 'import',
              onClick: () => {},
            },
            {
              label: 'Add Category',
              value: 'category',
              onClick: () => {},
            },
          ]}
          startIcon={<AddIcon />}
        />,
      ]}
    />
  );

  const renderMainContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search and Filter Bar */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          gap: 2,
          borderBottom: 1,
          borderColor: 'grey.200',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <IPadSearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search inventory..."
          />
        </Box>
        <IPadSplitButton
          variant="outlined"
          options={[
            { label: 'Date Added', value: 'date', onClick: () => {} },
            { label: 'Name', value: 'name', onClick: () => {} },
            { label: 'Price', value: 'price', onClick: () => {} },
          ]}
          defaultOption={{ label: 'Sort', value: 'date', onClick: () => {} }}
          startIcon={<SortIcon />}
        />
        <IPadSplitButton
          variant="outlined"
          options={[
            { label: 'All Products', value: 'all', onClick: () => {} },
            { label: 'In Stock', value: 'inStock', onClick: () => {} },
            { label: 'Out of Stock', value: 'outOfStock', onClick: () => {} },
          ]}
          defaultOption={{ label: 'Filter', value: 'all', onClick: () => {} }}
          startIcon={<FilterIcon />}
        />
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: theme.palette.grey[100],
        }}
      >
        {children}
      </Box>
    </Box>
  );

  return (
    <IPadSplitView
      sidebarContent={
        <IPadSidebar
          items={navigationItems}
          isCollapsed={isSidebarCollapsed}
          onItemClick={(item) => navigate(item.path)}
          header={({ isCollapsed }) => (
            <Box
              sx={{
                textAlign: isCollapsed ? 'center' : 'left',
                px: isCollapsed ? 0 : 2,
              }}
            >
              {isCollapsed ? 'PD' : 'Posher Dashboard'}
            </Box>
          )}
        />
      }
      mainContent={renderMainContent()}
      sidebarToolbar={({ isCollapsed }) => (
        <IPadToolbar
          title={isCollapsed ? '' : 'Inventory'}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isCollapsed)}
        />
      )}
      mainToolbar={renderMainToolbar}
      collapsible
      defaultCollapsed={false}
    />
  );
};

export default IPadLayout;
