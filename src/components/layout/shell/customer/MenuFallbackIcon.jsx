import React from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

/**
 * Default fallback icon for menus if no image is available.
 * Shared across Customer screens.
 */
export const MenuFallbackIcon = ({ className = "w-10 h-10 text-gray-200" }) => (
  <div className="flex items-center justify-center h-full bg-gray-50/50">
    <ShoppingBagIcon className={className} />
  </div>
);
