import { Link } from 'react-router-dom';
import { Package, TrendingUp, TrendingDown, Wrench, Users, BarChart3 } from 'lucide-react';
import { ProtectedComponent } from './ProtectedComponent';
import { Permission } from '../types/permissions';

interface DashboardTabsProps {
  currentPath: string;
}

export const DashboardTabs = ({ currentPath }: DashboardTabsProps) => {
  const tabs = [
    { path: '/dashboard/inventory', label: 'Stock', icon: Package },
    { path: '/dashboard/movements', label: 'Movimientos', icon: TrendingUp },
    { path: '/dashboard/equipment', label: 'Equipos', icon: Wrench },
    { path: '/dashboard/reports', label: 'Reportes', icon: BarChart3, permission: Permission.REPORTS_READ },
    { path: '/dashboard/users', label: 'Usuarios', icon: Users, permission: Permission.USERS_READ },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard/inventory') {
      return currentPath === '/dashboard' || currentPath === '/dashboard/inventory';
    }
    return currentPath === path;
  };

  return (
    <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6">
      {tabs.map(({ path, label, icon: Icon, permission }) => {
        const tabElement = (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              isActive(path)
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );

        return permission ? (
          <ProtectedComponent key={path} permission={permission}>
            {tabElement}
          </ProtectedComponent>
        ) : (
          tabElement
        );
      })}
    </div>
  );
};
