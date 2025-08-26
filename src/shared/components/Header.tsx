import React from 'react';
import { LogOut, Package, FileText, User } from 'lucide-react';
import { ProtectedComponent } from './ProtectedComponent';
import { Permission } from '../types/permissions';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onLogout: () => void;
  onGenerateReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onGenerateReport }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sistema de Inventario</h1>
              <p className="text-sm text-gray-500">Gestión de productos y movimientos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User info */}
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.firstName || user.username}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {user.role}
                </span>
              </div>
            )}

            <ProtectedComponent permission={Permission.REPORTS_GENERATE}>
              <button
                onClick={onGenerateReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Reporte PDF</span>
              </button>
            </ProtectedComponent>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
