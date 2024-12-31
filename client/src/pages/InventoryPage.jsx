import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Badge,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  ContentCopy as DuplicateIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import IPadGridView from '../components/IPadGridView';
import IPadDetailView from '../components/IPadDetailView';
import IPadSplitButton from '../components/IPadSplitButton';
import IPadSegmentedControl from '../components/IOSSegmentedControl';
import { useKeyboardShortcuts } from '../utils/IPadKeyboardShortcuts';
import MeasurementsForm from '../components/MeasurementsForm';
import MultiMarketplaceSearch from '../components/MultiMarketplaceSearch';

const mockProducts = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    brand: 'Levi\'s',
    price: 129.99,
    image: 'https://example.com/jacket.jpg',
    status: 'active',
    measurements: {
      chest: 42,
      shoulders: 18,
      length: 26,
      sleeves: 24,
    },
  },
  // Add more mock products...
];

const InventoryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    newProduct: () => navigate('/inventory/new'),
    save: () => handleSave(),
    duplicate: () => handleDuplicate(),
    delete: () => handleDelete(),
    toggleGrid: () => setViewMode(prev => prev === 'grid' ? 'list' : 'grid'),
    toggleDetail: () => setIsDetailOpen(prev => !prev),
  });

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleSave = () => {
    // Save logic
  };

  const handleDuplicate = () => {
    // Duplicate logic
  };

  const handleDelete = () => {
    // Delete logic
  };

  return (
    <Box p={5}>
      <Stack spacing={4} sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Inventory</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/inventory/add')}
          >
            Add Product
          </Button>
        </Box>
        <MultiMarketplaceSearch />
        <Box sx={{ mb: 2 }}>
          <IPadSegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value)}
            segments={[
              { value: 'grid', label: 'Grid', icon: <GridIcon /> },
              { value: 'list', label: 'List', icon: <ListIcon /> },
            ]}
            size="small"
          />
        </Box>

        <IPadGridView
          items={mockProducts}
          renderItem={(product) => (
            <IPadGridView.Item highlighted={selectedProduct?.id === product.id}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                <Badge
                  color={product.status === 'active' ? 'success' : 'default'}
                  variant="dot"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="grey.600">
                  {product.brand}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${product.price}
                </Typography>
              </Box>
            </IPadGridView.Item>
          )}
          contextMenuItems={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              onClick: handleProductSelect,
            },
            {
              label: 'Share',
              icon: <ShareIcon />,
              onClick: () => {},
            },
            {
              label: 'Duplicate',
              icon: <DuplicateIcon />,
              onClick: handleDuplicate,
            },
            {
              label: 'Delete',
              icon: <DeleteIcon />,
              destructive: true,
              onClick: handleDelete,
            },
          ]}
          onItemClick={handleProductSelect}
        />

        <IPadDetailView
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={selectedProduct?.name}
          subtitle={`Brand: ${selectedProduct?.brand}`}
          actions={
            <IPadSplitButton
              options={[
                {
                  label: 'Save',
                  onClick: handleSave,
                },
                {
                  label: 'Save & Close',
                  onClick: () => {
                    handleSave();
                    setIsDetailOpen(false);
                  },
                },
              ]}
            />
          }
        >
          <IPadDetailView.Section title="Basic Information">
            <IPadDetailView.Field
              label="Product Name"
              value={selectedProduct?.name}
            />
            <IPadDetailView.Field
              label="Brand"
              value={selectedProduct?.brand}
            />
            <IPadDetailView.Field
              label="Price"
              value={`$${selectedProduct?.price}`}
            />
          </IPadDetailView.Section>

          <IPadDetailView.Section title="Measurements">
            <MeasurementsForm
              measurements={selectedProduct?.measurements}
              onMeasurementChange={(field, value) => {
                // Update measurements logic
              }}
            />
          </IPadDetailView.Section>
        </IPadDetailView>
      </Stack>
    </Box>
  );
};

export default InventoryPage;
