import { UserRole } from '../../features/auth/types';

export enum Permission {
  // Inventory permissions
  INVENTORY_READ = 'inventory:read',
  INVENTORY_CREATE = 'inventory:create',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_DELETE = 'inventory:delete',

  // Movements permissions
  MOVEMENTS_READ = 'movements:read',
  MOVEMENTS_CREATE = 'movements:create',
  MOVEMENTS_UPDATE = 'movements:update',
  MOVEMENTS_DELETE = 'movements:delete',

  // Equipment permissions
  EQUIPMENT_READ = 'equipment:read',
  EQUIPMENT_CREATE = 'equipment:create',
  EQUIPMENT_UPDATE = 'equipment:update',
  EQUIPMENT_DELETE = 'equipment:delete',

  // Reports permissions
  REPORTS_READ = 'reports:read',

  // User management permissions
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
}

// Role permissions mapping (must match backend)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.JEFE]: [
    // Full access to everything
    Permission.INVENTORY_READ,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.MOVEMENTS_READ,
    Permission.MOVEMENTS_CREATE,
    Permission.MOVEMENTS_UPDATE,
    Permission.MOVEMENTS_DELETE,
    Permission.EQUIPMENT_READ,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.REPORTS_READ,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
  ],
  [UserRole.ASISTENTE]: [
    // Full access to everything (same as JEFE)
    Permission.INVENTORY_READ,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.MOVEMENTS_READ,
    Permission.MOVEMENTS_CREATE,
    Permission.MOVEMENTS_UPDATE,
    Permission.MOVEMENTS_DELETE,
    Permission.EQUIPMENT_READ,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.REPORTS_READ,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
  ],
  [UserRole.GERENTE]: [
    // Full access to everything (same as JEFE)
    Permission.INVENTORY_READ,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.MOVEMENTS_READ,
    Permission.MOVEMENTS_CREATE,
    Permission.MOVEMENTS_UPDATE,
    Permission.MOVEMENTS_DELETE,
    Permission.EQUIPMENT_READ,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.REPORTS_READ,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
  ],
  [UserRole.AYUDANTE]: [
    // Limited access: can create/read/update movements but not delete, no reports
    Permission.INVENTORY_READ,
    Permission.MOVEMENTS_READ,
    Permission.MOVEMENTS_CREATE,
    Permission.MOVEMENTS_UPDATE,
    // No MOVEMENTS_DELETE
    Permission.EQUIPMENT_READ,
    // No REPORTS permissions
    // No USERS permissions
  ],
};

// Helper functions for checking permissions
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};
