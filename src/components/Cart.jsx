import React from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';
import './styleCart.css';

const Cart = ({ isOpen, onClose }) => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems 
  } = useCart();
  const navigate = useNavigate();  

  if (!isOpen) {    
    return null;
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    return (
      <div className="cart-drawer open">
        <div className="cart-header">
          <h3>Carrito de Compras</h3>
          <button onClick={onClose} className='close-button'>×</button>
        </div>
        <div className="cart-content">
          <div className="cart-empty">
            <div className="empty-icon">
              <i className="fa-solid fa-user-lock"></i>
            </div>
            <h2>Debes iniciar sesión</h2>
            <p>Para ver tu carrito, necesitas estar logueado</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                onClose();
                navigate('/login');
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-drawer open">
        <div className="cart-header">
          <h3>Carrito de Compras</h3>
          <button onClick={onClose} className='close-button'>×</button>
        </div>
        <div className="cart-content">
          <div className="cart-empty">
            <div className="empty-icon">
              <i className="fa-solid fa-shopping-cart"></i>
            </div>
            <h2>Tu carrito está vacío</h2>
            <p>Agrega algunos productos para comenzar a comprar</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                onClose();
                navigate('/productos');
              }}
            >
              Ver productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      alert('Error al eliminar del carrito. Intenta nuevamente.');
    }
  };

  const handleUpdateQuantity = async (itemKey, newQuantity) => {
    console.log('handleUpdateQuantity', { itemKey, newQuantity });
    try {
      await updateQuantity(itemKey, newQuantity);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar cantidad. Intenta nuevamente.');
    }
  };

  return (
    <div className="cart-drawer open">
      <div className="cart-header">
        <h3>Carrito de Compras</h3>
        <button onClick={onClose} className='close-button'>×</button>
      </div>
      <div className="cart-content">
        <div className="cart-items">
          {items.map((item, idx) => (
            <div key={item.backend_id || item.id || item.product_id || idx} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.imagen || item.image || item.product_image} 
                  alt={item.nombre || item.name || item.product_name}
                />
              </div>
              <div className="item-details">
                <h4>{item.nombre || item.name}</h4>
                <p className="item-price">
                  ${(item.precio || item.price).toLocaleString()} x {item.quantity}
                </p>
              </div>
              <div className="item-quantity">
                <button 
                  className="quantity-btn"
                  onClick={() => handleUpdateQuantity(item.backend_id || item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleUpdateQuantity(item.backend_id || item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="item-total">
                ${((item.precio || item.price) * item.quantity).toLocaleString()}
              </div>
              <button 
                className="remove-btn"
                onClick={() => handleRemoveFromCart(item.id)}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Resumen del pedido</h3>
          <div className="summary-row">
            <span>Productos ({getTotalItems()}):</span>
            <span>${getTotalPrice().toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Envío:</span>
            <span>Gratis</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${getTotalPrice().toLocaleString()}</span>
          </div>
          <button 
            className="btn btn-checkout"
            onClick={() => {
              onClose();
              navigate('/checkout');
            }}
          >
            <i className="fa-solid fa-credit-card" style={{ marginRight: 8 }}></i>
            Finalizar Compra
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              navigate('/productos');
            }}
          >
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }}></i>
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;