import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
