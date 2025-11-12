import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ProductContext } from './ProductContext';
import { AuthContext } from './AuthContext';
import * as cartService from '../utils/cartService';
import { getInitialCartState } from '../utils/cartUtils';
import { isAuthenticated } from '../utils/authUtils';

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload || []
      };
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
        };
      }
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          (item.id === action.payload.id || item.backend_id === action.payload.id)
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };
    default:
      return state;
  }
};

// Usar la función importada
const getInitialState = getInitialCartState;

const isLocalToken = () => {
  try {
    const token = localStorage.getItem('token');
    return typeof token === 'string' && token.startsWith('local.');
  } catch {
    return false;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());
  const { actualizarStock, restaurarStock } = useContext(ProductContext);
  const authContext = useContext(AuthContext);
  
  // Manejar el caso cuando AuthContext no está disponible
  const user = authContext?.user;
  const loading = authContext?.loading;

  // Cargar carrito desde el backend al iniciar (solo si está autenticado)
  useEffect(() => {
    const loadCartFromBackend = async () => {
      // Esperar a que termine la carga de autenticación
      if (loading) {
        console.log('Esperando a que termine la carga de autenticación...');
        return;
      }

      // Solo intentar cargar del backend si el usuario está autenticado
      if (!user || !isAuthenticated() || isLocalToken()) {        
        console.log('Usuario no autenticado, usando localStorage para el carrito');
        return;
      }

      try {
        console.log('Usuario autenticado, intentando cargar carrito del backend...');
        const cart = await cartService.getCart();
        if (cart && cart.cart_items) {
          console.log('Carrito cargado del backend:', cart);
          // Convertir cart_items del backend al formato del frontend
          const items = cart.cart_items.map(item => ({
            id: item.product.id,
            nombre: item.product.nombre,
            precio: item.product.precio,
            imagen: item.product.imagen,
            quantity: item.quantity,
            price: item.price,
            backend_id: item.id // Guardar el ID del backend para operaciones posteriores
          }));
          dispatch({ type: 'SET_CART', payload: items });
        } else {
          console.log('Carrito vacío o no válido del backend');
        }
      } catch (error) {
        console.log('No se pudo cargar el carrito del backend, usando localStorage:', error.message);
      }
    };

    loadCartFromBackend();
  }, [user, loading]);

  // Guardar en localStorage cada vez que cambie el estado (fallback)
  useEffect(() => {    
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = async (product, quantity = 1) => {
    // Si no está autenticado, usar solo localStorage
    if (!isAuthenticated() || isLocalToken()) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id: product.id,
          nombre: product.nombre || product.name,
          precio: product.precio || product.price,
          imagen: product.imagen || product.image || product.product_image,
          quantity
        }
      });
      actualizarStock(product.id, quantity);
      return { notAuthenticated: true };
    }

    try {
      // Llamar al backend
      const cart = await cartService.addToCart(product.id, quantity);
      if (cart && cart.cart_items) {
        const items = cart.cart_items.map(item => ({
          id: item.product.id,
          nombre: item.product.nombre || item.product.name,
          precio: item.product.precio || item.product.price,
          imagen: item.product.imagen || item.product.image || item.product.product_image,
          quantity: item.quantity,
          price: item.price,
          backend_id: item.id
        }));
        dispatch({ type: 'SET_CART', payload: items });
        // Siempre recarga el carrito completo después de agregar
        if (isAuthenticated()) {
          await fetchCart();
        }
      } else {
        // Fallback al estado local
        dispatch({
          type: 'ADD_TO_CART',
          payload: {
            id: product.id,
            nombre: product.nombre || product.name,
            precio: product.precio || product.price,
            imagen: product.imagen || product.image || product.product_image,
            quantity
          }
        });
        actualizarStock(product.id, quantity);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      // Fallback al estado local
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id: product.id,
          nombre: product.nombre || product.name,
          precio: product.precio || product.price,
          imagen: product.imagen || product.image || product.product_image,
          quantity
        }
      });
      actualizarStock(product.id, quantity);
    }
  };

  const removeFromCart = async (productId) => {
    // Si no está autenticado, usar solo localStorage
    if (!isAuthenticated() || isLocalToken()) {
      const item = state.items.find(i => i.id === productId);
      dispatch({
        type: 'REMOVE_FROM_CART',
        payload: productId
      });
      if (item) {
        restaurarStock(productId, item.quantity);
      }
      return;
    }

    try {
      // Encontrar el item en el carrito para obtener su ID del backend
      const item = state.items.find(i => i.id === productId || i.backend_id === productId);
      if (item && item.backend_id) {
        const cart = await cartService.removeFromCart(item.backend_id);
        // Log de la respuesta del backend
        console.log('Respuesta al eliminar del carrito:', cart);
        if (cart && Array.isArray(cart.cart_items)) {
          const items = cart.cart_items.map(item => ({
            id: item.product.id,
            nombre: item.product.nombre || item.product.name,
            precio: item.product.precio || item.product.price,
            imagen: item.product.imagen || item.product.image || item.product.product_image,
            quantity: item.quantity,
            price: item.price,
            backend_id: item.id
          }));
          dispatch({ type: 'SET_CART', payload: items });
        } else if (cart && cart.cart_items === undefined) {
          // No limpiar el carrito, solo loguear el error
          console.warn('El backend no devolvió cart_items, se mantiene el carrito actual.');
        } else {
          // Solo limpiar si realmente no hay items
          dispatch({ type: 'CLEAR_CART' });
        }
        // Siempre recarga el carrito completo después de eliminar
        if (isAuthenticated()) {
          await fetchCart();
        }
      } else {
        // Fallback al estado local
        dispatch({
          type: 'REMOVE_FROM_CART',
          payload: productId
        });
        if (item) {
          restaurarStock(productId, item.quantity);
        }
      }
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      // Fallback al estado local
      const item = state.items.find(i => i.id === productId);
      dispatch({
        type: 'REMOVE_FROM_CART',
        payload: productId
      });
      if (item) {
        restaurarStock(productId, item.quantity);
      }
    }
  };

  const updateQuantity = async (itemKey, newQuantity) => {
    // Si está autenticado y hay backend_id, usa backend_id
    const item = state.items.find(i => i.backend_id === itemKey || i.id === itemKey);
    if (!item) return;

    // Si no está autenticado, usar solo localStorage
    if (!isAuthenticated() || isLocalToken()) {
      const diff = newQuantity - item.quantity;
      if (diff > 0) {
        actualizarStock(itemKey, diff);
      } else if (diff < 0) {
        restaurarStock(itemKey, -diff);
      }
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: itemKey, quantity: newQuantity }
      });
      return;
    }

    try {
      if (item.backend_id) {
        const cart = await cartService.updateCartItem(item.backend_id, newQuantity);
        console.log('Respuesta del backend al actualizar cantidad:', cart);
        if (cart && cart.cart_items) {
          const items = cart.cart_items.map(item => ({
            id: item.product.id,
            nombre: item.product.nombre,
            precio: item.product.precio,
            imagen: item.product.imagen,
            quantity: item.quantity,
            price: item.price,
            backend_id: item.id
          }));
          dispatch({ type: 'SET_CART', payload: items });
        } else {
          // Fallback al estado local
          const diff = newQuantity - item.quantity;
          if (diff > 0) {
            actualizarStock(itemKey, diff);
          } else if (diff < 0) {
            restaurarStock(itemKey, -diff);
          }
          dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id: itemKey, quantity: newQuantity }
          });
        }
      } else {
        // Fallback al estado local
        const diff = newQuantity - item.quantity;
        if (diff > 0) {
          actualizarStock(itemKey, diff);
        } else if (diff < 0) {
          restaurarStock(itemKey, -diff);
        }
        dispatch({
          type: 'UPDATE_QUANTITY',
          payload: { id: itemKey, quantity: newQuantity }
        });
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      // Fallback al estado local
      const item = state.items.find(i => i.id === itemKey);
      if (item) {
        const diff = newQuantity - item.quantity;
        if (diff > 0) {
          actualizarStock(itemKey, diff);
        } else if (diff < 0) {
          restaurarStock(itemKey, -diff);
        }
        dispatch({
          type: 'UPDATE_QUANTITY',
          payload: { id: itemKey, quantity: newQuantity }
        });
      }
    }
  };

  const clearCart = async () => {
    // Si no está autenticado, usar solo localStorage
    if (!isAuthenticated() || isLocalToken()) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }

    try {
      await cartService.clearCart();
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
    }
    dispatch({ type: 'CLEAR_CART' }); // Limpia el estado local siempre
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.precio || item.price) * item.quantity, 0);
  };

  const getCartItems = () => {
    return state.items;
  };

  const createOrder = () => {
    const order = {
      items: state.items.map(item => ({
        product_id: parseInt(item.id) || Number(item.id),
        quantity: item.quantity,
        price: item.precio || item.price,
        name: item.nombre || item.name,
        image: item.imagen || item.image
      })),
      total: getTotalPrice(),
      total_items: getTotalItems()
    };

    return order;
  };

  const fetchCart = async () => {
    if (isLocalToken()) {
      console.log('Modo autenticación local: se mantiene carrito en memoria/localStorage.');
      return;
    }

    try {
      const cartData = await cartService.getCart();
      console.log('🔍 Verificando carrito:', cartData);
      console.log('🔍 cart_items existe:', !!cartData.cart_items);
      console.log('🔍 cart_items length:', cartData.cart_items?.length);
      
      if (cartData && cartData.cart_items && cartData.cart_items.length > 0) {
        console.log('✅ Carrito válido, procesando items...');
        const items = cartData.cart_items.map(item => ({
          id: item.product.ID,
          nombre: item.product.name,
          precio: item.product.price,
          imagen: item.product.image,
          quantity: item.quantity,
          price: item.price,
          backend_id: item.ID
        }));
        console.log('✅ Items procesados:', items);
        dispatch({ type: 'SET_CART', payload: items });
      } else {
        console.log('❌ Carrito vacío o no válido');
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Error al cargar el carrito después del login:', error);
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  useEffect(() => {
    if (isAuthenticated() && !isLocalToken()) {
      console.log('Usuario autenticado, cargando carrito del backend...');
      fetchCart();
    } else {
      console.log('Usuario no autenticado, limpiando carrito...');
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
    }
  }, [user]);

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartItems,
    createOrder,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
