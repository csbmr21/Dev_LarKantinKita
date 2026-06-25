import { vi } from 'vitest';

// Mock axios globally untuk semua API tests
export const mockAxios = {
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  patch: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  request: vi.fn(() => Promise.resolve({ data: {} })),
  create: vi.fn(() => mockAxios),
  defaults: {
    headers: {
      common: {},
      delete: {},
      get: {},
      head: {},
      post: {},
      put: {},
      patch: {},
    },
  },
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn(),
    },
    response: {
      use: vi.fn(),
      eject: vi.fn(),
    },
  },
};

// Reset all mocks sebelum setiap test
export const resetAxiosMocks = () => {
  Object.keys(mockAxios).forEach((key) => {
    if (typeof mockAxios[key]?.mockReset === 'function') {
      mockAxios[key].mockReset();
    }
  });
};

// Mock axios module
vi.mock('axios', () => ({
  default: mockAxios,
}));

// Export utility untuk test assertions
export const getLastCall = (mockFn) => {
  const calls = mockFn.mock.calls;
  return calls[calls.length - 1];
};

export const getLastCallArgs = (mockFn) => {
  const lastCall = getLastCall(mockFn);
  return lastCall || [];
};
