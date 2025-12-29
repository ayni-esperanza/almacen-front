import { useState, useEffect } from 'react';
import { MovementEntry, MovementExit } from '../types/index.ts';
import { movementsService, CreateEntryData, CreateExitData, UpdateEntryData, UpdateExitData, UpdateExitQuantityData } from '../../../shared/services/movements.service.ts';

export interface UseMovementsReturn {
  entries: MovementEntry[];
  exits: MovementExit[];
  loading: boolean;
  error: string | null;
  refetchEntries: () => Promise<void>;
  refetchExits: () => Promise<void>;
  createEntry: (entryData: CreateEntryData) => Promise<MovementEntry | null>;
  createExit: (exitData: CreateExitData) => Promise<MovementExit | null>;
  updateExitQuantity: (id: number, quantityData: UpdateExitQuantityData) => Promise<MovementExit | null>;
  updateEntry: (id: number, entryData: UpdateEntryData) => Promise<MovementEntry | null>;
  updateExit: (id: number, exitData: UpdateExitData) => Promise<MovementExit | null>;
  deleteEntry: (id: number) => Promise<void>;
  deleteExit: (id: number) => Promise<void>;
}

export const useMovements = (): UseMovementsReturn => {
  const [entries, setEntries] = useState<MovementEntry[]>([]);
  const [exits, setExits] = useState<MovementExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movementsService.getAllEntries();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar entradas');
    } finally {
      setLoading(false);
    }
  };

  const fetchExits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movementsService.getAllExits();
      setExits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar salidas');
    } finally {
      setLoading(false);
    }
  };

  const refetchEntries = async () => {
    await fetchEntries();
  };

  const refetchExits = async () => {
    await fetchExits();
  };

  const createEntry = async (entryData: CreateEntryData): Promise<MovementEntry | null> => {
    try {
      // Conecta directamente con el servicio de creación de entradas
      const newEntry = await movementsService.createMovementEntry(entryData);
      if (newEntry) {
        await refetchEntries(); // Refresh the list
      }
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear entrada');
      throw err;
    }
  };

  const createExit = async (exitData: CreateExitData): Promise<MovementExit | null> => {
    try {
      const newExit = await movementsService.createExit(exitData);
      if (newExit) {
        await refetchExits(); // Refresh the list
      }
      return newExit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear salida');
      throw err;
    }
  };

  const updateExitQuantity = async (id: number, quantityData: UpdateExitQuantityData): Promise<MovementExit | null> => {
    try {
      const updatedExit = await movementsService.updateExitQuantity(id.toString(), quantityData);
      if (updatedExit) {
        await refetchExits(); // Refresh the list
      }
      return updatedExit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cantidad');
      throw err;
    }
  };

  const updateEntry = async (id: number, entryData: UpdateEntryData): Promise<MovementEntry | null> => {
    try {
      const updatedEntry = await movementsService.updateEntry(id, entryData);
      if (updatedEntry) {
        await refetchEntries();
      }
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la entrada');
      throw err;
    }
  };

  const updateExit = async (id: number, exitData: UpdateExitData): Promise<MovementExit | null> => {
    try {
      const updatedExit = await movementsService.updateExit(id, exitData);
      if (updatedExit) {
        await refetchExits();
      }
      return updatedExit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la salida');
      throw err;
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      setLoading(true);
      await movementsService.deleteEntry(id);
      // Refrescamos para que desaparezca de la tabla y se actualice el stock visualmente si lo muestras
      await refetchEntries();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar entrada"
      );
      throw err; // Re-lanzamos para que el componente UI sepa que falló
    } finally {
      setLoading(false);
    }
  };

  const deleteExit = async (id: number) => {
    try {
      setLoading(true);
      await movementsService.deleteExit(id);
      await refetchExits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar salida");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEntries();
    fetchExits();
  }, []);

  return {
    entries,
    exits,
    loading,
    error,
    refetchEntries,
    refetchExits,
    createEntry,
    createExit,
    updateExitQuantity,
    updateEntry,
    updateExit,
    deleteEntry,
    deleteExit,
  };
};