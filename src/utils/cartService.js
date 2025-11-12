import { API_BASE_URL } from './apiConfig';
import { authFetch } from './authFetch';

// Obtener el carrito del usuario
export const getCart = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/cart`);
    if (!response.ok) {
      throw new Error('Error al obtener el carrito');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Agregar producto al carrito
export const addToCart = async (productId, quantity = 1) => {
  try {
    const payload = { product_id: Number(productId), quantity: Number(quantity) };
    console.log('addToCart payload:', payload);
    const response = await authFetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error al agregar producto al carrito');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Eliminar producto del carrito
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar producto del carrito');
    }
    return await response.json();
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Actualizar cantidad de un producto en el carrito
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar cantidad en el carrito');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Limpiar el carrito
export const clearCart = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al limpiar el carrito');
    }
    return await response.json();
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}; 