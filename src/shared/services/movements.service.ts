import { apiClient } from './api';
import { MovementEntry, MovementExit } from '../../features/movements/types';

export interface CreateEntryData {
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
}

export interface CreateExitData {
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
  proyecto?: string;
}

export interface UpdateExitQuantityData {
  cantidad: number;
}

class MovementsService {
  // === ENTRIES ===
  async getAllEntries(): Promise<MovementEntry[]> {
    const response = await apiClient.get<MovementEntry[]>('/movements/entries');
    
    if (response.error) {
      console.error('Error fetching entries:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async createEntry(entryData: CreateEntryData): Promise<MovementEntry | null> {
    const response = await apiClient.post<MovementEntry>('/movements/entries', entryData);
    
    if (response.error) {
      console.error('Error creating entry:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }

  // === EXITS ===
  async getAllExits(): Promise<MovementExit[]> {
    const response = await apiClient.get<MovementExit[]>('/movements/exits');
    
    if (response.error) {
      console.error('Error fetching exits:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async createExit(exitData: CreateExitData): Promise<MovementExit | null> {
    const response = await apiClient.post<MovementExit>('/movements/exits', exitData);
    
    if (response.error) {
      console.error('Error creating exit:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }

  async updateExitQuantity(id: string, quantityData: UpdateExitQuantityData): Promise<MovementExit | null> {
    const response = await apiClient.patch<MovementExit>(`/movements/exits/${id}/quantity`, quantityData);
    
    if (response.error) {
      console.error('Error updating exit quantity:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }
}

export const movementsService = new MovementsService();
