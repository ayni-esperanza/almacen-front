import { Link } from "react-router-dom";
import {
  Package,
  TrendingUp,
  Wrench,
  Users,
  BarChart3,
  User,
} from "lucide-react";
import { ProtectedComponent } from "./ProtectedComponent";
import { Permission } from "../types/permissions";

interface DashboardTabsProps {
  currentPath: string;
}

export const DashboardTabs = ({ currentPath }: DashboardTabsProps) => {
  const tabs = [
    {
      path: "/dashboard/inventory",
      label: "Stock",
      icon: Package,
      permission: Permission.VIEW_INVENTORY,
    },
    {
      path: "/dashboard/movements",
      label: "Movimientos",
      icon: TrendingUp,
      permission: Permission.VIEW_MOVEMENTS,
    },
    {
      path: "/dashboard/equipment",
      label: "Equipos",
      icon: Wrench,
      permission: Permission.VIEW_EQUIPMENT,
    },
    {
      path: "/dashboard/reports",
      label: "Reportes",
      icon: BarChart3,
      permission: Permission.VIEW_REPORTS,
    },
    {
      path: "/dashboard/users",
      label: "Usuarios",
      icon: Users,
      permission: Permission.VIEW_USERS,
    },
    {
      path: "/dashboard/providers",
      label: "Proveedores",
      icon: User,
      permission: Permission.VIEW_PROVIDERS,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard/inventory") {
      return (
        currentPath === "/dashboard" || currentPath === "/dashboard/inventory"
      );
    }
    return currentPath === path;
  };

  return (
    <div className="flex items-center px-2 overflow-x-auto border-b border-gray-200 sm:px-6 bg-gray-50 dark:border-slate-700 dark:bg-slate-900 scrollbar-hide">
      {tabs.map(({ path, label, icon: Icon, permission }) => (
        <ProtectedComponent key={path} permission={permission}>
          <Link
            to={path}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              isActive(path)
                ? "border-[#16A34A] text-[#16A34A] dark:text-emerald-400"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600"
            }`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        </ProtectedComponent>
      ))}
    </div>
  );
};
