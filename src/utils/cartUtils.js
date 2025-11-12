// Constantes para el carrito
export const CART_STORAGE_KEY = 'cart';
export const CART_ITEM_DEFAULT_QUANTITY = 1;

// Función para obtener el estado inicial del carrito desde localStorage
export const getInitialCartState = () => {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            return { items: parsedCart };
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
    }
    console.log('No saved cart found, starting with empty cart');
    return { items: [] };
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
}; 