import { useCallback } from 'react';

/**
 * Hook para manejar clicks en filas de tabla permitiendo selección de texto
 * Solo ejecuta la acción onClick si no hay texto seleccionado
 * @param onClick - Función a ejecutar cuando se hace click sin selección de texto
 * @returns Función handleClick para usar en el evento onClick
 */
export const useSelectableRowClick = (onClick: () => void) => {
  const handleClick = useCallback(() => {
    // Solo ejecutar onClick si no hay texto seleccionado
    const selection = window.getSelection();
    if (selection && selection.toString().length === 0) {
      onClick();
    }
  }, [onClick]);

  return handleClick;
};
