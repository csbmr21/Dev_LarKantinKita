/**
 * Bug Condition Exploration Tests
 *
 * BUGFIX WORKFLOW — Task 1
 * These tests MUST FAIL on unfixed code. Failure confirms the bugs exist.
 * DO NOT fix the code or the tests when they fail.
 *
 * Validates: Requirements 1.1, 1.7, 1.8
 *
 * Bug 1  — MerchantView: user?.tenant?.name (undefined) instead of tenant_name
 * Bug 7  — StaffDashboard: order.customer (undefined) instead of order.user?.full_name
 * Bug 8a — Checkout: payload includes tenant_id + items[] instead of only { notes }
 * Bug 8b — MenuCard: handleAdd only calls Zustand addItem, never cartApi.addItem
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ────────────────────────────────────────────────────────────
// Module-level mocks (hoisted by vitest)
// ────────────────────────────────────────────────────────────

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: { notes: 'Test note' }, pathname: '/checkout' }),
  Link: ({ children }) => <span>{children}</span>,
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => {
  const queryClientMock = { invalidateQueries: vi.fn() };
  return {
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      isLoading: false,
    })),
    useQueryClient: vi.fn(() => queryClientMock),
  };
});

// Mock API modules
vi.mock('../api/report', () => ({
  reportApi: {
    getAggregateReport: vi.fn(() => Promise.resolve({ data: {} })),
    getSubscription: vi.fn(() => Promise.resolve({ data: {} })),
    getSubscriptionPlans: vi.fn(() => Promise.resolve({ data: [] })),
    subscribe: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../api/tenant', () => ({
  tenantApi: {
    getMyTenant: vi.fn(() => Promise.resolve({ data: { data: { is_open: true } } })),
    updateMyTenant: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../api/order', () => ({
  orderApi: {
    checkout: vi.fn(() => Promise.resolve({ data: { data: { snap_token: 'tok' } } })),
    getOwnerOrders: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    getStaffOrders: vi.fn(() => Promise.resolve({ data: { data: { data: [] } } })),
    updateOrderStatus: vi.fn(() => Promise.resolve()),
  },
}));

// Mock cartApi — critical for Bug 8b
vi.mock('../api/cart', () => ({
  cartApi: {
    addItem: vi.fn(() => Promise.resolve({ data: { data: { id: 42 } } })),
    updateItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
    clearCart: vi.fn(() => Promise.resolve()),
    getCart: vi.fn(() => Promise.resolve({ data: { data: [] } })),
  },
}));

// Mock realtime hook
vi.mock('../hooks/useRealtime', () => ({
  useRealtime: vi.fn(),
  playNotificationSound: vi.fn(),
  initEcho: vi.fn(),
}));

// Mock hooks/useOrders
vi.mock('../hooks/useOrders', () => ({
  useUpdateOrderStatus: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => {
  const successMock = vi.fn();
  const errorMock = vi.fn();
  const toastFn = Object.assign(vi.fn(), {
    success: successMock,
    error: errorMock,
  });
  return { default: toastFn };
});

// Mock sub-pages used inside MerchantView
vi.mock('../pages/staff/MenuManagement', () => ({
  default: () => <div data-testid="menu-management">MenuManagement</div>,
}));
vi.mock('../pages/owner/StaffManagement', () => ({
  default: () => <div data-testid="staff-management">StaffManagement</div>,
}));
vi.mock('../pages/owner/Report', () => ({
  default: () => <div data-testid="owner-report">OwnerReport</div>,
}));
vi.mock('../pages/owner/Refund', () => ({
  default: () => <div data-testid="owner-refund">OwnerRefund</div>,
}));

// Mock utilities
vi.mock('../utils/formatCurrency', () => ({
  formatCurrency: (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`,
}));
vi.mock('../utils/formatDate', () => ({
  formatRelative: () => '5 menit lalu',
  formatTime: () => '12:00',
}));
vi.mock('../utils/orderStatus', () => ({
  STAFF_FILTER_TABS: [
    { value: 'paid', label: 'Baru Masuk', icon: '🆕' },
    { value: 'processing', label: 'Diproses', icon: '🍳' },
    { value: 'completed', label: 'Selesai', icon: '✅' },
  ],
}));

// Mock UI components
vi.mock('../components/ui/Badge', () => ({
  default: ({ children }) => <span>{children}</span>,
}));
vi.mock('../components/ui/Button', () => ({
  default: ({ children, onClick, disabled, loading, fullWidth, size, variant, ...rest }) => (
    <button onClick={onClick} disabled={disabled || loading} {...rest}>
      {children}
    </button>
  ),
}));
vi.mock('../components/ui/Modal', () => ({
  default: ({ isOpen, children, footer, title }) =>
    isOpen ? (
      <div data-testid="modal">
        <div>{title}</div>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}));
vi.mock('../components/ui/EmptyState', () => ({
  default: ({ title }) => <div data-testid="empty-state">{title}</div>,
}));
vi.mock('../components/ui/Skeleton', () => ({
  SkeletonList: () => <div data-testid="skeleton-list">Loading...</div>,
}));

// Mock zustand stores
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));
vi.mock('../store/cartStore', () => ({
  useCartStore: vi.fn(),
}));

// ────────────────────────────────────────────────────────────
// Import mocked modules and components
// ────────────────────────────────────────────────────────────
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { orderApi } from '../api/order';
import { cartApi } from '../api/cart';
import { useRealtime } from '../hooks/useRealtime';
import toast from 'react-hot-toast';

import MerchantView from '../components/layout/shell/MerchantView';
import MenuCard from '../components/shared/MenuCard';
import Checkout from '../pages/customer/Checkout';
import StaffDashboard from '../pages/staff/Dashboard';

// ════════════════════════════════════════════════════════════
// Test Suite
// ════════════════════════════════════════════════════════════

describe('Bug Condition Exploration Tests — MUST FAIL ON UNFIXED CODE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────
  // Test 1 — Bug 1: MerchantView sidebar shows fallback "Toko Saya"
  //                  instead of tenant_name
  // ──────────────────────────────────────────────────────────
  it('Test 1 — Bug 1: MerchantView sidebar SHOULD display tenant_name "Kantin Bu Siti"', () => {
    /**
     * Validates: Requirements 1.1
     * EXPECTED: FAIL on unfixed code.
     *
     * Buggy line in MerchantView.jsx:
     *   const tenantName = user?.tenant?.name ?? 'Toko Saya';
     *
     * Backend sends { tenant_name: "Kantin Bu Siti" }, NOT { name: "..." }.
     * So user?.tenant?.name is undefined → falls back to 'Toko Saya'.
     *
     * Counterexample: sidebar shows "Toko Saya" instead of "Kantin Bu Siti"
     */
    useAuthStore.mockReturnValue({
      user: {
        full_name: 'Siti Rahma',
        tenant: {
          // Backend field is tenant_name — not name
          tenant_name: 'Kantin Bu Siti',
        },
      },
    });

    render(<MerchantView />);

    // WILL FAIL: sidebar renders 'Toko Saya' (fallback) because
    // user?.tenant?.name is undefined
    expect(screen.getByText('Kantin Bu Siti')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  // Test 2 — Bug 7: Dashboard toast uses order.customer (undefined)
  // ──────────────────────────────────────────────────────────
  it('Test 2 — Bug 7: Staff Dashboard realtime toast SHOULD contain "Budi Santoso"', () => {
    /**
     * Validates: Requirements 1.7
     * EXPECTED: FAIL on unfixed code.
     *
     * Buggy line in Dashboard.jsx:
     *   toast.success(`Pesanan baru dari ${order.customer}! #${order.order_number}`, ...)
     *
     * Backend Pusher payload is: { user: { full_name: "Budi Santoso" }, order_number: "ORD-001" }
     * order.customer is undefined → toast shows "Pesanan baru dari undefined!"
     *
     * Counterexample: toast was called with "...dari undefined!..." not "...dari Budi Santoso!..."
     */
    useAuthStore.mockReturnValue({
      user: { tenant_id: 5, full_name: 'Staff User' },
    });

    // Capture the NewOrderReceived handler
    let capturedHandlers = {};
    useRealtime.mockImplementation((_channelName, events) => {
      capturedHandlers = events;
    });

    render(<StaffDashboard />);

    // Simulate Pusher NewOrderReceived event with correct backend payload
    const pusherPayload = {
      user: { full_name: 'Budi Santoso' },
      order_number: 'ORD-001',
    };

    act(() => {
      capturedHandlers.NewOrderReceived?.(pusherPayload);
    });

    // WILL FAIL: toast.success was called with "Pesanan baru dari undefined!"
    // because the code reads order.customer (not order.user?.full_name)
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Budi Santoso'),
      expect.anything()
    );
  });

  // ──────────────────────────────────────────────────────────
  // Test 3 — Bug 8a: Checkout should NOT send tenant_id/items[]
  // ──────────────────────────────────────────────────────────
  it('Test 3 — Bug 8a: Checkout SHOULD call orderApi.checkout with { notes, payment_method }', async () => {
    /**
     * Validates: Requirements 1.8
     * EXPECTED: PASS — the old bug (sending tenant_id + items[]) has been fixed.
     *
     * Current correct code in Checkout.jsx processCheckout():
     *   const res = await orderApi.checkout({ notes, payment_method: paymentMethod });
     *
     * Backend accepts { notes, payment_method } and reads cart from DB.
     */
    useAuthStore.mockReturnValue({
      user: { full_name: 'Budi Santoso', phone: '0812345678' },
    });

    useCartStore.mockReturnValue({
      items: [
        { menuId: 1, name: 'Nasi Goreng', price: 15000, quantity: 1, tenantId: 1, tenantName: 'Kantin A' },
        { menuId: 2, name: 'Es Teh', price: 5000, quantity: 2, tenantId: 1, tenantName: 'Kantin A' },
      ],
      tenantId: 1,
      clearCart: vi.fn(),
      getTotalPrice: () => 25000,
    });

    orderApi.checkout.mockResolvedValue({ data: { data: {} } });

    render(<Checkout />);

    // Open payment modal
    fireEvent.click(screen.getByText(/Pilih Pembayaran & Bayar/i));

    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());

    // Select QRIS payment method
    const qrisRadio = screen.getByDisplayValue('qris');
    fireEvent.click(qrisRadio);

    // Trigger checkout
    fireEvent.click(screen.getByText(/Konfirmasi & Buat Pesanan/i));

    await waitFor(() => {
      expect(orderApi.checkout).toHaveBeenCalled();
    });

    const callArg = orderApi.checkout.mock.calls[0][0];

    // Should NOT contain tenant_id or items (those are read from server-side cart)
    expect(callArg).not.toHaveProperty('tenant_id');
    expect(callArg).not.toHaveProperty('items');

    // Should contain notes and payment_method
    // notes defaults to '' because location.state is not set in this test
    expect(callArg).toHaveProperty('notes');
    expect(callArg).toHaveProperty('payment_method', 'qris');
  });

  // ──────────────────────────────────────────────────────────
  // Test 4 — Bug 8b: MenuCard never calls cartApi.addItem
  // ──────────────────────────────────────────────────────────
  it('Test 4 — Bug 8b: MenuCard "+" button SHOULD call cartApi.addItem(menu.id, 1)', async () => {
    /**
     * Validates: Requirements 1.8
     * EXPECTED: FAIL on unfixed code.
     *
     * Buggy handleAdd in MenuCard.jsx:
     *   const handleAdd = () => {
     *     addItem({ menuId: menu.id, name: menu.name, ... }); // only Zustand
     *   };
     *
     * cartApi.addItem is never called — item is only stored locally in Zustand.
     *
     * Counterexample: cartApi.addItem was never called (call count = 0)
     */
    const zustandAddItemMock = vi.fn();

    useCartStore.mockReturnValue({
      items: [],
      addItem: zustandAddItemMock,
      updateQuantity: vi.fn(),
    });

    const menu = {
      id: 10,
      name: 'Ayam Geprek',
      price: 18000,
      photo_url: null,
      is_available: true,
      description: 'Ayam pedas',
    };

    render(
      <MenuCard
        menu={menu}
        tenantId={1}
        tenantName="Kantin Bu Siti"
      />
    );

    // Click the "+" add button
    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);

    // Allow any async operations to settle
    await act(async () => {});

    // WILL FAIL: cartApi.addItem was never called (count = 0)
    // because handleAdd only calls Zustand addItem, not cartApi.addItem
    expect(cartApi.addItem).toHaveBeenCalledWith(10, 1);
  });
});
