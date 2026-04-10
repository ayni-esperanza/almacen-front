import { useCallback, useMemo, useState } from "react";

export type CatalogType = "areas" | "empresas" | "proyectos";

export interface ReferenceCatalogs {
  areas: string[];
  empresas: string[];
  proyectos: string[];
}

const STORAGE_KEY = "ayni.referenceCatalogs.v1";

const DEFAULT_CATALOGS: ReferenceCatalogs = {
  areas: [
    "Almacén",
    "Contabilidad",
    "Electricidad",
    "Extrusora",
    "Fibra",
    "Líneas de vida",
    "Mecánica",
    "Metalmecánica",
    "Oficina",
    "Pozos",
    "Torres de Enfriamiento",
  ],
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

const readCatalogs = (): ReferenceCatalogs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATALOGS;
    const parsed = JSON.parse(raw) as Partial<ReferenceCatalogs>;

    return {
      areas: sortUnique(parsed.areas ?? DEFAULT_CATALOGS.areas),
      empresas: sortUnique(parsed.empresas ?? DEFAULT_CATALOGS.empresas),
      proyectos: sortUnique(parsed.proyectos ?? DEFAULT_CATALOGS.proyectos),
    };
  } catch (error) {
    console.error("Error reading reference catalogs:", error);
    return DEFAULT_CATALOGS;
  }
};

const writeCatalogs = (catalogs: ReferenceCatalogs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalogs));
};

export const useReferenceCatalogs = () => {
  const [catalogs, setCatalogs] = useState<ReferenceCatalogs>(readCatalogs);

  const persist = useCallback((updater: (prev: ReferenceCatalogs) => ReferenceCatalogs) => {
    setCatalogs((prev) => {
      const next = updater(prev);
      writeCatalogs(next);
      return next;
    });
  }, []);

  const addItem = useCallback(
    (type: CatalogType, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      let added = false;
      persist((prev) => {
        const exists = prev[type].some((item) => normalize(item) === normalize(trimmed));
        if (exists) return prev;
        added = true;
        return {
          ...prev,
          [type]: sortUnique([...prev[type], trimmed]),
        };
      });
      return added;
    },
    [persist],
  );

  const updateItem = useCallback(
    (type: CatalogType, previousName: string, nextName: string) => {
      const prevTrimmed = previousName.trim();
      const nextTrimmed = nextName.trim();
      if (!prevTrimmed || !nextTrimmed) return false;

      let updated = false;
      persist((prev) => {
        const itemExists = prev[type].some(
          (item) => normalize(item) === normalize(prevTrimmed),
        );
        if (!itemExists) return prev;

        const duplicate = prev[type].some(
          (item) =>
            normalize(item) === normalize(nextTrimmed) &&
            normalize(item) !== normalize(prevTrimmed),
        );
        if (duplicate) return prev;

        updated = true;
        return {
          ...prev,
          [type]: sortUnique(
            prev[type].map((item) =>
              normalize(item) === normalize(prevTrimmed) ? nextTrimmed : item,
            ),
          ),
        };
      });
      return updated;
    },
    [persist],
  );

  const deleteItem = useCallback(
    (type: CatalogType, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      let deleted = false;
      persist((prev) => {
        const nextItems = prev[type].filter(
          (item) => normalize(item) !== normalize(trimmed),
        );
        if (nextItems.length === prev[type].length) return prev;
        deleted = true;
        return {
          ...prev,
          [type]: nextItems,
        };
      });
      return deleted;
    },
    [persist],
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
  };
};
