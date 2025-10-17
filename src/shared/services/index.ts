// Export all services for easy importing
export { apiClient } from './api.ts';
export { authService } from './auth.service.ts';
export { inventoryService } from './inventory.service.ts';
export { movementsService } from './movements.service.ts';
export { equipmentService } from './equipment.service.ts';

// Export types
export type { ApiResponse } from './api.ts';
export type { AuthResponse, LoginResponse } from './auth.service.ts';
export type { CreateProductData, UpdateProductData } from './inventory.service.ts';
export type { CreateEntryData, CreateExitData, UpdateEntryData, UpdateExitData, UpdateExitQuantityData } from './movements.service.ts';
export type { CreateEquipmentData, UpdateEquipmentData, ReturnEquipmentData } from './equipment.service.ts';
