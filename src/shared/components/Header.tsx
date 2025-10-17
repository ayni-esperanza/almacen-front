import React from 'react';
import { LogOut, Moon, Package, Sun, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useTheme } from '../hooks/useTheme.tsx';

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg dark:bg-green-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Sistema de Inventario</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">Gestión de productos y movimientos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User info */}
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-300">
                <User className="w-4 h-4" />
                <span>{user.firstName || user.username}</span>
                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200">
                  {user.role}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-pressed={isDarkMode}
            >
              <span className="sr-only">Cambiar a modo {isDarkMode ? 'claro' : 'oscuro'}</span>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
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
