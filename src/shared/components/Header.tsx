import React from "react";
import { LogOut, Moon, Package, Sun, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth.tsx";
import { useTheme } from "../hooks/useTheme.tsx";
import { useStockAlerts } from "../hooks/useStockAlerts";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { alerts } = useStockAlerts(60000); // Actualizar cada 60 segundos

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg dark:bg-green-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Sistema de Inventario
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Gestión de productos y movimientos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User info */}
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-300">
                <User className="w-4 h-4" />
                <span>{user.firstName || user.username}</span>
                <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded dark:bg-slate-800 dark:text-slate-200">
                  {user.role}
                </span>
              </div>
            )}

            <NotificationBell alerts={alerts} />

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 text-gray-600 transition-colors border border-gray-200 rounded-full hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-pressed={isDarkMode}
            >
              <span className="sr-only">
                Cambiar a modo {isDarkMode ? "claro" : "oscuro"}
              </span>
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors rounded-lg hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
