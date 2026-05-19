import React from 'react';
import {
  ChartBarIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  KeyIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CircleStackIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { SidebarLayout } from './SidebarLayout';

const NAV_ITEMS = [
  { path: '/admin',          label: 'Dashboard',     icon: ChartBarIcon                                },
  { path: '/admin/tenants',  label: 'Tenant',        icon: BuildingStorefrontIcon, permission: 'read-tenant' },
  { path: '/admin/users',    label: 'User',          icon: UsersIcon,           permission: 'read-user'   },
  { path: '/admin/roles/matrix', label: 'Matriks Otoritas', icon: ArrowsRightLeftIcon, permission: 'read-sistem' },
  { path: '/admin/permissions', label: 'Daftar Hak Akses',  icon: KeyIcon,             permission: 'read-sistem' },
  { path: '/admin/document-types', label: 'Tipe Dokumen', icon: DocumentTextIcon,    permission: 'read-sistem' },
  { path: '/admin/subscriptions', label: 'Langganan', icon: CreditCardIcon, permission: 'read-sistem' },
  { path: '/admin/settings', label: 'Pengaturan',    icon: Cog6ToothIcon,         permission: 'read-sistem' },
  { path: '/admin/audit',    label: 'Audit Log',     icon: ClipboardDocumentListIcon, permission: 'read-sistem' },
  { path: '/admin/errors',   label: 'Error Monitor', icon: ExclamationTriangleIcon,  permission: 'read-sistem' },
  { path: '/admin/backups',  label: 'Backup',        icon: CircleStackIcon,          permission: 'read-sistem' },
];

export default function AdminLayout() {
  return <SidebarLayout navItems={NAV_ITEMS} />;
}
