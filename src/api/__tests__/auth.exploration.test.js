/**
 * Exploration Test: auth.js
 * 
 * Tests ini harus FAIL sebelum fix diapply.
 * Memverifikasi bahwa authApi.setupProfile tidak ada sebagai method.
 */

import { describe, it, expect } from 'vitest';
import { authApi } from '../auth.js';

describe('Auth API Exploration Tests (MUST FAIL)', () => {
  it('should have setupProfile method', () => {
    // Test: authApi.setupProfile ada sebagai method
    // Expected: FAIL (method belum ada)
    expect(authApi).toHaveProperty('setupProfile');
    expect(typeof authApi.setupProfile).toBe('function');
  });
});
