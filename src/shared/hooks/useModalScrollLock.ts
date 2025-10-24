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
      
      // Bloquear el scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restaurar el scroll al cerrar
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};
