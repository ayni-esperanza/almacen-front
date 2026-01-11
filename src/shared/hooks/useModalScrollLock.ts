import { useEffect } from 'react';

/**
 * Hook personalizado para bloquear el scroll del body cuando una modal está abierta
 * @param isOpen - Indica si la modal está abierta
 */
export const useModalScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Guardar el scroll actual
      const scrollY = window.scrollY;
      
      // Bloquear el scroll (scrollbar-gutter: stable ya reserva el espacio)
      document.body.style.overflow = 'hidden';

      return () => {
        // Restaurar el scroll al cerrar
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};
