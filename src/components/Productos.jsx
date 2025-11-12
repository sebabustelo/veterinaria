import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './styleProductos.css'
import { useCart } from '../hooks/useCart'
import { ProductContext } from '../context/ProductContext'
import { useToast } from '../context/ToastContext'
import loadingGif from '../assets/loading.gif';
import { isAuthenticated } from '../utils/authUtils';

const Producto = ({ producto, detalleProducto, setShowLoading }) => {
    const { nombre, precio, imagen } = producto;
    const [cantidad, setCantidad] = useState(1);
    const { addToCart } = useCart();
    const { productoDisponible } = useContext(ProductContext);
    const { showWarning, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const stockActual = producto.stock || 0;

    const aumentarCantidad = () => {
        if (cantidad < stockActual) setCantidad(cantidad + 1);
    };
    
    const disminuirCantidad = () => {
        if (cantidad > 1) setCantidad(cantidad - 1);
    };

    const agregarAlCarrito = async () => {
        if (!isAuthenticated()) {
            showWarning('Debes iniciar sesión para agregar productos al carrito');
            navigate('/login');
            return;
        }

        if (productoDisponible(producto.id, cantidad)) {
            setLoading(true);
            if (setShowLoading) setShowLoading(true);
            
            try {
                await addToCart(producto, cantidad);
                setCantidad(1);
            } catch (error) {
                console.error('Error al agregar al carrito:', error);
                showError('Error al agregar al carrito. Intenta nuevamente.');
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    if (setShowLoading) setShowLoading(false);
                }, 700);
            }
        }
    };
   
    return (
        <section className='card'>
            <div className='imgContainer'>
                <Link to={`/productos/${producto.id}`} className="img-link">
                    <img src={imagen} alt={nombre} className='imagen' />
                </Link>
            </div>

            <h3 className='nombre'>{nombre}</h3>
            <p className='precio'>${precio}</p>
            <p className='stock'>Stock: {stockActual}</p>

            <div className='cantidadContainer'>
                <button className='qtyButton' onClick={disminuirCantidad} disabled={cantidad <= 1}>-</button>
                <span className='qty-value'>{cantidad}</span>
                <button className='qtyButton' onClick={aumentarCantidad} disabled={cantidad >= stockActual}>+</button>
            </div>

            <div className="botones-producto">
                {detalleProducto === 1 && (
                    <Link
                        to={`/productos/${producto.id}`}
                        className="button-producto button-producto-secondary"
                        title="Ver detalles"
                    >
                        <i className="fa-solid fa-circle-info"></i>
                    </Link>
                )}
                <button
                    className="button-producto"
                    onClick={agregarAlCarrito}
                    disabled={stockActual === 0 || loading}
                    title="Agregar al carrito"
                >
                    {loading ? (
                        <img src={loadingGif} alt="Cargando..." style={{ width: 24, height: 24 }} />
                    ) : (
                        <i className="fa-solid fa-cart-plus"></i>
                    )}
                </button>
            </div>
        </section>
    );
};

export default Producto;
