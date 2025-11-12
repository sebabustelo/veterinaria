import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "./useAuth";
import { API_BASE_URL } from "../utils/apiConfig";

export function useCart() {
  const context = useContext(CartContext);
  const { user, token } = useAuth();

  
  const clearCartBackend = async () => {
    if (user && token) {
      await fetch(`${API_BASE_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    context.clearCart(); // limpia el estado local
  };

  return {
    ...context,
    clearCartBackend, // exporta la nueva función
  };
} 