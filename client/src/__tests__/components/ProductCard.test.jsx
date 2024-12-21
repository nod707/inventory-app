import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import ProductCard from '../../components/Inventory/ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '123',
    name: 'Test Product',
    purchasePrice: 10.99,
    sellingPrice: 20.99,
    purchaseLocation: 'Test Store',
    sellingLocation: 'Online Store',
    dimensions: [10, 20, 30],
    purchaseDate: '2024-01-01',
    imageUrl: 'test-image.jpg',
    hashtags: ['test', 'product'],
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`Purchase Price: $${mockProduct.purchasePrice}`)).toBeInTheDocument();
    expect(screen.getByText(`Selling Price: $${mockProduct.sellingPrice}`)).toBeInTheDocument();
    
    // Check profit margin calculation
    const profit = mockProduct.sellingPrice - mockProduct.purchasePrice;
    const profitMargin = ((profit / mockProduct.purchasePrice) * 100).toFixed(2);
    expect(screen.getByText(`Profit Margin: ${profitMargin}% ($${profit})`)).toBeInTheDocument();
  });

  it('calls edit handler when edit button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText(/edit/i));
    expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
  });

  it('calls delete handler when delete button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText(/delete/i));
    expect(mockOnDelete).toHaveBeenCalledWith(mockProduct._id);
  });

  it('displays hashtags correctly', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    mockProduct.hashtags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('copies hashtags when copy button is clicked', () => {
    // Mock clipboard API
    const mockClipboard = {
      writeText: jest.fn()
    };
    Object.assign(navigator, {
      clipboard: mockClipboard
    });

    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText(/copy/i));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockProduct.hashtags.join(' ')
    );
  });
});
