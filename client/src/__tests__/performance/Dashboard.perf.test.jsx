import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from '../../components/Dashboard/Dashboard';
import { api } from '../../services/api';

jest.mock('../../services/api');

describe('Dashboard Performance', () => {
  // Generate large dataset
  const generateProducts = (count) => {
    return Array.from({ length: count }, (_, index) => ({
      _id: `product${index}`,
      name: `Product ${index}`,
      purchasePrice: 10 + index,
      sellingPrice: 20 + index,
      purchaseLocation: `Store ${index}`,
      sellingLocation: 'Online Store',
      dimensions: [10, 20, 30],
      purchaseDate: new Date().toISOString(),
      hashtags: [`tag${index}`]
    }));
  };

  beforeEach(() => {
    jest.useFakeTimers();
    performance.mark = jest.fn();
    performance.measure = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders large datasets efficiently', async () => {
    const products = generateProducts(1000);
    api.get.mockResolvedValue({ data: products });

    performance.mark('start-render');
    render(<Dashboard />);
    performance.mark('end-render');
    
    performance.measure('render-time', 'start-render', 'end-render');
    
    // Assert render time is under threshold
    const measurements = performance.getEntriesByName('render-time');
    expect(measurements[0].duration).toBeLessThan(1000); // 1 second threshold
  });

  it('handles search and filtering efficiently', async () => {
    const products = generateProducts(1000);
    api.get.mockResolvedValue({ data: products });

    const { getByPlaceholderText } = render(<Dashboard />);
    const searchInput = getByPlaceholderText(/search products/i);

    performance.mark('start-search');
    searchInput.value = 'Product 500';
    searchInput.dispatchEvent(new Event('input'));
    performance.mark('end-search');

    performance.measure('search-time', 'start-search', 'end-search');
    
    // Assert search time is under threshold
    const measurements = performance.getEntriesByName('search-time');
    expect(measurements[0].duration).toBeLessThan(100); // 100ms threshold
  });

  it('maintains smooth scrolling with large lists', async () => {
    const products = generateProducts(1000);
    api.get.mockResolvedValue({ data: products });

    const { container } = render(<Dashboard />);
    
    performance.mark('start-scroll');
    container.scrollTop = 1000;
    container.dispatchEvent(new Event('scroll'));
    performance.mark('end-scroll');

    performance.measure('scroll-time', 'start-scroll', 'end-scroll');
    
    // Assert scroll time is under threshold
    const measurements = performance.getEntriesByName('scroll-time');
    expect(measurements[0].duration).toBeLessThan(16); // 16ms threshold for 60fps
  });
});
