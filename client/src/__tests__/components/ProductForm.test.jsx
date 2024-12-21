import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ProductForm from '../../components/Inventory/ProductForm';
import { mockProduct, mockFile } from '../utils/fixtures';
import { setupTensorFlowMocks } from '../utils/mockServices';
import { waitForLoadingToFinish } from '../utils/testHelpers';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => setupTensorFlowMocks());

describe('ProductForm Component', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit
  };

  const renderProductForm = (props = {}) => {
    return render(
      <ProductForm 
        {...defaultProps} 
        {...props} 
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders empty form in create mode', () => {
      renderProductForm();

      expect(screen.getByLabelText(/product name/i)).toHaveValue('');
      expect(screen.getByLabelText(/purchase price/i)).toHaveValue('');
      expect(screen.getByLabelText(/selling price/i)).toHaveValue('');
      expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
    });

    it('renders form with initial data in edit mode', () => {
      renderProductForm({ initialData: mockProduct });

      expect(screen.getByLabelText(/product name/i)).toHaveValue(mockProduct.name);
      expect(screen.getByLabelText(/purchase location/i)).toHaveValue(mockProduct.purchaseLocation);
      expect(screen.getByLabelText(/purchase price/i)).toHaveValue(mockProduct.purchasePrice.toString());
      expect(screen.getByLabelText(/selling location/i)).toHaveValue(mockProduct.sellingLocation);
      expect(screen.getByLabelText(/selling price/i)).toHaveValue(mockProduct.sellingPrice.toString());
    });

    it('displays existing hashtags in edit mode', () => {
      renderProductForm({ initialData: mockProduct });

      mockProduct.hashtags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('handles form submission with new product', async () => {
      renderProductForm();

      await userEvent.type(screen.getByLabelText(/product name/i), 'New Product');
      await userEvent.type(screen.getByLabelText(/purchase location/i), 'Store');
      await userEvent.type(screen.getByLabelText(/purchase price/i), '15.99');
      await userEvent.type(screen.getByLabelText(/selling location/i), 'Online');
      await userEvent.type(screen.getByLabelText(/selling price/i), '25.99');

      fireEvent.click(screen.getByRole('button', { name: /add product/i }));

      await waitForLoadingToFinish();

      const formData = mockOnSubmit.mock.calls[0][0];
      expect(formData.get('name')).toBe('New Product');
      expect(formData.get('purchasePrice')).toBe('15.99');
      expect(formData.get('sellingPrice')).toBe('25.99');
    });

    it('validates required fields', async () => {
      renderProductForm();

      fireEvent.click(screen.getByRole('button', { name: /add product/i }));

      await waitFor(() => {
        expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/purchase price is required/i)).toBeInTheDocument();
        expect(screen.getByText(/selling price is required/i)).toBeInTheDocument();
      });
    });

    it('validates numeric fields', async () => {
      renderProductForm();

      await userEvent.type(screen.getByLabelText(/purchase price/i), 'invalid');
      await userEvent.type(screen.getByLabelText(/selling price/i), 'invalid');

      fireEvent.click(screen.getByRole('button', { name: /add product/i }));

      await waitFor(() => {
        expect(screen.getByText(/purchase price must be a number/i)).toBeInTheDocument();
        expect(screen.getByText(/selling price must be a number/i)).toBeInTheDocument();
      });
    });
  });

  describe('Hashtag Management', () => {
    it('adds and removes hashtags', async () => {
      renderProductForm();

      const hashtagInput = screen.getByLabelText(/add hashtag/i);
      await userEvent.type(hashtagInput, 'newtag');
      fireEvent.click(screen.getByRole('button', { name: /add/i }));

      expect(screen.getByText('newtag')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/remove newtag/i));
      expect(screen.queryByText('newtag')).not.toBeInTheDocument();
    });

    it('prevents duplicate hashtags', async () => {
      renderProductForm();

      const hashtagInput = screen.getByLabelText(/add hashtag/i);
      await userEvent.type(hashtagInput, 'tag');
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
      
      await userEvent.type(hashtagInput, 'tag');
      fireEvent.click(screen.getByRole('button', { name: /add/i }));

      const tags = screen.getAllByText('tag');
      expect(tags).toHaveLength(1);
    });
  });

  describe('Image Handling', () => {
    it('processes image upload and detects dimensions', async () => {
      renderProductForm();

      const input = screen.getByLabelText(/upload image/i);
      await userEvent.upload(input, mockFile);

      await waitFor(() => {
        expect(screen.getByText(/dimensions detected/i)).toBeInTheDocument();
      });
    });

    it('displays error for invalid image upload', async () => {
      renderProductForm();

      const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/upload image/i);
      
      await userEvent.upload(input, invalidFile);

      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });
    });
  });
});
