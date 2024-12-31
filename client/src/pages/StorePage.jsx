import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Rating,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  ShoppingBag as OrderIcon,
  Message as MessageIcon,
  LocalShipping as ShippingIcon,
  Favorite as HeartIcon,
  FavoriteBorder as HeartOutlineIcon,
} from '@mui/icons-material';
import IPadGridView from '../components/IPadGridView';
import IPadDetailView from '../components/IPadDetailView';
import IPadSplitButton from '../components/IPadSplitButton';
import { useKeyboardShortcuts } from '../utils/IPadKeyboardShortcuts';

const mockOrders = [
  {
    id: 1,
    customer: {
      name: 'Sarah Johnson',
      avatar: 'https://example.com/avatar1.jpg',
      rating: 4.5,
    },
    product: {
      name: 'Vintage Denim Jacket',
      price: 129.99,
      image: 'https://example.com/jacket.jpg',
    },
    status: 'pending',
    date: '2024-12-26T10:30:00Z',
    shipping: {
      method: 'Standard',
      address: '123 Main St, San Francisco, CA 94105',
      tracking: 'US123456789',
    },
  },
  // Add more mock orders...
];

const StorePage = () => {
  const theme = useTheme();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [favoriteOrders, setFavoriteOrders] = useState(new Set());

  // Keyboard shortcuts
  useKeyboardShortcuts({
    toggleDetail: () => setIsDetailOpen(prev => !prev),
  });

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const toggleFavorite = (orderId) => {
    setFavoriteOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'shipped':
        return theme.palette.info.main;
      case 'delivered':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <IPadGridView
        items={mockOrders}
        renderItem={(order) => (
          <IPadGridView.Item highlighted={selectedOrder?.id === order.id}>
            <Box sx={{ p: 2 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={order.customer.avatar}
                  alt={order.customer.name}
                  sx={{ width: 40, height: 40, mr: 1.5 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">
                    {order.customer.name}
                  </Typography>
                  <Rating
                    value={order.customer.rating}
                    size="small"
                    readOnly
                    precision={0.5}
                  />
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(order.id);
                  }}
                  sx={{ color: favoriteOrders.has(order.id) ? 'error.main' : 'grey.400' }}
                >
                  {favoriteOrders.has(order.id) ? <HeartIcon /> : <HeartOutlineIcon />}
                </IconButton>
              </Box>

              {/* Product */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <img
                  src={order.product.image}
                  alt={order.product.name}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
                <Box>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    {order.product.name}
                  </Typography>
                  <Typography variant="h6">
                    ${order.product.price}
                  </Typography>
                </Box>
              </Box>

              {/* Footer */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  label={order.status}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getStatusColor(order.status), 0.1),
                    color: getStatusColor(order.status),
                    fontWeight: 500,
                  }}
                />
                <Typography variant="caption" color="grey.600">
                  {new Date(order.date).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </IPadGridView.Item>
        )}
        contextMenuItems={[
          {
            label: 'View Details',
            icon: <OrderIcon />,
            onClick: handleOrderSelect,
          },
          {
            label: 'Message Customer',
            icon: <MessageIcon />,
            onClick: () => {},
          },
          {
            label: 'Edit Order',
            icon: <EditIcon />,
            onClick: () => {},
          },
        ]}
        onItemClick={handleOrderSelect}
      />

      {/* Order Detail View */}
      <IPadDetailView
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Order Details"
        subtitle={`Order #${selectedOrder?.id}`}
        actions={
          <IPadSplitButton
            options={[
              {
                label: 'Message Customer',
                onClick: () => {},
                icon: <MessageIcon />,
              },
              {
                label: 'Update Shipping',
                onClick: () => {},
                icon: <ShippingIcon />,
              },
            ]}
          />
        }
      >
        <IPadDetailView.Section title="Customer">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={selectedOrder?.customer.avatar}
              alt={selectedOrder?.customer.name}
              sx={{ width: 48, height: 48, mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle1">
                {selectedOrder?.customer.name}
              </Typography>
              <Rating
                value={selectedOrder?.customer.rating}
                readOnly
                precision={0.5}
              />
            </Box>
          </Box>
        </IPadDetailView.Section>

        <IPadDetailView.Section title="Product">
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <img
              src={selectedOrder?.product.image}
              alt={selectedOrder?.product.name}
              style={{
                width: 120,
                height: 120,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
            <Box>
              <Typography variant="h6">
                {selectedOrder?.product.name}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                ${selectedOrder?.product.price}
              </Typography>
            </Box>
          </Box>
        </IPadDetailView.Section>

        <IPadDetailView.Section title="Shipping">
          <IPadDetailView.Field
            label="Method"
            value={selectedOrder?.shipping.method}
          />
          <IPadDetailView.Field
            label="Address"
            value={selectedOrder?.shipping.address}
          />
          <IPadDetailView.Field
            label="Tracking Number"
            value={selectedOrder?.shipping.tracking}
          />
        </IPadDetailView.Section>
      </IPadDetailView>
    </Box>
  );
};

export default StorePage;
