import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Función para hacer scroll al top
    const scrollToTop = () => {
      // Intentar múltiples métodos para asegurar compatibilidad
      if (window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
      }
      // Fallback para navegadores antiguos
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // Ejecutar inmediatamente
    scrollToTop();

    // Ejecutar después de que el DOM se haya actualizado (para componentes lazy)
    const timeout1 = setTimeout(scrollToTop, 0);
    
    // Ejecutar después de que el navegador haya pintado
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTop();
        // Un último intento después de un pequeño delay adicional
        setTimeout(scrollToTop, 50);
      });
    });

    return () => {
      clearTimeout(timeout1);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;

