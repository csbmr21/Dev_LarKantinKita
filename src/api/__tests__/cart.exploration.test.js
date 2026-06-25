/**
 * Exploration Tests for cart.js
 * 
 * Tujuan: Verifikasi bahwa cart API mengirim request ke URL yang BENAR.
 * Tests ini HARUS FAIL sebelum fix diterapkan (karena URL saat ini salah).
 * Tests ini HARUS PASS setelah fix diterapkan di task 3.1.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cartApi } from '../cart';
import api from '../axios';

// Mock axios module
vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Cart API - Exploration Tests (harus FAIL sebelum fix)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test 1: getCart harus mengirim ke /api/v1/customer/cart
   * Requirement: 1.1
   * Status saat ini: FAIL (mengirim ke /api/v1/cart)
   */
  it('getCart mengirim GET request ke /api/v1/customer/cart', async () => {
    api.get.mockResolvedValue({ data: { items: [] } });
    
    await cartApi.getCart();
    
    expect(api.get).toHaveBeenCalledWith('/api/v1/customer/cart');
  });

  /**
   * Test 2: addItem harus mengirim POST ke /api/v1/customer/cart/add
   * Requirement: 1.2
   * Status saat ini: FAIL (mengirim ke /api/v1/cart)
   */
  it('addItem mengirim POST request ke /api/v1/customer/cart/add', async () => {
    const menuId = 5;
    const quantity = 2;
    api.post.mockResolvedValue({ data: { items: [] } });
    
    await cartApi.addItem(menuId, quantity);
    
    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/customer/cart/add',
      { menu_id: menuId, quantity }
    );
  });

  /**
   * Test 3: clearCart harus mengirim DELETE ke /api/v1/customer/cart/clear
   * Requirement: 1.3
   * Status saat ini: FAIL (mengirim ke /api/v1/cart)
   */
  it('clearCart mengirim DELETE request ke /api/v1/customer/cart/clear', async () => {
    api.delete.mockResolvedValue({ data: null });
    
    await cartApi.clearCart();
    
    expect(api.delete).toHaveBeenCalledWith('/api/v1/customer/cart/clear');
  });

  /**
   * Test 4: updateItem harus mengirim PUT ke /api/v1/customer/cart/{id}
   * Requirement: 1.4
   * Status saat ini: FAIL (mengirim ke /api/v1/cart/{id})
   */
  it('updateItem mengirim PUT request ke /api/v1/customer/cart/{id}', async () => {
    const cartItemId = 10;
    const quantity = 3;
    api.put.mockResolvedValue({ data: { items: [] } });
    
    await cartApi.updateItem(cartItemId, quantity);
    
    expect(api.put).toHaveBeenCalledWith(
      `/api/v1/customer/cart/${cartItemId}`,
      { quantity }
    );
  });

  /**
   * Test 5: removeItem harus mengirim DELETE ke /api/v1/customer/cart/{id}
   * Requirement: 1.5
   * Status saat ini: FAIL (mengirim ke /api/v1/cart/{id})
   */
  it('removeItem mengirim DELETE request ke /api/v1/customer/cart/{id}', async () => {
    const cartItemId = 10;
    api.delete.mockResolvedValue({ data: { items: [] } });
    
    await cartApi.removeItem(cartItemId);
    
    expect(api.delete).toHaveBeenCalledWith(`/api/v1/customer/cart/${cartItemId}`);
  });

  /**
   * Test 6: Semua endpoint cart harus mengandung prefix '/customer/'
   * Requirement: 1.6
   * Status saat ini: FAIL (tidak ada prefix '/customer/')
   */
  it('semua endpoint cart mengandung prefix /customer/', async () => {
    api.get.mockResolvedValue({ data: {} });
    api.post.mockResolvedValue({ data: {} });
    api.put.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });

    // Test getCart
    await cartApi.getCart();
    expect(api.get.mock.calls[0][0]).toContain('/customer/');

    // Test addItem
    await cartApi.addItem(1, 1);
    expect(api.post.mock.calls[0][0]).toContain('/customer/');

    // Test updateItem
    await cartApi.updateItem(1, 1);
    expect(api.put.mock.calls[0][0]).toContain('/customer/');

    // Test removeItem
    await cartApi.removeItem(1);
    expect(api.delete.mock.calls[0][0]).toContain('/customer/');

    // Test clearCart
    await cartApi.clearCart();
    expect(api.delete.mock.calls[1][0]).toContain('/customer/');
  });
});
