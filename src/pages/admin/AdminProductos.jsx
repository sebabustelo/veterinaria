import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import HeaderAdmin from '../../components/estaticos/HeaderAdmin';
import Footer from '../../components/estaticos/Footer';
import adminProductsData from '@/data/adminProducts.json';
import './AdminProductos.css';

const formatCurrency = (value) =>
  value?.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }) ?? '$0,00';

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return 'Según procedimiento';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} h${rest ? ` ${rest} min` : ''}`;
};

const AdminProductos = () => {
  const productos = adminProductsData.productos ?? [];
  const servicios = adminProductsData.servicios ?? [];
  const metadata = adminProductsData.metadata ?? {};

  const categoriasProductos = useMemo(
    () => ['Todas las categorías', ...Array.from(new Set(productos.map((item) => item.categoria_nombre || 'Sin categoría')))],
    [productos]
  );

  const categoriasServicios = useMemo(
    () => ['Todas las categorías', ...Array.from(new Set(servicios.map((item) => item.categoria_nombre || 'Sin categoría')))],
    [servicios]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('productos');
  const [categoriaProducto, setCategoriaProducto] = useState('Todas las categorías');
  const [categoriaServicio, setCategoriaServicio] = useState('Todas las categorías');

  const resumen = useMemo(() => {
    const stockTotal = productos.reduce((acc, producto) => acc + (producto.stock ?? 0), 0);
    const valorInventario = productos.reduce(
      (acc, producto) => acc + (producto.stock ?? 0) * (producto.precio ?? 0),
      0
    );

    return {
      totalProductos: metadata.total_productos ?? productos.length,
      totalServicios: metadata.total_servicios ?? servicios.length,
      stockTotal,
      valorInventario,
    };
  }, [productos, metadata, servicios]);

  const normalize = (value) => (value ?? '').toString().toLowerCase();

  const filteredProductos = useMemo(() => {
    const term = normalize(searchTerm);
    return productos.filter((producto) => {
      const categoria = producto.categoria_nombre || 'Sin categoría';
      const matchesCategoria =
        categoriaProducto === 'Todas las categorías' || normalize(categoria) === normalize(categoriaProducto);
      if (!matchesCategoria) return false;
      if (!term) return true;
      return [producto.nombre, producto.descripcion, categoria, producto.precio, producto.stock]
        .filter(Boolean)
        .some((field) => normalize(field).includes(term));
    });
  }, [productos, searchTerm, categoriaProducto]);

  const filteredServicios = useMemo(() => {
    const term = normalize(searchTerm);
    return servicios.filter((servicio) => {
      const categoria = servicio.categoria_nombre || 'Sin categoría';
      const matchesCategoria =
        categoriaServicio === 'Todas las categorías' || normalize(categoria) === normalize(categoriaServicio);
      if (!matchesCategoria) return false;
      if (!term) return true;
      return [servicio.nombre, servicio.descripcion, categoria, servicio.precio]
        .filter(Boolean)
        .some((field) => normalize(field).includes(term));
    });
  }, [servicios, searchTerm, categoriaServicio]);

  const activeCount = activeTab === 'productos' ? filteredProductos.length : filteredServicios.length;

  return (
    <div className="admin-page">
      <Helmet>
        <title>Gestión de Productos  | Admin Vettix</title>
        <meta
          name="description"
          content="Panel administrativo para visualizar el catálogo de productos de Vettix." />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content admin-products">
        <section className="turnos-hero admin-orders-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Administrar Catálogo</span>
            <h1>Productos y servicios </h1>
            <p>
              Consultá rápidamente el inventario disponible, la oferta de servicios premium y los totales consolidados
              para la operación diaria.
            </p>
          </div>
          <div className="admin-products-hero-card">
            <ul>
              <li>Total de productos: {resumen.totalProductos}</li>
              <li>Total de servicios: {resumen.totalServicios}</li>
              <li>Stock consolidado: {resumen.stockTotal} unidades</li>
              <li>Inventario valuado: {formatCurrency(resumen.valorInventario)}</li>
            </ul>
          </div>
        </section>

        <section className="products-summary-grid">
          <article className="products-summary-card">
            <h3>Inventario vigente</h3>
            <p className="summary-value">{resumen.totalProductos}</p>
            <span className="summary-sub">Referencias activas en catálogo</span>
          </article>
          <article className="products-summary-card">
            <h3>Servicios disponibles</h3>
            <p className="summary-value">{resumen.totalServicios}</p>
            <span className="summary-sub">Procedimientos y atención especializada</span>
          </article>
          <article className="products-summary-card">
            <h3>Stock total</h3>
            <p className="summary-value">{resumen.stockTotal}</p>
            <span className="summary-sub">Unidades listas para la venta</span>
          </article>
          <article className="products-summary-card">
            <h3>Valor estimado</h3>
            <p className="summary-value">{formatCurrency(resumen.valorInventario)}</p>
            <span className="summary-sub">Inventario ponderado a precio de lista</span>
          </article>
        </section>

        <section className="products-toolbar">
          <div className="search-box">
            <i className="fa-solid fa-search search-icon"></i>
            <input
              type="text"
              placeholder="   Buscar por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} aria-label="Limpiar búsqueda">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <div className="products-tabs" role="tablist">
            <button
              type="button"
              className={`products-tab ${activeTab === 'productos' ? 'active' : ''}`}
              onClick={() => setActiveTab('productos')}
              role="tab"
              aria-selected={activeTab === 'productos'}
            >
              Productos
            </button>
            <button
              type="button"
              className={`products-tab ${activeTab === 'servicios' ? 'active' : ''}`}
              onClick={() => setActiveTab('servicios')}
              role="tab"
              aria-selected={activeTab === 'servicios'}
            >
              Servicios
            </button>
          </div>
          <Link to="/admin" className="admin-card-link">
            <i className="fa-solid fa-arrow-left"></i>
            Volver al Admin
          </Link>
        </section>

        <section className="products-filters">
          {activeTab === 'productos' ? (
            <label>
              Categoría
              <select
                value={categoriaProducto}
                onChange={(event) => setCategoriaProducto(event.target.value)}
              >
                {categoriasProductos.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Categoría
              <select
                value={categoriaServicio}
                onChange={(event) => setCategoriaServicio(event.target.value)}
              >
                {categoriasServicios.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <span className="filters-count">{activeCount} resultados</span>
        </section>

        {activeTab === 'productos' ? (
          <section className="products-table-wrapper">
            {filteredProductos.length === 0 ? (
              <div className="products-empty">
                <i className="fa-solid fa-box-open"></i>
                <h3>No se encontraron productos</h3>
                <p>Ajustá la búsqueda o probá con otra categoría.</p>
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductos.map((producto) => (
                    <tr key={`producto-${producto.id}`}>
                      <td data-label="Nombre">
                        <strong>{producto.nombre}</strong>
                      </td>
                      <td data-label="Categoría">
                        <span className="products-pill">{producto.categoria_nombre || 'Sin categoría'}</span>
                      </td>
                      <td data-label="Precio">{formatCurrency(producto.precio)}</td>
                      <td data-label="Stock">{producto.stock ?? 0}</td>
                      <td data-label="Descripción" className="products-description">
                        {producto.descripcion || 'Sin descripción disponible'}
                      </td>
                      <td data-label="Estado">
                        <span className={`status-chip ${producto.activo ? 'active' : 'inactive'}`}>
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : (
          <section className="products-table-wrapper">
            {filteredServicios.length === 0 ? (
              <div className="products-empty">
                <i className="fa-solid fa-hand-holding-medical"></i>
                <h3>No se encontraron servicios</h3>
                <p>Ajustá la búsqueda o probá con otra categoría.</p>
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Duración</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServicios.map((servicio) => (
                    <tr key={`servicio-${servicio.id}`}>
                      <td data-label="Servicio">
                        <strong>{servicio.nombre}</strong>
                      </td>
                      <td data-label="Categoría">
                        <span className="products-pill">{servicio.categoria_nombre || 'Sin categoría'}</span>
                      </td>
                      <td data-label="Precio">{formatCurrency(servicio.precio)}</td>
                      <td data-label="Duración">{formatDuration(servicio.duracion_minutos)}</td>
                      <td data-label="Descripción" className="products-description">
                        {servicio.descripcion || 'Sin descripción disponible'}
                      </td>
                      <td data-label="Estado">
                        <span className={`status-chip ${servicio.activo ? 'active' : 'inactive'}`}>
                          {servicio.activo ? 'Disponible' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminProductos;