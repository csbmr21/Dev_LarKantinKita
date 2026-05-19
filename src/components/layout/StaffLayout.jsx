import React from 'react';
import { ChartBarIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { SidebarLayout } from './SidebarLayout';

const NAV_ITEMS = [
  { path: '/staff',       label: 'Dashboard Order', icon: ChartBarIcon,   permission: 'read-pesanan' },
  { path: '/staff/menus', label: 'Manajemen Menu',  icon: Squares2X2Icon, permission: 'read-menu'    },
];

export default function StaffLayout() {
  return <SidebarLayout navItems={NAV_ITEMS} />;
}
