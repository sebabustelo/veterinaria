export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8229";


// Función helper para obtener headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Función helper para hacer peticiones autenticadas
export const authenticatedFetch = async (url, options = {}) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }

  return response;
};

// Función helper para crear pedidos
export const createOrder = async (orderData) => {
  const response = await authenticatedFetch("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al crear el pedido");
  }

  return response.json();
};

// Función helper para obtener pedidos del usuario
export const getUserOrders = async () => {
  const response = await authenticatedFetch("/orders/user");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al obtener los pedidos");
  }

  return response.json();
};
