import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Si duration es null, 0 o undefined, no cerrar automáticamente
    if (duration == null || duration === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300); // Tiempo para la animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300); // Tiempo para la animación de salida
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const formatMessage = (msg) => {
    if (typeof msg === 'string') {
      return msg.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < msg.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
    return msg;
  };

  return (
    <div className={`toast ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{formatMessage(message)}</div>
      <button className="toast-close" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default Toast; 