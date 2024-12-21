export const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  username: 'testuser'
};

export const mockProduct = {
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

export const generateProducts = (count) => {
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

export const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
