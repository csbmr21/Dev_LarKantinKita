import React from 'react';
import clsx from 'clsx';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import Badge from '../ui/Badge';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80';

export default function MenuCard({ menu, tenantId, tenantName, className }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuId === menu.id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      photo: menu.photo,
      tenantId,
      tenantName,
      quantity: 1,
    });
  };

  const handleDecrease = () => updateQuantity(menu.id, qty - 1);
  const handleIncrease = () => updateQuantity(menu.id, qty + 1);

  const isUnavailable = !menu.is_available;

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm',
        isUnavailable && 'opacity-60',
        className
      )}
    >
      {/* Photo */}
      <div className="relative h-28 bg-gray-100 overflow-hidden">
        <img
          src={menu.photo_url || PLACEHOLDER}
          alt={menu.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="gray">Habis</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1 mb-0.5">
          {menu.name}
        </p>
        {menu.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{menu.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#2D6A4F]">
            {formatCurrency(menu.price)}
          </span>

          {isUnavailable ? null : qty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center hover:bg-[#245A41] transition-colors active:scale-90"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDecrease}
                className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <MinusIcon className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-gray-800 w-4 text-center">{qty}</span>
              <button
                onClick={handleIncrease}
                className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center hover:bg-[#245A41] transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
