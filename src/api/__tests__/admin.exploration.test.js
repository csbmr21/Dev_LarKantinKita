import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminApi } from '../admin';
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

describe('admin.js exploration tests (MUST FAIL before fix)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adminApi.exportAuditLogs method should exist', () => {
    // This test MUST FAIL before fix because method doesn't exist yet
    expect(adminApi).toHaveProperty('exportAuditLogs');
    expect(typeof adminApi.exportAuditLogs).toBe('function');
  });

  it('exportAuditLogs should send GET to /api/v1/admin/audit-logs/export with responseType blob', async () => {
    // Mock response
    api.get.mockResolvedValue({ data: new Blob() });

    const params = { start_date: '2024-01-01', end_date: '2024-01-31' };
    
    // This test MUST FAIL before fix because method doesn't exist
    await adminApi.exportAuditLogs(params);

    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/audit-logs/export', {
      params,
      responseType: 'blob',
    });
  });

  it('adminApi.getAdminReportAggregate method should exist', () => {
    // This test MUST FAIL before fix because method doesn't exist yet
    expect(adminApi).toHaveProperty('getAdminReportAggregate');
    expect(typeof adminApi.getAdminReportAggregate).toBe('function');
  });

  it('getAdminReportAggregate should send GET to /api/v1/admin/reports/aggregate', async () => {
    // Mock response
    api.get.mockResolvedValue({ data: { status: true, data: {} } });

    const params = { start_date: '2024-01-01', end_date: '2024-01-31' };
    
    // This test MUST FAIL before fix because method doesn't exist
    await adminApi.getAdminReportAggregate(params);

    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/reports/aggregate', { params });
  });
});
