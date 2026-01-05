import { useState, useEffect, useRef, useCallback } from "react";
import { MovementEntry, MovementExit } from "../types/index.ts";
import {
  movementsService,
  CreateEntryData,
  CreateExitData,
  UpdateEntryData,
  UpdateExitData,
  UpdateExitQuantityData,
} from "../../../shared/services/movements.service.ts";

export interface UseMovementsReturn {
  entries: MovementEntry[];
  exits: MovementExit[];
  loading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  refetchEntries: () => Promise<void>;
  refetchExits: () => Promise<void>;
  createEntry: (entryData: CreateEntryData) => Promise<MovementEntry | null>;
  createExit: (exitData: CreateExitData) => Promise<MovementExit | null>;
  updateExitQuantity: (
    id: number,
    quantityData: UpdateExitQuantityData
  ) => Promise<MovementExit | null>;
  updateEntry: (
    id: number,
    entryData: UpdateEntryData
  ) => Promise<MovementEntry | null>;
  updateExit: (
    id: number,
    exitData: UpdateExitData
  ) => Promise<MovementExit | null>;
  deleteEntry: (id: number) => Promise<void>;
  deleteExit: (id: number) => Promise<void>;
}

export const useMovements = (): UseMovementsReturn => {
  const [entries, setEntries] = useState<MovementEntry[]>([]);
  const [exits, setExits] = useState<MovementExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isInitialMount = useRef(true);
  const fetchAbortController = useRef<AbortController | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const data = await movementsService.getAllEntries(
        startDate || undefined,
        endDate || undefined
      );
      setEntries(data);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [startDate, endDate]);

  const fetchExits = useCallback(async () => {
    try {
      const data = await movementsService.getAllExits(
        startDate || undefined,
        endDate || undefined
      );
      setExits(data);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [startDate, endDate]);

  const fetchBoth = useCallback(async () => {
    // Cancelar peticiones anteriores si existen
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
    }
    fetchAbortController.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      // Ejecutar ambas peticiones en paralelo
      await Promise.all([fetchEntries(), fetchExits()]);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      fetchAbortController.current = null;
    }
  }, [fetchEntries, fetchExits]);

  const refetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      await fetchEntries();
    } finally {
      setLoading(false);
    }
  }, [fetchEntries]);

  const refetchExits = useCallback(async () => {
    setLoading(true);
    try {
      await fetchExits();
    } finally {
      setLoading(false);
    }
  }, [fetchExits]);

  const createEntry = async (
    entryData: CreateEntryData
  ): Promise<MovementEntry | null> => {
    try {
      // Conecta directamente con el servicio de creación de entradas
      const newEntry = await movementsService.createMovementEntry(entryData);
      if (newEntry) {
        await refetchEntries(); // Refresh the list
      }
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear entrada");
      throw err;
    }
  };

  const createExit = async (
    exitData: CreateExitData
  ): Promise<MovementExit | null> => {
    try {
      const newExit = await movementsService.createExit(exitData);
      if (newExit) {
        await refetchExits(); // Refresh the list
      }
      return newExit;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear salida");
      throw err;
    }
  };

  const updateExitQuantity = async (
    id: number,
    quantityData: UpdateExitQuantityData
  ): Promise<MovementExit | null> => {
    try {
      const updatedExit = await movementsService.updateExitQuantity(
        id.toString(),
        quantityData
      );
      if (updatedExit) {
        await refetchExits(); // Refresh the list
      }
      return updatedExit;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar cantidad"
      );
      throw err;
    }
  };

  const updateEntry = async (
    id: number,
    entryData: UpdateEntryData
  ): Promise<MovementEntry | null> => {
    try {
      const updatedEntry = await movementsService.updateEntry(id, entryData);
      if (updatedEntry) {
        await refetchEntries();
      }
      return updatedEntry;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la entrada"
      );
      throw err;
    }
  };

  const updateExit = async (
    id: number,
    exitData: UpdateExitData
  ): Promise<MovementExit | null> => {
    try {
      const updatedExit = await movementsService.updateExit(id, exitData);
      if (updatedExit) {
        await refetchExits();
      }
      return updatedExit;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la salida"
      );
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
    fetchBoth();
  }, [fetchBoth]);

  // Refetch when date filters change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Debounce: esperar 300ms antes de hacer la petición
    const timeoutId = setTimeout(() => {
      fetchBoth();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, fetchBoth]);

  return {
    entries,
    exits,
    loading,
    error,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
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
