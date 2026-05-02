import React, { useEffect, useRef, useState } from "react";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth.tsx";
import { useTheme } from "../hooks/useTheme.tsx";
import { useStockAlerts } from "../hooks/useStockAlerts";
import { NotificationBell } from "./NotificationBell";

interface NavbarProps {
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { alerts } = useStockAlerts(60000); // Actualizar cada 60 segundos
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="px-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo y título - Responsive */}
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={`${import.meta.env.BASE_URL}inventory-icon.png`}
              alt="Logo"
              className="block w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
            <div>
              <h1 className="text-base font-bold leading-none text-gray-900 sm:text-xl dark:text-slate-100">
                Módulo de Inventario
              </h1>
            </div>
          </div>

          {/* Acciones - Responsive */}
          <div className="flex items-center space-x-1.5 sm:space-x-4">
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

            {/* Usuario con menú */}
            {user && (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 px-2 py-1.5 text-gray-700 transition-colors rounded-lg sm:px-3 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-full dark:border-slate-700">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-gray-800 dark:text-slate-100">
                      {user.firstName || user.username}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {user.role}
                    </span>
                  </span>
                </button>

                <div
                  role="menu"
                  className={`absolute right-0 z-50 w-48 mt-2 transition-all origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-slate-900 dark:border-slate-700 ${
                    isUserMenuOpen
                      ? "opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 -translate-y-1"
                  }`}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
