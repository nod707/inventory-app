import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../components/Dashboard/Dashboard';
import { api } from '../../services/api';

// Mock API calls
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  }
}));

describe('Dashboard Component', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Product 1',
      purchasePrice: 10.99,
      sellingPrice: 20.99,
      purchaseLocation: 'Store 1',
      sellingLocation: 'Online',
      dimensions: [10, 20, 30],
      purchaseDate: '2024-01-01',
      hashtags: ['test1']
    },
    {
      _id: '2',
      name: 'Product 2',
      purchasePrice: 15.99,
      sellingPrice: 25.99,
      purchaseLocation: 'Store 2',
      sellingLocation: 'Online',
      dimensions: [15, 25, 35],
      purchaseDate: '2024-01-02',
      hashtags: ['test2']
    }
  ];

  beforeEach(() => {
    api.get.mockResolvedValue({ data: mockProducts });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with products', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('calculates and displays total profit correctly', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      const totalProfit = mockProducts.reduce((acc, product) => 
        acc + (product.sellingPrice - product.purchasePrice), 0
      );
      expect(screen.getByText(`Total Profit: $${totalProfit.toFixed(2)}`)).toBeInTheDocument();
    });
  });

  it('handles product deletion', async () => {
    api.delete.mockResolvedValueOnce({ data: { message: 'Product deleted' } });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByLabelText(/delete/i)[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/products/1');
    });
  });

  it('handles search functionality', async () => {
    render(<Dashboard />);

    const searchInput = screen.getByPlaceholderText(/search products/i);
    await userEvent.type(searchInput, 'Product 1');

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
    });
  });

  it('handles filter by date range', async () => {
    render(<Dashboard />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await userEvent.type(startDateInput, '2024-01-01');
    await userEvent.type(endDateInput, '2024-01-01');

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
    });
  });
});
