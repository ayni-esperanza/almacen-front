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
      <div className="px-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo y título - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 bg-green-500 rounded-lg sm:p-2 dark:bg-green-600">
              <Package className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 sm:text-xl dark:text-slate-100">
                Sistema de Inventario
              </h1>
              <p className="hidden text-sm text-gray-500 sm:block dark:text-slate-400">
                Gestión de productos y movimientos
              </p>
            </div>
          </div>

          {/* Acciones - Responsive */}
          <div className="flex items-center space-x-1.5 sm:space-x-4">
            {/* User info - Oculto en móvil */}
            {user && (
              <div className="items-center hidden space-x-2 text-sm text-gray-600 md:flex dark:text-slate-300">
                <User className="w-4 h-4" />
                <span>{user.firstName || user.username}</span>
                <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded dark:bg-slate-800 dark:text-slate-200">
                  {user.role}
                </span>
              </div>
            )}

            <NotificationBell alerts={alerts} />

            {/* Botón tema */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-gray-600 transition-colors border border-gray-200 rounded-full hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-pressed={isDarkMode}
            >
              <span className="sr-only">
                Cambiar a modo {isDarkMode ? "claro" : "oscuro"}
              </span>
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Botón logout - Icono solo en móvil */}
            <button
              onClick={onLogout}
              className="flex items-center px-2 py-2 space-x-2 text-gray-700 transition-colors rounded-lg sm:px-4 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
