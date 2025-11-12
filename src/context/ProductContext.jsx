import React, { createContext, useState, useContext, useMemo } from 'react';

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        nombre: 'Alimento perro adulto',
        descripcion: 'Bolsa de 15 kg desarrollada junto a veterinarios para perros adultos.',
        categoria: 'Alimentos',
        precio: 25000,
        stock: 20,
        imagen: '/img/productos/alimento.jpg'
    },
    {
        id: 2,
        nombre: 'Alimento gato adulto',
        descripcion: 'Alimento balanceado para gatos adultos, bolsa de 10 kg.',
        categoria: 'Alimentos',
        precio: 18000,
        stock: 15,
        imagen: '/img/productos/alimento_gato.webp'
    },
    {
        id: 3,
        nombre: 'Pipeta antipulgas',
        descripcion: 'Pipeta para perros medianos con protección por 30 días.',
        categoria: 'Farmacia',
        precio: 5000,
        stock: 50,
        imagen: '/img/productos/pipeta.png'
    },
    {
        id: 4,
        nombre: 'Shampoo hipoalergénico',
        descripcion: 'Fórmula suave para piel sensible, libre de parabenos.',
        categoria: 'Spa y Peluquería',
        precio: 3500,
        stock: 30,
        imagen: '/img/productos/shampoo.png'
    },
    {
        id: 5,
        nombre: 'Cama ortopédica mediana',
        descripcion: 'Cama viscoelástica con soporte ortopédico y funda desmontable.',
        categoria: 'Camas y Descanso',
        precio: 12000,
        stock: 8,
        imagen: '/img/productos/cama_ortopedica.jpg'
    },
    {
        id: 6,
        nombre: 'Juguete interactivo',
        descripcion: 'Juguete interactivo que estimula el olfato y libera alimento.',
        categoria: 'Juguetes',
        precio: 4500,
        stock: 15,
        imagen: '/img/productos/juguete.perro.jpg'
    },
    {
        id: 7,
        nombre: 'Correa extensible 5 metros',
        descripcion: 'Correa retráctil con freno de seguridad y empuñadura ergonómica.',
        categoria: 'Paseo',
        precio: 6000,
        stock: 10,
        imagen: '/img/productos/correa_extensible.webp'
    },
    {
        id: 8,
        nombre: 'Desparasitante interno',
        descripcion: 'Tabletas palatables para desparasitación interna periódica.',
        categoria: 'Farmacia',
        precio: 3500,
        stock: 25,
        imagen: '/img/productos/desparasitante.jpg'
    },
    {
        id: 9,
        nombre: 'Hueso de cuero natural',
        descripcion: 'Hueso masticable para perros grandes, ayuda a la higiene dental.',
        categoria: 'Snacks',
        precio: 4500,
        stock: 30,
        imagen: '/img/productos/hueso.jpg'
    },
    {
        id: 10,
        nombre: 'Pelota interactiva con sonido',
        descripcion: 'Pelota resistente que emite sonidos al moverse, ideal para juego activo.',
        categoria: 'Juguetes',
        precio: 3200,
        stock: 25,
        imagen: '/img/productos/pelota.webp'
    },
    {
        id: 11,
        nombre: 'Rascador para gatos 3 niveles',
        descripcion: 'Centro de juegos con plataformas, escondite y juguetes colgantes.',
        categoria: 'Gatos',
        precio: 15000,
        stock: 12,
        imagen: '/img/productos/rascador.png'
    },    
    {
        id: 12,
        nombre: 'Transportadora para gatos',
        descripcion: 'Transportadora plástica mediana con ventilación 360° y cierre seguro.',
        categoria: 'Transporte',
        precio: 18000,
        stock: 8,
        imagen: '/img/productos/transporte_gatos.jpg'
    }
   
];

const applyCartStock = (productos, carrito) => {
    if (!Array.isArray(carrito) || carrito.length === 0) return productos;

    return productos.map(producto => {
        const enCarrito = carrito.find(item => item.id === producto.id);
        if (!enCarrito) return producto;

        return {
            ...producto,
            stock: Math.max(0, (producto.stock ?? 0) - (enCarrito.quantity ?? 0))
        };
    });
};

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [productos, setProductos] = useState(() => {
        const carritoGuardado = localStorage.getItem('cart');

        if (carritoGuardado) {
            try {
                const carrito = JSON.parse(carritoGuardado);
                return applyCartStock(DEFAULT_PRODUCTS, carrito);
            } catch (error) {
                console.warn('No se pudo parsear el carrito almacenado:', error);
            }
        }

        return DEFAULT_PRODUCTS;
    });
    const [filtro, setFiltro] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');

    const cargando = false;
    const error = null;

    const productosFiltrados = useMemo(() => (
        productos.filter(producto => {
            const matchesFiltro = producto.nombre.toLowerCase().includes(filtro.toLowerCase());
            const matchesCategoria = categoriaFiltro === '' || producto.categoria === categoriaFiltro;
            return matchesFiltro && matchesCategoria;
        })
    ), [productos, filtro, categoriaFiltro]);

    const categorias = useMemo(
        () => [...new Set(productos.map(producto => producto.categoria))],
        [productos]
    );

    const actualizarStock = (productoId, cantidad) => {
        setProductos(prev => prev.map(producto => (
            producto.id === productoId
                ? { ...producto, stock: Math.max(0, (producto.stock ?? 0) - cantidad) }
                : producto
        )));
    };

    const restaurarStock = (productoId, cantidad) => {
        setProductos(prev => prev.map(producto => (
            producto.id === productoId
                ? { ...producto, stock: (producto.stock ?? 0) + cantidad }
                : producto
        )));
    };

    const productoDisponible = (productoId, cantidad = 1) => {
        const producto = productos.find(item => item.id === productoId);
        return producto ? (producto.stock ?? 0) >= cantidad : false;
    };

    return (
        <ProductContext.Provider value={{
            productos,
            productosFiltrados,
            cargando,
            error,
            filtro,
            setFiltro,
            categoriaFiltro,
            setCategoriaFiltro,
            categorias,
            actualizarStock,
            restaurarStock,
            productoDisponible
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};

export const useProducts = useProductContext;
