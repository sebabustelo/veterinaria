import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import HeaderAdmin from '../../components/estaticos/HeaderAdmin';
import Footer from '../../components/estaticos/Footer';
import adminProductsData from '@/data/adminProducts.json';
import './AdminProductos.css';
import './Admin.css';

const STORAGE_KEY_PRODUCTOS = 'vettix_productos';
const STORAGE_KEY_SERVICIOS = 'vettix_servicios';

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

const initialProductoForm = {
  nombre: '',
  descripcion: '',
  categoria_nombre: '',
  precio: '',
  stock: '',
  activo: true,
};

const initialServicioForm = {
  nombre: '',
  descripcion: '',
  categoria_nombre: '',
  precio: '',
  duracion_minutos: '',
  activo: true,
};

const AdminProductos = () => {
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PRODUCTOS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return adminProductsData.productos ?? [];
      }
    }
    return adminProductsData.productos ?? [];
  });

  const [servicios, setServicios] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SERVICIOS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return adminProductsData.servicios ?? [];
      }
    }
    return adminProductsData.servicios ?? [];
  });

  const metadata = adminProductsData.metadata ?? {};

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SERVICIOS, JSON.stringify(servicios));
  }, [servicios]);

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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(activeTab === 'productos' ? initialProductoForm : initialServicioForm);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, tipo: null, nombre: '' });

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

  // Actualizar formData cuando cambia el tab (solo si no hay formulario abierto)
  useEffect(() => {
    if (!showForm && !editingId) {
      setFormData(activeTab === 'productos' ? initialProductoForm : initialServicioForm);
    }
  }, [activeTab]);

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(activeTab === 'productos' ? initialProductoForm : initialServicioForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      categoria_nombre: item.categoria_nombre || '',
      precio: item.precio || '',
      stock: item.stock ?? '',
      duracion_minutos: item.duracion_minutos ?? '',
      activo: item.activo !== undefined ? item.activo : true,
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, tipo, nombre) => {
    setDeleteModal({ show: true, id, tipo, nombre });
  };

  const confirmDelete = () => {
    if (deleteModal.tipo === 'producto') {
      setProductos((prev) => prev.filter((p) => p.id !== deleteModal.id));
    } else {
      setServicios((prev) => prev.filter((s) => s.id !== deleteModal.id));
    }
    setDeleteModal({ show: false, id: null, tipo: null, nombre: '' });
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, tipo: null, nombre: '' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.nombre.trim()) {
      alert('Por favor, ingresá el nombre.');
      return;
    }
    if (!formData.precio || Number(formData.precio) <= 0) {
      alert('Por favor, ingresá un precio válido.');
      return;
    }
    if (activeTab === 'productos' && (formData.stock === '' || Number(formData.stock) < 0)) {
      alert('Por favor, ingresá un stock válido.');
      return;
    }

    const item = {
      ...formData,
      id: editingId || Date.now(),
      precio: Number(formData.precio),
      stock: activeTab === 'productos' ? Number(formData.stock) : undefined,
      duracion_minutos: activeTab === 'servicios' ? (formData.duracion_minutos ? Number(formData.duracion_minutos) : null) : undefined,
      categoria_id: 1, // Por defecto, se puede mejorar después
    };

    if (activeTab === 'productos') {
      if (editingId) {
        setProductos((prev) => prev.map((p) => (p.id === editingId ? item : p)));
      } else {
        setProductos((prev) => [item, ...prev]);
      }
    } else {
      if (editingId) {
        setServicios((prev) => prev.map((s) => (s.id === editingId ? item : s)));
      } else {
        setServicios((prev) => [item, ...prev]);
      }
    }

    resetForm();
  };

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
        <section className="admin-hero">
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
              <li>Servicios disponibles: {resumen.totalServicios} procedimientos y atención especializada</li>
              <li>Stock total: {resumen.stockTotal} unidades listas para la venta</li>
              <li>Valor estimado: {formatCurrency(resumen.valorInventario)} inventario ponderado a precio de lista</li>
            </ul>
          </div>
        </section>

        <div className="admin-actions-bar">
          <button
            type="button"
            className="admin-card-link"
            onClick={() => navigate('/admin')}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al Admin
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="fa-solid fa-plus"></i>
            {activeTab === 'productos' ? 'Nuevo Producto' : 'Nuevo Servicio'}
          </button>
        </div>

        {showForm && (
          <section className="producto-form-section">
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>
                  {editingId
                    ? `Editar ${activeTab === 'productos' ? 'Producto' : 'Servicio'}`
                    : `Nuevo ${activeTab === 'productos' ? 'Producto' : 'Servicio'}`}
                </h2>
                <button type="button" className="btn-close" onClick={resetForm}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="producto-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">
                      Nombre <span>*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleFieldChange}
                      placeholder={activeTab === 'productos' ? 'Ej: Alimento balanceado premium' : 'Ej: Consulta general'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="categoria_nombre">Categoría</label>
                    <input
                      type="text"
                      id="categoria_nombre"
                      name="categoria_nombre"
                      value={formData.categoria_nombre}
                      onChange={handleFieldChange}
                      placeholder="Ej: alimentos, medicamentos, higiene"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleFieldChange}
                    placeholder="Descripción del producto o servicio..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="precio">
                      Precio <span>*</span>
                    </label>
                    <input
                      type="number"
                      id="precio"
                      name="precio"
                      value={formData.precio}
                      onChange={handleFieldChange}
                      placeholder="Ej: 25000"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {activeTab === 'productos' ? (
                    <div className="form-group">
                      <label htmlFor="stock">
                        Stock <span>*</span>
                      </label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleFieldChange}
                        placeholder="Ej: 20"
                        min="0"
                        required
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label htmlFor="duracion_minutos">Duración (minutos)</label>
                      <input
                        type="number"
                        id="duracion_minutos"
                        name="duracion_minutos"
                        value={formData.duracion_minutos}
                        onChange={handleFieldChange}
                        placeholder="Ej: 30"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleFieldChange}
                    />
                    <span>{activeTab === 'productos' ? 'Producto activo' : 'Servicio disponible'}</span>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Guardar cambios' : `Crear ${activeTab === 'productos' ? 'producto' : 'servicio'}`}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        <section className="products-toolbar">
          <div className="search-box">
            <i className="fa-solid fa-search search-icon"></i>
            <input id='search-products'
              type="text"
              placeholder="Buscar por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} aria-label="Limpiar búsqueda">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        
          <div className="products-tabs " role="tablist">
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

        </section>

       

        {activeTab === 'productos' ? (
          <section className="products-table-wrapper">
              <span className="filters-count">{activeCount} resultados</span><br /><br />
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
                    <th>Acciones</th>
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
                      <td data-label="Acciones" className="table-actions">
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(producto)}
                          title="Editar"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(producto.id, 'producto', producto.nombre)}
                          title="Eliminar"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : (
          <section className="products-table-wrapper">
                <span className="filters-count">{activeCount} resultados</span><br /><br />
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
                    <th>Acciones</th>
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
                      <td data-label="Acciones" className="table-actions">
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(servicio)}
                          title="Editar"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(servicio.id, 'servicio', servicio.nombre)}
                          title="Eliminar"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {deleteModal.show && (
          <div className="delete-modal-overlay" onClick={cancelDelete}>
            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3>¿Eliminar {deleteModal.tipo === 'producto' ? 'producto' : 'servicio'}?</h3>
              <p>
                Estás por eliminar <strong>"{deleteModal.nombre}"</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="delete-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  <i className="fa-solid fa-trash-can"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminProductos;