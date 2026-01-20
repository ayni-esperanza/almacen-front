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

type RefetchOptions = {
  silent?: boolean;
};

export interface UseMovementsReturn {
  entries: MovementEntry[];
  exits: MovementExit[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  filterEPP: boolean;
  setFilterEPP: (filter: boolean) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  searchTermEntries: string;
  setSearchTermEntries: (term: string) => void;
  searchTermExits: string;
  setSearchTermExits: (term: string) => void;
  refetchEntries: (options?: RefetchOptions) => Promise<void>;
  refetchExits: (options?: RefetchOptions) => Promise<void>;
  createEntry: (entryData: CreateEntryData) => Promise<MovementEntry | null>;
  createExit: (exitData: CreateExitData) => Promise<MovementExit | null>;
  updateExitQuantity: (
    id: number,
    quantityData: UpdateExitQuantityData,
  ) => Promise<MovementExit | null>;
  updateEntry: (
    id: number,
    entryData: UpdateEntryData,
  ) => Promise<MovementEntry | null>;
  updateExit: (
    id: number,
    exitData: UpdateExitData,
  ) => Promise<MovementExit | null>;
  deleteEntry: (id: number) => Promise<void>;
  deleteExit: (id: number) => Promise<void>;
  // Pagination states
  entriesPage: number;
  entriesLimit: number;
  entriesTotalPages: number;
  entriesTotalItems: number;
  setEntriesPage: (page: number) => void;
  setEntriesLimit: (limit: number) => void;
  exitsPage: number;
  exitsLimit: number;
  exitsTotalPages: number;
  exitsTotalItems: number;
  setExitsPage: (page: number) => void;
  setExitsLimit: (limit: number) => void;
}

export const useMovements = (): UseMovementsReturn => {
  const [entries, setEntries] = useState<MovementEntry[]>([]);
  const [exits, setExits] = useState<MovementExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterEPP, setFilterEPP] = useState(false);
  const [searchTermEntries, setSearchTermEntries] = useState("");
  const [searchTermExits, setSearchTermExits] = useState("");

  // Pagination states for entries
  const [entriesPage, setEntriesPage] = useState(1);
  const [entriesLimit, setEntriesLimit] = useState(100);
  const [entriesTotalPages, setEntriesTotalPages] = useState(0);
  const [entriesTotalItems, setEntriesTotalItems] = useState(0);

  // Pagination states for exits
  const [exitsPage, setExitsPage] = useState(1);
  const [exitsLimit, setExitsLimit] = useState(100);
  const [exitsTotalPages, setExitsTotalPages] = useState(0);
  const [exitsTotalItems, setExitsTotalItems] = useState(0);

