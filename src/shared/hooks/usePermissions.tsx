import { useAuth } from './useAuth';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../types/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  };

  return {
    user,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    // Helper methods for common permissions
    canRead: (module: string) => checkPermission(`${module}:read` as Permission),
    canCreate: (module: string) => checkPermission(`${module}:create` as Permission),
    canUpdate: (module: string) => checkPermission(`${module}:update` as Permission),
    canDelete: (module: string) => checkPermission(`${module}:delete` as Permission),
    canManageUsers: () => checkPermission(Permission.USERS_READ),
  };
};
