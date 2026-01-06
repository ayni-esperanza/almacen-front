import { useCallback, useEffect, useState } from "react";

export type SortDirection = "asc" | "desc";

interface SortConfig<K extends string> {
  key: K;
  direction: SortDirection;
}

export interface SortColumnConfig<T> {
  selector: (item: T) => unknown;
  type?: "string" | "number" | "date";
  parser?: (value: unknown) => unknown;
  comparator?: (a: T, b: T) => number;
  locale?: string;
}

interface UseSortOptions<T, K extends string> {
  defaultKey: K;
  defaultDirection?: SortDirection;
  storageKey?: string;
  columns: Record<K, SortColumnConfig<T>>;
}

export const useSort = <T, K extends string>(
  options: UseSortOptions<T, K>
) => {
  const { defaultKey, defaultDirection = "asc", storageKey, columns } = options;

  const [sortConfig, setSortConfig] = useState<SortConfig<K>>(() => {
    if (!storageKey) return { key: defaultKey, direction: defaultDirection };
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as SortConfig<K>;
        if (parsed && parsed.key in columns) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
    return { key: defaultKey, direction: defaultDirection };
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(sortConfig));
    } catch {
      /* ignore */
    }
  }, [sortConfig, storageKey]);

  const toggleSort = useCallback((key: K) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  }, []);

  const sortData = useCallback(
    (data: T[]) => {
      const column = columns[sortConfig.key];
      if (!column) return data;

      const comparator = column.comparator;

      const compareValues = (a: T, b: T) => {
        if (comparator) return comparator(a, b);

        const rawA = column.selector(a);
        const rawB = column.selector(b);

        const parsedA = column.parser ? column.parser(rawA) : rawA;
        const parsedB = column.parser ? column.parser(rawB) : rawB;

        switch (column.type) {
          case "number": {
            const numA = Number(parsedA ?? 0);
            const numB = Number(parsedB ?? 0);
            return numA - numB;
          }
          case "date": {
            const timeA = parsedA instanceof Date ? parsedA.getTime() : new Date(parsedA as any).getTime();
            const timeB = parsedB instanceof Date ? parsedB.getTime() : new Date(parsedB as any).getTime();
            return timeA - timeB;
          }
          case "string":
          default: {
            const strA = (parsedA ?? "").toString();
            const strB = (parsedB ?? "").toString();
            return strA.localeCompare(strB, column.locale ?? "es", {
              sensitivity: "base",
            });
          }
        }
      };

      const sorted = [...data].sort(compareValues);
      return sortConfig.direction === "asc" ? sorted : sorted.reverse();
    },
    [columns, sortConfig]
  );

  return {
    sortConfig,
    toggleSort,
    sortData,
  };
};
