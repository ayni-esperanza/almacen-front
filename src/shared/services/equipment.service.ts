import { apiClient } from './api';
import { EquipmentReport } from '../../features/equipment/types';

export interface CreateEquipmentData {
  equipo: string;
  serieCodigo: string;
  cantidad: number;
  estadoEquipo: 'Bueno' | 'Regular' | 'Malo' | 'En_Reparacion' | 'Danado';
  responsable: string;
  fechaSalida: string;
  horaSalida: string;
  areaProyecto: string;
  firma: string;
}

export interface UpdateEquipmentData extends Partial<CreateEquipmentData> {}

export interface ReturnEquipmentData {
  fechaRetorno: string;
  horaRetorno: string;
  estadoRetorno: 'Bueno' | 'Regular' | 'Malo' | 'Danado';
  firmaRetorno: string;
}

class EquipmentService {
  async getAllEquipment(): Promise<EquipmentReport[]> {
    const response = await apiClient.get<EquipmentReport[]>('/equipment');
    
    if (response.error) {
      console.error('Error fetching equipment:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getEquipment(id: string): Promise<EquipmentReport | null> {
    const response = await apiClient.get<EquipmentReport>(`/equipment/${id}`);
    
    if (response.error) {
      console.error('Error fetching equipment:', response.error);
      return null;
    }
    
    return response.data || null;
  }

  async createEquipmentReport(equipmentData: CreateEquipmentData): Promise<EquipmentReport | null> {
    const response = await apiClient.post<EquipmentReport>('/equipment', equipmentData);
    
    if (response.error) {
      console.error('Error creating equipment report:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }

  async updateEquipment(id: string, equipmentData: UpdateEquipmentData): Promise<EquipmentReport | null> {
    const response = await apiClient.patch<EquipmentReport>(`/equipment/${id}`, equipmentData);
    
    if (response.error) {
      console.error('Error updating equipment:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }

  async returnEquipment(id: string, returnData: ReturnEquipmentData): Promise<EquipmentReport | null> {
    const response = await apiClient.patch<EquipmentReport>(`/equipment/${id}/return`, returnData);
    
    if (response.error) {
      console.error('Error returning equipment:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/equipment/${id}`);
    
    if (response.error) {
      console.error('Error deleting equipment:', response.error);
      return false;
    }
    
    return true;
  }
}

export const equipmentService = new EquipmentService();
