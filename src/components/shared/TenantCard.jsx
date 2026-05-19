import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

export default function TenantCard({ tenant, className }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tenant/${tenant.id}`)}
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {/* Photo */}
      <div className="relative h-32 bg-gray-100 overflow-hidden">
        <img
          src={tenant.photo_url || PLACEHOLDER}
          alt={tenant.tenant_name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={Number(tenant.is_open) === 1 ? 'success' : 'gray'} dot>
            {Number(tenant.is_open) === 1 ? 'Buka' : 'Tutup'}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">
          {tenant.tenant_name}
        </h3>

        {tenant.address && (
          <div className="flex items-start gap-1 text-xs text-gray-400">
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{tenant.address}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs text-gray-400">
            Min. {formatCurrency(tenant.min_order)}
          </span>
          {tenant.open_hours && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <ClockIcon className="w-3 h-3" />
              <span>{tenant.open_hours?.open ?? '07:00'} – {tenant.open_hours?.close ?? '17:00'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
