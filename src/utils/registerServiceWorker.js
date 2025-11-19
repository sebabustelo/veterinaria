// Registrar Service Worker para PWA
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js', { updateViaCache: 'none' })
        .then((registration) => {
          console.log('Service Worker registrado exitosamente:', registration.scope);
          
          // Verificar actualizaciones inmediatamente y luego periódicamente
          registration.update();
          
          // Verificar actualizaciones cada 5 minutos
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);
          
          // Escuchar actualizaciones del service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Hay una nueva versión disponible
                  console.log('Nueva versión del Service Worker disponible');
                  // Recargar la página para usar la nueva versión
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Error al registrar Service Worker:', error);
        });
    });
  }
};

// Manejar el evento de instalación de PWA (el componente PWAInstallButton maneja el prompt)
export const handlePWAInstall = () => {
  window.addEventListener('appinstalled', () => {
    console.log('PWA instalada exitosamente');
  });
};

