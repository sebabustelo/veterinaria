import React, { useState, useEffect } from 'react';
import './PWAInstallButton.css';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevenir el prompt automático
      e.preventDefault();
      // Guardar el evento para usarlo después
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA');
    } else {
      console.log('Usuario rechazó instalar la PWA');
    }

    // Limpiar el prompt guardado
    setDeferredPrompt(null);
    setShowButton(false);
  };

  // No mostrar el botón si ya está instalada o no hay prompt disponible
  if (!showButton || !deferredPrompt) {
    return null;
  }

  return (
    <button
      className="pwa-install-button"
      onClick={handleInstallClick}
      aria-label="Instalar aplicación Vettix"
    >
      <i className="fa-solid fa-download"></i>
      <span>Instalar App</span>
    </button>
  );
};

export default PWAInstallButton;

