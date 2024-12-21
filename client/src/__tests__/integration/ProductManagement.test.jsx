import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { api } from '../../services/api';

jest.mock('../../services/api');

describe('Product Management Integration', () => {
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    username: 'testuser'
  };

  const mockProduct = {
    _id: 'product123',
    name: 'Test Product',
    purchasePrice: 10.99,
    sellingPrice: 20.99,
    purchaseLocation: 'Test Store',
    sellingLocation: 'Online Store',
    dimensions: [10, 20, 30],
    purchaseDate: '2024-01-01',
    hashtags: ['test']
  };

  beforeEach(() => {
    // Mock successful login
    api.post.mockImplementation((url) => {
      if (url === '/auth/login') {
        return Promise.resolve({ data: { user: mockUser, token: 'mock-token' } });
      }
      return Promise.resolve({ data: mockProduct });
    });

    // Mock product fetching
    api.get.mockImplementation((url) => {
      if (url === '/products') {
        return Promise.resolve({ data: [mockProduct] });
      }
      return Promise.resolve({ data: {} });
    });

    // Clear localStorage
    localStorage.clear();
  });

  it('completes full product management flow', async () => {
    render(<App />);

    // Login
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    // Add new product
    fireEvent.click(screen.getByRole('button', { name: /add product/i }));

    await userEvent.type(screen.getByLabelText(/product name/i), 'New Product');
    await userEvent.type(screen.getByLabelText(/purchase price/i), '15.99');
    await userEvent.type(screen.getByLabelText(/selling price/i), '25.99');

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/upload image/i);
    await userEvent.upload(fileInput, file);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Verify product appears in list
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });

    // Edit product
    fireEvent.click(screen.getByLabelText(/edit/i));
    await userEvent.clear(screen.getByLabelText(/product name/i));
    await userEvent.type(screen.getByLabelText(/product name/i), 'Updated Product');
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Verify updated product
    await waitFor(() => {
      expect(screen.getByText('Updated Product')).toBeInTheDocument();
    });

    // Delete product
    fireEvent.click(screen.getByLabelText(/delete/i));

    // Verify product removed
    await waitFor(() => {
      expect(screen.queryByText('Updated Product')).not.toBeInTheDocument();
    });
  });

  it('handles error states correctly', async () => {
    // Mock API errors
    api.post.mockRejectedValueOnce({ 
      response: { data: { message: 'Invalid credentials' } }
    });

    render(<App />);

    // Attempt login with invalid credentials
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Mock successful login but failed product creation
    api.post
      .mockResolvedValueOnce({ data: { user: mockUser, token: 'mock-token' } })
      .mockRejectedValueOnce({ 
        response: { data: { message: 'Error creating product' } }
      });

    // Login successfully
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Attempt to create product
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
    });

    await userEvent.type(screen.getByLabelText(/product name/i), 'Failed Product');
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('Error creating product')).toBeInTheDocument();
    });
  });
});
