import { API_BASE_URL } from './apiConfig';
import { authFetch } from './authFetch';

// Crear un nuevo pedido
export const createOrder = async (orderData) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el pedido');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Obtener todos los pedidos (admin)
export const getOrders = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error('Error al obtener los pedidos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Obtener pedidos del usuario actual
export const getOrdersByUser = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders/user`);
    if (!response.ok) {
      throw new Error('Error al obtener los pedidos del usuario');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Obtener un pedido por ID
export const getOrderById = async (orderId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Error al obtener el pedido');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Actualizar estado del pedido
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar el estado del pedido');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Actualizar estado del pago
export const updatePaymentStatus = async (orderId, paymentStatus, transactionId = null) => {
  try {
    const payload = { payment_status: paymentStatus };
    if (transactionId) {
      payload.transaction_id = transactionId;
    }
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar el estado del pago');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Eliminar pedido
export const deleteOrder = async (orderId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el pedido');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}; 