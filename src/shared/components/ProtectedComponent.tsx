import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../types/permissions';

interface ProtectedComponentProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions. If false, requires ANY permission
  fallback?: ReactNode;
}

export const ProtectedComponent = ({ 
  children, 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null 
}: ProtectedComponentProps) => {
  const { checkPermission, checkAnyPermission, checkAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = checkPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);
  } else {
    // No permissions specified, allow access
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
