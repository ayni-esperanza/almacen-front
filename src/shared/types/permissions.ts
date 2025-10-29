import { UserRole } from "../../features/auth/types";

export enum Permission {
  // View/Navigation permissions (para controlar qué secciones se muestran en el menú)
  VIEW_INVENTORY = "view:inventory",
  VIEW_MOVEMENTS = "view:movements",
  VIEW_EQUIPMENT = "view:equipment",
  VIEW_REPORTS = "view:reports",
  VIEW_USERS = "view:users",
  VIEW_PROVIDERS = "view:providers",

  // Inventory permissions
  INVENTORY_READ = "inventory:read",
  INVENTORY_CREATE = "inventory:create",
  INVENTORY_UPDATE = "inventory:update",
  INVENTORY_DELETE = "inventory:delete",

  // Movements permissions
  MOVEMENTS_READ = "movements:read",
  MOVEMENTS_CREATE = "movements:create",
  MOVEMENTS_UPDATE = "movements:update",
  MOVEMENTS_DELETE = "movements:delete",

  // Equipment permissions
  EQUIPMENT_READ = "equipment:read",
  EQUIPMENT_CREATE = "equipment:create",
  EQUIPMENT_UPDATE = "equipment:update",
  EQUIPMENT_DELETE = "equipment:delete",

  // Reports permissions
  REPORTS_READ = "reports:read",

  // User management permissions
  USERS_READ = "users:read",
  USERS_CREATE = "users:create",
  USERS_UPDATE = "users:update",
  USERS_DELETE = "users:delete",

  // Provider permissions
  PROVIDERS_READ = "providers:read",
  PROVIDERS_CREATE = "providers:create",
  PROVIDERS_UPDATE = "providers:update",
  PROVIDERS_DELETE = "providers:delete",
}

// Role permissions mapping (must match backend)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // GERENTE: Puede ver todas las secciones
  [UserRole.GERENTE]: [
    // View permissions - todas las secciones
    Permission.VIEW_INVENTORY,
    Permission.VIEW_MOVEMENTS,
    Permission.VIEW_EQUIPMENT,
    Permission.VIEW_REPORTS,
    Permission.VIEW_USERS,
    Permission.VIEW_PROVIDERS,

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
    Permission.PROVIDERS_READ,
    Permission.PROVIDERS_CREATE,
    Permission.PROVIDERS_UPDATE,
    Permission.PROVIDERS_DELETE,
  ],

  // AYUDANTE: Stock, Movimientos, Equipo y Reportes (NO Usuarios, NO Proveedores)
  [UserRole.AYUDANTE]: [
    // View permissions - solo Stock, Movimientos, Equipo, Reportes
    Permission.VIEW_INVENTORY,
    Permission.VIEW_MOVEMENTS,
    Permission.VIEW_EQUIPMENT,
    Permission.VIEW_REPORTS,

    // Full access to allowed sections
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
    // No USERS permissions
    // No PROVIDERS permissions
  ],

  // ASISTENTE: Stock, Movimientos, Equipo (NO Reportes, NO Usuarios, NO Proveedores)
  [UserRole.ASISTENTE]: [
    // View permissions - solo Stock, Movimientos, Equipo
    Permission.VIEW_INVENTORY,
    Permission.VIEW_MOVEMENTS,
    Permission.VIEW_EQUIPMENT,

    // Full access to allowed sections
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
    // No REPORTS permissions
    // No USERS permissions
    // No PROVIDERS permissions
  ],
};

// Helper functions for checking permissions
export const hasPermission = (
  userRole: UserRole,
  permission: Permission
): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};

export const hasAnyPermission = (
  userRole: UserRole,
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

export const hasAllPermissions = (
  userRole: UserRole,
  permissions: Permission[]
): boolean => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};
