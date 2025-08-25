export type TabType = 'stock' | 'entradas' | 'salidas' | 'equipos';

// Re-export types from features for convenience
export type { User, LoginCredentials } from '../../features/auth/types';
export type { EquipmentReport } from '../../features/equipment/types';
export type { Product } from '../../features/inventory/types';
export type { MovementEntry, MovementExit } from '../../features/movements/types';
