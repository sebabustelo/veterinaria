import { useContext } from 'react'
import React, { useState, useEffect } from 'react';
import Header from '@/components/estaticos/Header'
import Footer from '@/components/estaticos/Footer'
import ProductList from '@/components/ProductosList'
import SearchAndFilters from '@/components/SearchAndFilters'
import { ProductContext } from '@/context/ProductContext'
import { useRealTime } from '@/context/RealTimeContext'
import loading from '@/assets/loading.gif'
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const highlights = [
  {
    icon: '🍽',
    title: 'Plan nutricional premium',
    text: 'Alimentos clínicos y balanceados para cada etapa de la vida.'
  },
  {
    icon: '💉',
    title: 'Farmacia veterinaria',
    text: 'Medicamentos, pipetas, desparasitantes y suplementos certificados.'
  },
  {
    icon: '🛏',
    title: 'Bienestar y confort',
    text: 'Camas ortopédicas, transportadoras y accesorios ergonómicos.'
  },
  {
    icon: '🎾',
    title: 'Entretenimiento inteligente',
    text: 'Juguetes interactivos, snacks dentales y soluciones antiestrés.'
  }
];

const GaleriaDeProductos = () => {
  const { cargando, productosFiltrados } = useContext(ProductContext);
  const [showLoading, setShowLoading] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  let lastUpdate = null;
  try {
    const realTimeContext = useRealTime();
    lastUpdate = realTimeContext.lastUpdate;
  } catch {
    // Si no esta disponible, no mostrar la notificacion
  }

  useEffect(() => {
    if (lastUpdate) {
      setShowUpdateNotification(true);
      setTimeout(() => setShowUpdateNotification(false), 3000);
    }
  }, [lastUpdate]);

  return (
    <>
      <Helmet>
        <title>Vettix Boutique | Productos y Bienestar Premium</title>
        <meta
          name="description"
          content="Descubrí el catálogo premium de Vettix: alimentos balanceados, farmacia veterinaria, bienestar, juguetes interactivos y accesorios para mascotas." />
      </Helmet>
      <Header />
      {showUpdateNotification && (
        <div className="catalog-update-toast">
          <i className="fa-solid fa-sync-alt"></i>
          Catálogo actualizado con novedades
        </div>
      )}
      <main className="main-content">
        <section className="turnos-hero boutique-hero">
          <div className="boutique-hero-header">
            <span className="hero-tag hero-tag-contrast">Vettix Boutique</span>
            <h1>Productos premium para el cuidado de tu mascota</h1>
            <p>
              Contamos con un catálogo de alimentos clínicos, farmacia veterinaria, confort, juguetes inteligentes y accesorios diseñados para mejorar la calidad de vida de perros y gatos.
            </p>
          
          </div>

          <div className="boutique-hero-highlight">
           
            <ul className="boutique-hero-list">
              <li>Reposiciones semanales con novedades</li>
              <li>Marcas premium y líneas clínicas certificadas</li>
              <li>Recomendaciones personalizadas según historial</li>
            </ul>
          </div>
        </section>

        <section className="values-section">
          <h2 className="section-title">Todo lo que necesitás en un solo lugar</h2>
          <div className="values-grid">
            {highlights.map((item) => (
              <div key={item.title} className="value-card">
                <span className="value-icon" aria-hidden>{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <br />
        <section id="catalogo" className="selection-panel">
          {!cargando && <SearchAndFilters />}

          {cargando ? (
            <div className="loading-container">
              <img src={loading} alt="Cargando..." className="loading-img" />
              <p className="loading-text">Cargando productos...</p>
            </div>
          ) : (
            <>
              {productosFiltrados.length === 0 ? (
                <div className="no-results">
                  <i className="fa-solid fa-search no-results-icon"></i>
                  <h3>No se encontraron productos</h3>
                  <p>Intenta con otros términos de búsqueda o filtros</p>
                </div>
              ) : (
                <ProductList productos={productosFiltrados} detalleProducto={1} setShowLoading={setShowLoading} />
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
      {showLoading && (
        <div className="catalog-loading-overlay">
          <div className="catalog-loading-box">
            <img src={loading} alt="Cargando..." className="loading-img" style={{ width: 260, height: 120 }} />
            <p className="loading-text" style={{ marginTop: 16, fontSize: 18 }}>Agregando al carrito...</p>
          </div>
        </div>
      )}
    </>
  )
}

export default GaleriaDeProductos

