// Registrar Service Worker para PWA
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado exitosamente:', registration.scope);
          
          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
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

