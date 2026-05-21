import { useCallback, useEffect, useMemo, useState } from "react";
import { movementsService } from "../services/movements.service";

export type CatalogType = "areas" | "empresas" | "proyectos";

export interface ReferenceCatalogs {
  areas: string[];
  empresas: string[];
  proyectos: string[];
}

const DEFAULT_CATALOGS: ReferenceCatalogs = {
  areas: [],
  empresas: [],
  proyectos: [],
};

const normalize = (value: string) => value.trim().toLowerCase();

const sortUnique = (values: string[]) => {
  const unique = new Map<string, string>();
  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = normalize(trimmed);
    if (!unique.has(key)) unique.set(key, trimmed);
  });
  return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
};

export const useReferenceCatalogs = () => {
  const [catalogs, setCatalogs] = useState<ReferenceCatalogs>(
    DEFAULT_CATALOGS,
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadCatalogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const [areas, empresas, proyectos] = await Promise.all([
        movementsService.getAreas(),
        movementsService.getEmpresas(),
        movementsService.getProyectos(),
      ]);

      setCatalogs({
        areas: sortUnique(areas),
        empresas: sortUnique(empresas),
        proyectos: sortUnique(proyectos),
      });
    } catch (error) {
      console.error("Error loading reference catalogs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  const addItem = useCallback(
    async (type: CatalogType, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      const exists = catalogs[type].some(
        (item) => normalize(item) === normalize(trimmed),
      );
      if (exists) return false;

      let created: string | null = null;
      if (type === "areas") created = await movementsService.createArea(trimmed);
      if (type === "empresas") created = await movementsService.createEmpresa(trimmed);
      if (type === "proyectos") created = await movementsService.createProyecto(trimmed);

      if (!created) return false;

      setCatalogs((prev) => ({
        ...prev,
        [type]: sortUnique([...prev[type], created]),
      }));

      return true;
    },
    [catalogs],
  );

  const updateItem = useCallback(
    async (type: CatalogType, previousName: string, nextName: string) => {
      const prevTrimmed = previousName.trim();
      const nextTrimmed = nextName.trim();
      if (!prevTrimmed || !nextTrimmed) return false;

      const duplicate = catalogs[type].some(
        (item) =>
          normalize(item) === normalize(nextTrimmed) &&
          normalize(item) !== normalize(prevTrimmed),
      );
      if (duplicate) return false;

      let updated: string | null = null;
      if (type === "areas") {
        updated = await movementsService.updateArea(prevTrimmed, nextTrimmed);
      }
      if (type === "empresas") {
        updated = await movementsService.updateEmpresa(prevTrimmed, nextTrimmed);
      }
      if (type === "proyectos") {
        updated = await movementsService.updateProyecto(prevTrimmed, nextTrimmed);
      }

      if (!updated) return false;

      setCatalogs((prev) => ({
        ...prev,
        [type]: sortUnique(
          prev[type].map((item) =>
            normalize(item) === normalize(prevTrimmed) ? updated : item,
          ),
        ),
      }));

      return true;
    },
    [catalogs],
  );

  const deleteItem = useCallback(
    async (type: CatalogType, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      let deleted = false;
      if (type === "areas") deleted = await movementsService.deleteArea(trimmed);
      if (type === "empresas")
        deleted = await movementsService.deleteEmpresa(trimmed);
      if (type === "proyectos")
        deleted = await movementsService.deleteProyecto(trimmed);

      if (!deleted) return false;

      setCatalogs((prev) => ({
        ...prev,
        [type]: prev[type].filter(
          (item) => normalize(item) !== normalize(trimmed),
        ),
      }));

      return true;
    },
    [],
  );

  const typeLabels = useMemo(
    () => ({
      areas: "Áreas",
      empresas: "Empresas",
      proyectos: "Proyectos",
    }),
    [],
  );

  return {
    catalogs,
    addItem,
    updateItem,
    deleteItem,
    typeLabels,
    isLoading,
    reload: loadCatalogs,
  };
};
