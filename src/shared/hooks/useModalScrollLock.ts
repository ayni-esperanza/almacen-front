import { useEffect } from 'react';

/**
 * Hook personalizado para bloquear el scroll del body cuando una modal está abierta
 * @param isOpen - Indica si la modal está abierta
 */
export const useModalScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Guardar el scroll actual y el padding original
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Bloquear el scroll y compensar el ancho del scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        // Restaurar el scroll al cerrar
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};
