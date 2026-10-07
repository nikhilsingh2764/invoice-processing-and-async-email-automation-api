import { Building2, FileText, LayoutDashboard, Package, UserCircle, Users } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/business', label: 'Business', icon: Building2 },
  { to: '/profile', label: 'Account', icon: UserCircle },
];

