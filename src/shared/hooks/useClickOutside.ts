import { useEffect, RefObject } from 'react';

/**
 * Hook que ejecuta un callback cuando se hace clic fuera del elemento referenciado
 * @param ref - Referencia al elemento (modal content)
 * @param handler - Función a ejecutar cuando se hace clic fuera
 * @param enabled - Si está habilitado el hook (por defecto true)
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Si el elemento no existe o el clic fue dentro del elemento, no hacer nada
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Ejecutar el handler (cerrar modal)
      handler();
    };

    // Agregar el event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
};