  const isInitialMount = useRef(true);
  const fetchAbortController = useRef<AbortController | null>(null);
  const searchEntriesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const searchExitsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const searchTermEntriesRef = useRef(searchTermEntries);
  const searchTermExitsRef = useRef(searchTermExits);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await movementsService.getAllEntries(
        startDate || undefined,
        endDate || undefined,
        entriesPage,
        entriesLimit,
        filterEPP ? "epp" : undefined,
        searchTermEntriesRef.current || undefined,
      );
      setEntries(response.data);
      setEntriesTotalPages(response.pagination.totalPages);
      setEntriesTotalItems(response.pagination.total);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [startDate, endDate, entriesPage, entriesLimit, filterEPP]);

  const fetchExits = useCallback(async () => {
    try {
      const response = await movementsService.getAllExits(
        startDate || undefined,
        endDate || undefined,
        exitsPage,
        exitsLimit,
        filterEPP ? "epp" : undefined,
        searchTermExitsRef.current || undefined,
      );
      setExits(response.data);
      setExitsTotalPages(response.pagination.totalPages);
      setExitsTotalItems(response.pagination.total);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [startDate, endDate, exitsPage, exitsLimit, filterEPP]);

  const fetchBoth = useCallback(
    async (options?: RefetchOptions) => {
      // Cancelar peticiones anteriores si existen
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
      fetchAbortController.current = new AbortController();

      const isSilent = options?.silent ?? false;
      try {
        if (isSilent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);
        // Ejecutar ambas peticiones en paralelo
        await Promise.all([fetchEntries(), fetchExits()]);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (isSilent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
        fetchAbortController.current = null;
      }
    },
    [fetchEntries, fetchExits],
  );

  const refetchEntries = useCallback(
    async (options?: RefetchOptions) => {
      const isSilent = options?.silent;
      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        await fetchEntries();
      } finally {
        if (isSilent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [fetchEntries],
  );

  const refetchExits = useCallback(
    async (options?: RefetchOptions) => {
      const isSilent = options?.silent;
      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        await fetchExits();
      } finally {
        if (isSilent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [fetchExits],
  );

  const createEntry = async (
    entryData: CreateEntryData,
  ): Promise<MovementEntry | null> => {
    try {
      // Conecta directamente con el servicio de creación de entradas
      const newEntry = await movementsService.createMovementEntry(entryData);
      if (newEntry) {
        await refetchEntries({ silent: true });
      }
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear entrada");
      throw err;
    }
  };

  const createExit = async (
    exitData: CreateExitData,
  ): Promise<MovementExit | null> => {
    try {
      const newExit = await movementsService.createExit(exitData);
      if (newExit) {
        await refetchExits({ silent: true });
      }
      return newExit;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear salida");
      throw err;
    }
  };

  const updateExitQuantity = async (
    id: number,
    quantityData: UpdateExitQuantityData,
  ): Promise<MovementExit | null> => {
    try {
      const updatedExit = await movementsService.updateExitQuantity(
        id.toString(),
        quantityData,
      );
      if (updatedExit) {
        await refetchExits({ silent: true });
      }
      return updatedExit;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar cantidad",
      );
      throw err;
    }
  };

  const updateEntry = async (
    id: number,
    entryData: UpdateEntryData,
  ): Promise<MovementEntry | null> => {
    try {
      const updatedEntry = await movementsService.updateEntry(id, entryData);
      if (updatedEntry) {
        await refetchEntries({ silent: true });
      }
      return updatedEntry;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la entrada",
      );
      throw err;
    }
  };

  const updateExit = async (
    id: number,
    exitData: UpdateExitData,
  ): Promise<MovementExit | null> => {
    try {
      const updatedExit = await movementsService.updateExit(id, exitData);
      if (updatedExit) {
        await refetchExits({ silent: true });
      }
      return updatedExit;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la salida",
      );
      throw err;
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await movementsService.deleteEntry(id);
      await refetchEntries({ silent: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar entrada",
      );
      throw err; // Re-lanzamos para que el componente UI sepa que falló
    } finally {
      setRefreshing(false);
    }
  };

  const deleteExit = async (id: number) => {
    try {
      await movementsService.deleteExit(id);
      await refetchExits({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar salida");
      throw err;
    } finally {
      setRefreshing(false);
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

  // Debounce para búsqueda de entradas
  useEffect(() => {
    // Actualizar el ref con el valor actual
    searchTermEntriesRef.current = searchTermEntries;

    // Limpiar el timeout anterior si existe
    if (searchEntriesTimerRef.current) {
      clearTimeout(searchEntriesTimerRef.current);
    }

    // Si es el montaje inicial, no hacer búsqueda
    if (isInitialMount.current) {
      return;
    }

    // Configurar nuevo timeout de 700ms
    searchEntriesTimerRef.current = setTimeout(() => {
      setRefreshing(true);
      fetchEntries().finally(() => setRefreshing(false));
    }, 700);

    return () => {
      if (searchEntriesTimerRef.current) {
        clearTimeout(searchEntriesTimerRef.current);
      }
    };
  }, [searchTermEntries, fetchEntries]);

  // Debounce para búsqueda de salidas
  useEffect(() => {
    // Actualizar el ref con el valor actual
    searchTermExitsRef.current = searchTermExits;

    // Limpiar el timeout anterior si existe
    if (searchExitsTimerRef.current) {
      clearTimeout(searchExitsTimerRef.current);
    }

    // Si es el montaje inicial, no hacer búsqueda
    if (isInitialMount.current) {
      return;
    }

    // Configurar nuevo timeout de 700ms
    searchExitsTimerRef.current = setTimeout(() => {
      setRefreshing(true);
      fetchExits().finally(() => setRefreshing(false));
    }, 700);

    return () => {
      if (searchExitsTimerRef.current) {
        clearTimeout(searchExitsTimerRef.current);
      }
    };
  }, [searchTermExits, fetchExits]);

  // Refetch entries when pagination changes
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entriesPage, entriesLimit]);

  // Refetch exits when pagination changes
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchExits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exitsPage, exitsLimit]);

  return {
    entries,
    exits,
    loading,
    refreshing,
    error,
    startDate,
    endDate,
    filterEPP,
    setFilterEPP,
    setStartDate,
    setEndDate,
    searchTermEntries,
    setSearchTermEntries,
    searchTermExits,
    setSearchTermExits,
    refetchEntries,
    refetchExits,
    createEntry,
    createExit,
    updateExitQuantity,
    updateEntry,
    updateExit,
    deleteEntry,
    deleteExit,
    // Pagination returns
    entriesPage,
    entriesLimit,
    entriesTotalPages,
    entriesTotalItems,
    setEntriesPage,
    setEntriesLimit,
    exitsPage,
    exitsLimit,
    exitsTotalPages,
    exitsTotalItems,
    setExitsPage,
    setExitsLimit,
  };
};
