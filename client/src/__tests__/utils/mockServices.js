import { mockUser, mockProduct } from './fixtures';

export const setupApiMocks = (api) => {
  // Clear all mocks
  jest.clearAllMocks();

  // Setup default implementations
  api.post.mockImplementation((url) => {
    switch (url) {
      case '/auth/login':
        return Promise.resolve({ data: { user: mockUser, token: 'mock-token' } });
      case '/auth/register':
        return Promise.resolve({ data: { user: mockUser, token: 'mock-token' } });
      case '/products':
        return Promise.resolve({ data: mockProduct });
      default:
        return Promise.resolve({ data: {} });
    }
  });

  api.get.mockImplementation((url) => {
    switch (url) {
      case '/products':
        return Promise.resolve({ data: [mockProduct] });
      default:
        return Promise.resolve({ data: {} });
    }
  });

  api.delete.mockImplementation(() => 
    Promise.resolve({ data: { message: 'Product deleted' } })
  );

  api.patch.mockImplementation(() => 
    Promise.resolve({ data: { ...mockProduct, name: 'Updated Product' } })
  );

  return {
    mockLoginError: () => {
      api.post.mockImplementationOnce((url) => {
        if (url === '/auth/login') {
          return Promise.reject({ 
            response: { data: { message: 'Invalid credentials' } }
          });
        }
      });
    },
    mockProductCreationError: () => {
      api.post.mockImplementationOnce((url) => {
        if (url === '/products') {
          return Promise.reject({ 
            response: { data: { message: 'Error creating product' } }
          });
        }
      });
    },
    mockNetworkError: () => {
      api.get.mockImplementationOnce(() => 
        Promise.reject({ message: 'Network Error' })
      );
    }
  };
};

export const setupTensorFlowMocks = () => {
  const mockPredict = jest.fn().mockReturnValue({
    array: jest.fn().mockResolvedValue([[
      [0.1, 0.2, 0.3, 0.4] // Mock bounding box
    ]])
  });

  const mockModel = {
    predict: mockPredict
  };

  return {
    loadGraphModel: jest.fn().mockResolvedValue(mockModel),
    browser: {
      fromPixels: jest.fn(() => ({
        expandDims: jest.fn(() => 'tensorMock')
      }))
    },
    mockPredict
  };
};
