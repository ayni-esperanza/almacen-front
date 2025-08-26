import { useState, useEffect } from 'react';
import { EquipmentReport } from '../types';
import { equipmentService, CreateEquipmentData, UpdateEquipmentData, ReturnEquipmentData } from '../../../shared/services/equipment.service';

export interface UseEquipmentReturn {
  equipment: EquipmentReport[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createEquipmentReport: (equipmentData: CreateEquipmentData) => Promise<EquipmentReport | null>;
  updateEquipment: (id: number, equipmentData: UpdateEquipmentData) => Promise<EquipmentReport | null>;
  returnEquipment: (id: number, returnData: ReturnEquipmentData) => Promise<EquipmentReport | null>;
  deleteEquipment: (id: number) => Promise<boolean>;
}

export const useEquipment = (): UseEquipmentReturn => {
  const [equipment, setEquipment] = useState<EquipmentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getAllEquipment();
      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchEquipment();
  };

  const createEquipmentReport = async (equipmentData: CreateEquipmentData): Promise<EquipmentReport | null> => {
    try {
      const newEquipment = await equipmentService.createEquipmentReport(equipmentData);
      if (newEquipment) {
        await refetch(); // Refresh the list
      }
      return newEquipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reporte de equipo');
      throw err;
    }
  };

  const updateEquipment = async (id: number, equipmentData: UpdateEquipmentData): Promise<EquipmentReport | null> => {
    try {
      const updatedEquipment = await equipmentService.updateEquipment(id.toString(), equipmentData);
      if (updatedEquipment) {
        await refetch(); // Refresh the list
      }
      return updatedEquipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar equipo');
      throw err;
    }
  };

  const returnEquipment = async (id: number, returnData: ReturnEquipmentData): Promise<EquipmentReport | null> => {
    try {
      const returnedEquipment = await equipmentService.returnEquipment(id.toString(), returnData);
      if (returnedEquipment) {
        await refetch(); // Refresh the list
      }
      return returnedEquipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar retorno');
      throw err;
    }
  };

  const deleteEquipment = async (id: number): Promise<boolean> => {
    try {
      const success = await equipmentService.deleteEquipment(id.toString());
      if (success) {
        await refetch(); // Refresh the list
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar equipo');
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    error,
    refetch,
    createEquipmentReport,
    updateEquipment,
    returnEquipment,
    deleteEquipment
  };
};
