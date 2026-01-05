import React from "react";

type ConfirmState<T> = {
  open: boolean;
  mode: "single" | "bulk";
  target?: T | null;
};

type UseBulkSelectionOptions<T> = {
  getId: (item: T) => number;
  deleteItem: (id: number) => Promise<boolean>;
  refetch?: () => Promise<void>;
};

type UseBulkSelectionReturn<T> = {
  selectedIds: Set<number>;
  toggleSelection: (id: number) => void;
  toggleAll: (visibleItems: T[]) => void;
  handleMouseDown: (id: number, isSelectedRow: boolean) => void;
  handleMouseEnter: (id: number) => void;
  areAllVisibleSelected: (visibleItems: T[]) => boolean;
  requestBulkDelete: () => void;
  requestSingleDelete: (item: T) => void;
  handleConfirmDelete: () => Promise<void>;
  confirmState: ConfirmState<T>;
  closeConfirm: () => void;
  isConfirming: boolean;
  isRefreshing: boolean;
};

export function useBulkSelection<T>(
  options: UseBulkSelectionOptions<T>
): UseBulkSelectionReturn<T> {
  const { getId, deleteItem, refetch } = options;

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [confirmState, setConfirmState] = React.useState<ConfirmState<T>>({
    open: false,
    mode: "single",
    target: null,
  });
  const [isConfirming, setIsConfirming] = React.useState(false);

  const toggleSelection = React.useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = React.useCallback(
    (visibleItems: T[]) => {
      const visibleIds = visibleItems.map(getId);
      setSelectedIds((prev) => {
        const allVisibleSelected = visibleIds.every((id) => prev.has(id));
        if (allVisibleSelected) {
          const next = new Set(prev);
          visibleIds.forEach((id) => next.delete(id));
          return next;
        }
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    },
    [getId]
  );

  const areAllVisibleSelected = React.useCallback(
    (visibleItems: T[]) => {
      const visibleIds = visibleItems.map(getId);
      if (visibleIds.length === 0) return false;
      return visibleIds.every((id) => selectedIds.has(id));
    },
    [getId, selectedIds]
  );

  const handleMouseDown = React.useCallback(
    (_id: number, isSelectedRow: boolean) => {
      setIsDragging(true);
      setIsSelecting(!isSelectedRow);
    },
    []
  );

  const handleMouseEnter = React.useCallback(
    (id: number) => {
      if (!isDragging) return;
      setSelectedIds((prev) => {
        const shouldSelect = isSelecting;
        const alreadySelected = prev.has(id);
        if (shouldSelect === alreadySelected) return prev;
        const next = new Set(prev);
        if (shouldSelect) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    [isDragging, isSelecting]
  );

  React.useEffect(() => {
    if (!isDragging) return;
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging]);

  const requestBulkDelete = React.useCallback(() => {
    setConfirmState({ open: true, mode: "bulk", target: null });
  }, []);

  const requestSingleDelete = React.useCallback((item: T) => {
    setConfirmState({ open: true, mode: "single", target: item });
  }, []);

  const closeConfirm = React.useCallback(() => {
    setConfirmState({ open: false, mode: "single", target: null });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const deleteSelectedItems = React.useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsRefreshing(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteItem(id)));
      clearSelection();
      if (refetch) {
        await refetch();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [clearSelection, deleteItem, refetch, selectedIds]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!confirmState.open) return;
    setIsConfirming(true);
    try {
      if (confirmState.mode === "single" && confirmState.target) {
        setIsRefreshing(true);
        const id = getId(confirmState.target);
        const deleted = await deleteItem(id);
        if (deleted) {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          if (refetch) {
            await refetch();
          }
        }
      } else if (confirmState.mode === "bulk") {
        await deleteSelectedItems();
      }
    } finally {
      setIsConfirming(false);
      setIsRefreshing(false);
      setConfirmState({ open: false, mode: "single", target: null });
    }
  }, [confirmState, deleteItem, deleteSelectedItems, getId, refetch]);

  return {
    selectedIds,
    toggleSelection,
    toggleAll,
    handleMouseDown,
    handleMouseEnter,
    areAllVisibleSelected,
    requestBulkDelete,
    requestSingleDelete,
    handleConfirmDelete,
    confirmState,
    closeConfirm,
    isConfirming,
    isRefreshing,
  };
}
