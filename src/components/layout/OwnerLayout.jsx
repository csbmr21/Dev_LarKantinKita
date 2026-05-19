import React from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowUturnLeftIcon,
  UsersIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { SidebarLayout } from './SidebarLayout';

const NAV_ITEMS = [
  { path: '/owner',              label: 'Dashboard',  icon: ChartBarIcon,         permission: 'read-laporan' },
  { path: '/owner/report',       label: 'Laporan',    icon: DocumentChartBarIcon, permission: 'read-laporan' },
  { path: '/owner/refund',       label: 'Refund',     icon: ArrowUturnLeftIcon,   permission: 'read-pesanan' },
  { path: '/owner/staff',        label: 'Staff',      icon: UsersIcon,            permission: 'read-user'    },
  { path: '/owner/subscription', label: 'Subscription', icon: StarIcon },
];

export default function OwnerLayout() {
  return <SidebarLayout navItems={NAV_ITEMS} />;
}
