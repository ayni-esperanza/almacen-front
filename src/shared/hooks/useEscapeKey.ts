import { useEffect } from 'react';

/**
 * Hook personalizado para cerrar modales/formularios con la tecla ESC
 * @param onEscape - Función callback a ejecutar cuando se presiona ESC
 * @param isActive - Indica si el listener está activo (por defecto true)
 */
export const useEscapeKey = (onEscape: () => void, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onEscape, isActive]);
};
