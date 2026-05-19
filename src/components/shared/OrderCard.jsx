import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, formatRelative } from '../../utils/formatDate';
import { getStatusLabel, getStatusColor } from '../../utils/orderStatus';

export default function OrderCard({ order, onAction, actionLabel, actionVariant = 'primary', showTenant = true, className }) {
  const navigate = useNavigate();

  const statusColorMap = {
    pending_payment: 'warning',
    paid:            'info',
    processing:      'orange',
    completed:       'success',
    expired:         'gray',
    cancelled:       'danger',
    refunded:        'purple',
  };

  return (
    <div className={clsx('bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3', className)}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono text-gray-400">#{order.order_number}</p>
          {showTenant && order.tenant?.tenant_name && (
            <div className="flex items-center gap-1 mt-0.5">
              <BuildingStorefrontIcon className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm font-semibold text-gray-800">{order.tenant.tenant_name}</p>
            </div>
          )}
        </div>
        <Badge variant={statusColorMap[order.status] ?? 'gray'} dot>
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Items preview */}
      {order.items?.length > 0 && (
        <div className="text-xs text-gray-500 space-y-0.5">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="line-clamp-1">{item.quantity}× {item.menu_name}</span>
              <span className="text-gray-400">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-gray-400">+{order.items.length - 3} item lainnya</p>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div>
          <p className="text-base font-bold text-gray-800">{formatCurrency(order.grand_total)}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <ClockIcon className="w-3 h-3 text-gray-300" />
            <p className="text-xs text-gray-400">{formatRelative(order.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            Detail
          </Button>
          {onAction && (
            <Button variant={actionVariant} size="xs" onClick={() => onAction(order)}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
