import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { ProductContext } from '../context/ProductContext';

const CartDebug = () => {
    const { cart, totalCarrito, cantidadItems } = useContext(CartContext);
    const { productos } = useContext(ProductContext);

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
        }}>
            <div><strong>Debug Info:</strong></div>
            <div>Carrito: {cart.length} items</div>
            <div>Total: ${totalCarrito}</div>
            <div>Cantidad: {cantidadItems}</div>
            <div>Productos: {productos.length}</div>
            <div>localStorage: {localStorage.getItem('cart') ? 'Sí' : 'No'}</div>
        </div>
    );
};

export default CartDebug; 