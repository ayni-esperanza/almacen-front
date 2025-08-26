// Export all services for easy importing
export { apiClient } from './api';
export { authService } from './auth.service';
export { inventoryService } from './inventory.service';
export { movementsService } from './movements.service';
export { equipmentService } from './equipment.service';

// Export types
export type { ApiResponse } from './api';
export type { AuthResponse, LoginResponse } from './auth.service';
export type { CreateProductData, UpdateProductData } from './inventory.service';
export type { CreateEntryData, CreateExitData, UpdateExitQuantityData } from './movements.service';
export type { CreateEquipmentData, UpdateEquipmentData, ReturnEquipmentData } from './equipment.service';
