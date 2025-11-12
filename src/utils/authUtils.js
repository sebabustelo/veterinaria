import { API_BASE_URL } from './apiConfig';

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Verificar si el token es válido
export const checkTokenValidity = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.ok;
    } catch {
        return false;
    }
};

// Traducir códigos de error de Firebase
export const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No existe una cuenta con este email.';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta.';
        case 'auth/email-already-in-use':
            return 'Este email ya está registrado.';
        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres.';
        case 'auth/invalid-email':
            return 'Email inválido.';
        case 'auth/popup-closed-by-user':
            return 'Login cancelado por el usuario.';
        case 'auth/popup-blocked':
            return 'El popup fue bloqueado. Por favor, habilita los popups para este sitio.';
        case 'auth/account-exists-with-different-credential':
            return 'Ya existe una cuenta con este email usando otro método de login.';
        case 'auth/operation-not-allowed':
            return 'Este método de login no está habilitado.';
        case 'auth/user-disabled':
            return 'Esta cuenta ha sido deshabilitada.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Intenta más tarde.';
        case 'auth/network-request-failed':
            return 'Error de conexión. Verifica tu internet.';
        default:
            return 'Error de autenticación. Intenta nuevamente.';
    }
};

// Redirigir al login si no está autenticado
export const requireAuth = (navigate) => {
  if (!isAuthenticated()) {
    navigate('/login');
    return false;
  }
  return true;
}; 