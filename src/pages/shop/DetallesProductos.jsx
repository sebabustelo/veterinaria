import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import Header from "@/components/estaticos/Header"
import Footer from "@/components/estaticos/Footer"
import loading from '@/assets/loading.gif'
import '@/components/styleProductos.css'
import { Helmet } from 'react-helmet-async';
import { useProductByIdQuery } from '@/hooks/useProductQuery'

const mockReviews = [
  { nombre: "Ana", rating: 5, comentario: "Â¡Excelente calidad!" },
  { nombre: "Luis", rating: 4, comentario: "Muy buen producto, llegÃ³ rÃ¡pido." },
  { nombre: "SofÃ­a", rating: 3, comentario: "EstÃ¡ bien, pero esperaba mÃ¡s variedad de colores." },
];

function getRandomRating() {
  return 3 + Math.round(Math.random() * 2);
}

const DetallesProductos = ({ agregarProductoCarrito }) => {
    const { id } = useParams();
    const { data: producto, isLoading: cargando, error } = useProductByIdQuery(id);
    const [selectedImg, setSelectedImg] = useState(0);
    const [cantidad, setCantidad] = useState(1);
    const [rating] = useState(getRandomRating());
    const [reviews, setReviews] = useState(mockReviews);
    const [reviewInput, setReviewInput] = useState({ nombre: '', comentario: '', rating: 5 });

    function getGalleryImages(img) {
        if (!img) return [];
        if (img.includes('unsplash')) {
            return [img, img+"&1", img+"&2", img+"&3"];
        }
        return [img];
    }

    if (cargando) {
        return (
            <>
                <Header />
                <div className="main-content">
                    <div className="loading-container">
                        <img src={loading} alt="Cargando..." className="loading-img" />
                        <p className="loading-text">Cargando producto...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !producto) {
        return (
            <>
                <Header />
                <div className="main-content">
                    <div className="no-results">
                        <i className="fa-solid fa-circle-exclamation no-results-icon"></i>
                        <h3>Producto no encontrado</h3>
                        <p>{(error && (error.message || String(error))) || "No pudimos encontrar el producto solicitado."}</p>
                        <Link to="/productos" className="btn secondary">Volver a la galerÃ­a</Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const gallery = getGalleryImages(producto.imagen || producto.image);
    const categoria = producto.categoria || (producto.category && producto.category.name) || "Sin categorÃ­a";
    const avgRating = reviews.length > 0
      ? (reviews.reduce((acum, r) => acum + r.rating, 0) / reviews.length).toFixed(1)
      : rating;

    const handleAddReview = (e) => {
        e.preventDefault();
        if (!reviewInput.nombre || !reviewInput.comentario) return;
        setReviews([
            { ...reviewInput },
            ...reviews
        ]);
        setReviewInput({ nombre: '', comentario: '', rating: 5 });
    };

    const handleCantidad = (delta) => {
        setCantidad(c => {
            let nueva = c + delta;
            if (nueva < 1) nueva = 1;
            if (nueva > producto.stock) nueva = producto.stock;
            return nueva;
        });
    };

    return (
        <>
            <Helmet>
              <title>{(producto.nombre || producto.name) + ' | Detalles | E-commerce de Mascotas'}</title>
              <meta name="description" content={producto.descripcion || producto.description || 'Detalles y caracterÃ­sticas del producto para mascotas.'} />
            </Helmet>
            <Header />
            <main className="main-content">
                <section className="turnos-hero boutique-hero" style={{ marginBottom: '2.5rem' }}>
                    <div className="boutique-hero-header">
                        <span className="hero-tag hero-tag-contrast">Ficha de producto</span>
                        <h1>{producto.nombre || producto.name}</h1>
                        <p>
                            DescubrÃ­ los beneficios clave, la disponibilidad y las recomendaciones del equipo Vettix para este producto seleccionado especialmente.
                        </p>
                    </div>

                    <div className="boutique-hero-highlight">
                        <h3>InformaciÃ³n rÃ¡pida</h3>
                        <ul className="boutique-hero-list">
                            <li>CategorÃ­a: {categoria}</li>
                            <li>Stock disponible: {producto.stock > 0 ? `${producto.stock} unidades` : 'Sin stock'}</li>
                            <li>ValoraciÃ³n promedio: {avgRating}</li>
                        </ul>
                    </div>
                </section>

                <div className="detalle-producto-container">
                    <div className="detalle-producto-img">
                        <img
                            src={gallery[selectedImg]}
                            alt={producto.nombre || producto.name}
                            style={{ width: "100%", borderRadius: 12, objectFit: "cover" }}
                        />
                        {gallery.length > 1 && (
                            <div className="galeria-miniaturas">
                                {gallery.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={"Miniatura " + (idx + 1)}
                                        className={idx === selectedImg ? "miniatura selected" : "miniatura"}
                                        onClick={() => setSelectedImg(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="detalle-producto-info">
                        <h1 className="detalle-producto-nombre">{producto.nombre || producto.name}</h1>
                        <div className="detalle-producto-precio-stock">
                            <span className="detalle-producto-precio"></span>
                            {producto.stock > 0 ? (
                                <span className="detalle-producto-stock">En stock: {producto.stock}</span>
                            ) : (
                                <span className="detalle-producto-stock agotado">Sin stock</span>
                            )}
                        </div>
                        <div className="detalle-producto-categoria">
                            <span className="badge-categoria">{categoria}</span>
                        </div>
                        <div className="detalle-producto-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <i
                                    key={i}
                                    className={i < Math.round(avgRating) ? "fa-solid fa-star estrella-llena" : "fa-regular fa-star estrella-vacia"}
                                ></i>
                            ))}
                            <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>({avgRating})</span>
                        </div>
                        <p className="detalle-producto-descripcion">{producto.descripcion || producto.description}</p>
                        {typeof agregarProductoCarrito === 'function' && (
                            <div className="agregar-carrito-cantidad">
                                <button className="btn-cantidad" onClick={() => handleCantidad(-1)} disabled={cantidad <= 1}>-</button>
                                <input type="number" min="1" max={producto.stock} value={cantidad} readOnly />
                                <button className="btn-cantidad" onClick={() => handleCantidad(1)} disabled={cantidad >= producto.stock}>+</button>
                                <button
                                    className="btn agregar-carrito"
                                    disabled={producto.stock <= 0}
                                    onClick={() => agregarProductoCarrito(producto, cantidad)}
                                >
                                    <i className="fa-solid fa-cart-plus" style={{ marginRight: 8 }}></i>
                                    Agregar al carrito
                                </button>
                            </div>
                        )}
                        <Link to="/productos" className="btn volver-galeria-btn" style={{ marginTop: 16 }}>
                            <i className="fa-solid fa-arrow-left" style={{ marginRight: "0.6em" }}></i>
                            Volver a la galerÃ­a
                        </Link>
                    </div>
                </div>

                <section className="detalle-producto-reviews">
                    <h2>ReseÃ±as de clientes</h2>
                    <form className="form-review" onSubmit={handleAddReview}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={reviewInput.nombre}
                                onChange={e => setReviewInput({ ...reviewInput, nombre: e.target.value })}
                                required
                                style={{ flex: 2 }}
                            />
                            <select
                                value={reviewInput.rating}
                                onChange={e => setReviewInput({ ...reviewInput, rating: Number(e.target.value) })}
                                style={{ flex: 1, minWidth: 120 }}
                            >
                                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrella{n>1?'s':''}</option>)}
                            </select>
                        </div>
                        <textarea
                            placeholder="Escribe tu reseÃ±a..."
                            value={reviewInput.comentario}
                            onChange={e => setReviewInput({ ...reviewInput, comentario: e.target.value })}
                            required
                        />
                        <button type="submit" className="btn btn-review">Enviar reseÃ±a</button>
                    </form>
                    <div className="lista-reviews">
                        {reviews.length === 0 && <p>No hay reseÃ±as aÃºn.</p>}
                        {reviews.map((r, idx) => (
                            <div key={idx} className="review-item">
                                <div className="review-header">
                                    <span className="review-nombre">{r.nombre}</span>
                                    <span className="review-rating">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <i
                                                key={i}
                                                className={i < r.rating ? "fa-solid fa-star estrella-llena" : "fa-regular fa-star estrella-vacia"}
                                            ></i>
                                        ))}
                                    </span>
                                </div>
                                <div className="review-comentario">{r.comentario}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default DetallesProductos
