import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportApi } from '../report';
import api from '../axios';

// Mock axios module
vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('report.js exploration tests (MUST FAIL before fix)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAdminReport should send GET to /api/v1/admin/reports/aggregate', async () => {
    // Mock response
    api.get.mockResolvedValue({ data: { status: true, data: {} } });

    const params = { start_date: '2024-01-01', end_date: '2024-01-31' };
    await reportApi.getAdminReport(params);

    // This test MUST FAIL before fix because current implementation sends to /api/v1/admin/reports
    // After fix, it should send to /api/v1/admin/reports/aggregate
    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/reports/aggregate', { params });
  });

  it('reportApi.getSubscriptionInvoices method should exist', () => {
    // This test MUST FAIL before fix because method doesn't exist yet
    expect(reportApi).toHaveProperty('getSubscriptionInvoices');
    expect(typeof reportApi.getSubscriptionInvoices).toBe('function');
  });

  it('getSubscriptionInvoices should send GET to /api/v1/owner/subscription/invoices', async () => {
    // Mock response
    api.get.mockResolvedValue({ data: { status: true, data: [] } });

    // This test MUST FAIL before fix because method doesn't exist
    await reportApi.getSubscriptionInvoices();

    expect(api.get).toHaveBeenCalledWith('/api/v1/owner/subscription/invoices');
  });
});
