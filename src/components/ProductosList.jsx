import React, { useContext } from "react";
import Productos from './Productos';
import { ProductContext } from '../context/ProductContext';

const ProductList = ({ detalleProducto = 1, productos, setShowLoading }) => {
    const { productos: todosProductos } = useContext(ProductContext);
    
    // Usar productos pasados como prop o todos los productos del contexto
    const productosAMostrar = productos || todosProductos;

    return (
        <div className="products-grid">
            {productosAMostrar.map(producto => (
                <Productos
                    key={producto.id}
                    producto={producto}                   
                    detalleProducto={detalleProducto}
                    setShowLoading={setShowLoading}
                />
            ))}
        </div>
    );
};

export default ProductList;

