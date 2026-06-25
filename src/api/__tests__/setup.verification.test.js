import { describe, it, expect, beforeEach } from 'vitest';
import { mockAxios, resetAxiosMocks } from './setup.js';

describe('Test Setup Verification', () => {
  beforeEach(() => {
    resetAxiosMocks();
  });

  it('should have vitest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have fast-check available', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(fc.property).toBeDefined();
  });

  it('should have axios mock available', () => {
    expect(mockAxios).toBeDefined();
    expect(mockAxios.get).toBeDefined();
    expect(mockAxios.post).toBeDefined();
    expect(mockAxios.put).toBeDefined();
    expect(mockAxios.delete).toBeDefined();
  });

  it('should be able to mock axios responses', async () => {
    mockAxios.get.mockResolvedValue({ data: { test: 'value' } });
    const response = await mockAxios.get('/test');
    expect(response.data).toEqual({ test: 'value' });
  });

  it('should reset mocks correctly', () => {
    mockAxios.get();
    expect(mockAxios.get).toHaveBeenCalled();
    resetAxiosMocks();
    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});
