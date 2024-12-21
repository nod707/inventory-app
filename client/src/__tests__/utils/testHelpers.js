import { act } from '@testing-library/react';

export const waitForLoadingToFinish = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

export const setupPerformanceTest = () => {
  const originalMark = performance.mark;
  const originalMeasure = performance.measure;
  
  beforeEach(() => {
    jest.useFakeTimers();
    performance.mark = jest.fn();
    performance.measure = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    performance.mark = originalMark;
    performance.measure = originalMeasure;
  });
};

export const mockLocalStorage = () => {
  const store = {};
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

export const mockClipboard = () => {
  const clipboard = {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  };
  
  Object.assign(navigator, { clipboard });
  return clipboard;
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};
