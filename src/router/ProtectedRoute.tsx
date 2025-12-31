import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-200">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
