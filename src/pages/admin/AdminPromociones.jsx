import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeaderAdmin from '../../components/estaticos/HeaderAdmin';
import Footer from '../../components/estaticos/Footer';
import adminProductsData from '@/data/adminProducts.json';
import './AdminPromociones.css';
import './Admin.css';

const STORAGE_KEY = 'vettix_promociones';

const speciesOptions = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'small_mammal', label: 'Conejo / Pequeño mamífero' },
  { value: 'reptile', label: 'Reptil' },
  { value: 'other', label: 'Otra especie' },
];

const initialFormState = {
  nombre: '',
  descripcion: '',
  tipoDescuento: 'porcentaje', // 'porcentaje' o 'monto_fijo'
  valorDescuento: '',
  aplicableA: 'todos', // 'todos', 'productos', 'servicios', 'categoria', 'especifico'
  categoria: '',
  productosIds: [],
  serviciosIds: [],
  fechaInicio: '',
  fechaFin: '',
  activa: true,
  codigoPromocional: '',
  publicarInstagram: false,
  publicarFacebook: false,
  etiquetarMascotas: false,
  tipoEtiquetado: 'tipo', // 'tipo' o 'raza'
  especiesEtiquetar: [],
  razasEtiquetar: [],
};

const AdminPromociones = () => {
  const navigate = useNavigate();
  const productos = adminProductsData.productos ?? [];
  const servicios = adminProductsData.servicios ?? [];
  
  const [promociones, setPromociones] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas'); // 'todas', 'activas', 'inactivas', 'vencidas'
  const [searchProductos, setSearchProductos] = useState('');
  const [searchServicios, setSearchServicios] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(promociones));
  }, [promociones]);

  const normalize = (value) => (value ?? '').toString().toLowerCase();

  const promocionesFiltradas = useMemo(() => {
    let filtered = promociones;

    // Filtrar por estado
    if (filterEstado === 'activas') {
      filtered = filtered.filter((p) => p.activa && new Date(p.fechaFin) >= new Date());
    } else if (filterEstado === 'inactivas') {
      filtered = filtered.filter((p) => !p.activa);
    } else if (filterEstado === 'vencidas') {
      filtered = filtered.filter((p) => new Date(p.fechaFin) < new Date());
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = normalize(searchTerm);
      filtered = filtered.filter((p) =>
        [p.nombre, p.descripcion, p.codigoPromocional].some((field) =>
          normalize(field).includes(term)
        )
      );
    }

    return filtered;
  }, [promociones, searchTerm, filterEstado]);

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Limpiar selecciones cuando cambia el tipo de aplicable
      ...(name === 'aplicableA' && value !== 'especifico'
        ? { productosIds: [], serviciosIds: [] }
        : {}),
    }));
  };

  const handleToggleProducto = (productoId) => {
    setFormData((prev) => {
      const currentIds = prev.productosIds || [];
      const newIds = currentIds.includes(productoId)
        ? currentIds.filter((id) => id !== productoId)
        : [...currentIds, productoId];
      return { ...prev, productosIds: newIds };
    });
  };

  const handleToggleServicio = (servicioId) => {
    setFormData((prev) => {
      const currentIds = prev.serviciosIds || [];
      const newIds = currentIds.includes(servicioId)
        ? currentIds.filter((id) => id !== servicioId)
        : [...currentIds, servicioId];
      return { ...prev, serviciosIds: newIds };
    });
  };

  const productosFiltrados = useMemo(() => {
    if (!searchProductos) return productos;
    const term = normalize(searchProductos);
    return productos.filter((p) =>
      normalize(p.nombre || '').includes(term) ||
      normalize(p.descripcion || '').includes(term) ||
      normalize(p.categoria_nombre || '').includes(term)
    );
  }, [productos, searchProductos]);

  const serviciosFiltrados = useMemo(() => {
    if (!searchServicios) return servicios;
    const term = normalize(searchServicios);
    return servicios.filter((s) =>
      normalize(s.nombre || '').includes(term) ||
      normalize(s.descripcion || '').includes(term) ||
      normalize(s.categoria_nombre || '').includes(term)
    );
  }, [servicios, searchServicios]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.nombre.trim()) {
      alert('Por favor, ingresá el nombre de la promoción.');
      return;
    }
    if (!formData.valorDescuento || Number(formData.valorDescuento) <= 0) {
      alert('Por favor, ingresá un valor de descuento válido.');
      return;
    }
    if (!formData.fechaInicio || !formData.fechaFin) {
      alert('Por favor, seleccioná las fechas de vigencia.');
      return;
    }
    if (new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }
    if (
      formData.aplicableA === 'especifico' &&
      (!formData.productosIds || formData.productosIds.length === 0) &&
      (!formData.serviciosIds || formData.serviciosIds.length === 0)
    ) {
      alert('Por favor, seleccioná al menos un producto o servicio para promociones específicas.');
      return;
    }

    const promocion = {
      ...formData,
      id: editingId || Date.now(),
      valorDescuento: Number(formData.valorDescuento),
      createdAt: editingId
        ? promociones.find((p) => p.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setPromociones((prev) => prev.map((p) => (p.id === editingId ? promocion : p)));
    } else {
      setPromociones((prev) => [promocion, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (promocion) => {
    setFormData(promocion);
    setEditingId(promocion.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que querés eliminar esta promoción?')) {
      setPromociones((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const toggleActiva = (id) => {
    setPromociones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p))
    );
  };

  const formatCurrency = (value) =>
    value?.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }) ?? '$0,00';

  const formatDescuento = (promocion) => {
    if (promocion.tipoDescuento === 'porcentaje') {
      return `${promocion.valorDescuento}% OFF`;
    }
    return `${formatCurrency(promocion.valorDescuento)} OFF`;
  };

  const isVencida = (fechaFin) => new Date(fechaFin) < new Date();
  const isActiva = (promocion) => promocion.activa && !isVencida(promocion.fechaFin);

  return (
    <div className="admin-page">
      <Helmet>
        <title>Gestión de Promociones | Admin Vettix</title>
        <meta
          name="description"
          content="Panel administrativo para crear y gestionar promociones, descuentos y ofertas especiales de Vettix."
        />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content admin-promociones">
        <section className="admin-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Promociones</span>
            <h1>Gestión de Promociones y Descuentos</h1>
            <p>
              Creá y gestioná promociones especiales, descuentos y ofertas para productos y servicios.
              Controlá fechas de vigencia y estados de cada promoción.
            </p>
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
            Nueva Promoción
          </button>
        </div>

        {showForm && (
          <section className="promocion-form-section">
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>{editingId ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
                <button type="button" className="btn-close" onClick={resetForm}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="promocion-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">
                      Nombre de la promoción <span>*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleFieldChange}
                      placeholder="Ej: Descuento de Verano"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codigoPromocional">Código promocional</label>
                    <input
                      type="text"
                      id="codigoPromocional"
                      name="codigoPromocional"
                      value={formData.codigoPromocional}
                      onChange={handleFieldChange}
                      placeholder="Ej: VERANO2024"
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
                    placeholder="Descripción de la promoción..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tipoDescuento">Tipo de descuento</label>
                    <select
                      id="tipoDescuento"
                      name="tipoDescuento"
                      value={formData.tipoDescuento}
                      onChange={handleFieldChange}
                    >
                      <option value="porcentaje">Porcentaje (%)</option>
                      <option value="monto_fijo">Monto fijo ($)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="valorDescuento">
                      Valor del descuento <span>*</span>
                    </label>
                    <input
                      type="number"
                      id="valorDescuento"
                      name="valorDescuento"
                      value={formData.valorDescuento}
                      onChange={handleFieldChange}
                      placeholder={formData.tipoDescuento === 'porcentaje' ? 'Ej: 20' : 'Ej: 5000'}
                      min="0"
                      step={formData.tipoDescuento === 'porcentaje' ? '1' : '0.01'}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="aplicableA">Aplicable a</label>
                  <select
                    id="aplicableA"
                    name="aplicableA"
                    value={formData.aplicableA}
                    onChange={handleFieldChange}
                  >
                    <option value="todos">Todos los productos y servicios</option>
                    <option value="productos">Solo productos</option>
                    <option value="servicios">Solo servicios</option>
                    <option value="categoria">Por categoría</option>
                    <option value="especifico">Productos/servicios específicos</option>
                  </select>
                </div>

                {formData.aplicableA === 'especifico' && (
                  <div className="productos-servicios-selector">
                    <div className="selector-section">
                      <div className="selector-header">
                        <h4>
                          <i className="fa-solid fa-box"></i> Productos
                          {formData.productosIds?.length > 0 && (
                            <span className="selected-count">({formData.productosIds.length} seleccionados)</span>
                          )}
                        </h4>
                        <div className="search-input-wrapper">
                          <i className="fa-solid fa-search search-icon"></i>
                          <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar productos..."
                            value={searchProductos}
                            onChange={(e) => setSearchProductos(e.target.value)}
                          />
                          {searchProductos && (
                            <button
                              type="button"
                              className="clear-search"
                              onClick={() => setSearchProductos('')}
                            >
                              <i className="fa-solid fa-times"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="items-list">
                        {productosFiltrados.length === 0 ? (
                          <p className="no-items">No se encontraron productos</p>
                        ) : (
                          productosFiltrados.map((producto) => {
                            const isSelected = formData.productosIds?.includes(producto.id);
                            return (
                              <label
                                key={producto.id}
                                className={`item-checkbox ${isSelected ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleProducto(producto.id)}
                                />
                                <div className="item-info">
                                  <span className="item-name">{producto.nombre}</span>
                                  <span className="item-details">
                                    {producto.categoria_nombre || 'Sin categoría'} ·{' '}
                                    {producto.precio?.toLocaleString('es-AR', {
                                      style: 'currency',
                                      currency: 'ARS',
                                    }) || 'Sin precio'}
                                  </span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="selector-section">
                      <div className="selector-header">
                        <h4>
                          <i className="fa-solid fa-stethoscope"></i> Servicios
                          {formData.serviciosIds?.length > 0 && (
                            <span className="selected-count">({formData.serviciosIds.length} seleccionados)</span>
                          )}
                        </h4>
                        <div className="search-input-wrapper">
                          <i className="fa-solid fa-search search-icon"></i>
                          <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar servicios..."
                            value={searchServicios}
                            onChange={(e) => setSearchServicios(e.target.value)}
                          />
                          {searchServicios && (
                            <button
                              type="button"
                              className="clear-search"
                              onClick={() => setSearchServicios('')}
                            >
                              <i className="fa-solid fa-times"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="items-list">
                        {serviciosFiltrados.length === 0 ? (
                          <p className="no-items">No se encontraron servicios</p>
                        ) : (
                          serviciosFiltrados.map((servicio) => {
                            const isSelected = formData.serviciosIds?.includes(servicio.id);
                            return (
                              <label
                                key={servicio.id}
                                className={`item-checkbox ${isSelected ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleServicio(servicio.id)}
                                />
                                <div className="item-info">
                                  <span className="item-name">{servicio.nombre}</span>
                                  <span className="item-details">
                                    {servicio.categoria_nombre || 'Sin categoría'} ·{' '}
                                    {servicio.precio?.toLocaleString('es-AR', {
                                      style: 'currency',
                                      currency: 'ARS',
                                    }) || 'Sin precio'}
                                  </span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fechaInicio">
                      Fecha de inicio <span>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="fechaInicio"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleFieldChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fechaFin">
                      Fecha de fin <span>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="fechaFin"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleFieldChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="activa"
                      checked={formData.activa}
                      onChange={handleFieldChange}
                    />
                    <span>Promoción activa</span>
                  </label>
                </div>

                <div className="form-section-divider">
                  <h3>Publicación en Redes Sociales</h3>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="publicarInstagram"
                      checked={formData.publicarInstagram}
                      onChange={handleFieldChange}
                    />
                    <span>
                      <i className="fa-brands fa-instagram"></i> Publicar en Instagram
                    </span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="publicarFacebook"
                      checked={formData.publicarFacebook}
                      onChange={handleFieldChange}
                    />
                    <span>
                      <i className="fa-brands fa-facebook"></i> Publicar en Facebook
                    </span>
                  </label>
                </div>

                {(formData.publicarInstagram || formData.publicarFacebook) && (
                  <>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="etiquetarMascotas"
                          checked={formData.etiquetarMascotas}
                          onChange={handleFieldChange}
                        />
                        <span>
                          <i className="fa-solid fa-tags"></i> Etiquetar mascotas en la publicación
                        </span>
                      </label>
                    </div>

                    {formData.etiquetarMascotas && (
                      <>
                        <div className="form-group">
                          <label htmlFor="tipoEtiquetado">Etiquetar por</label>
                          <select
                            id="tipoEtiquetado"
                            name="tipoEtiquetado"
                            value={formData.tipoEtiquetado}
                            onChange={handleFieldChange}
                          >
                            <option value="tipo">Tipo de mascota (especie)</option>
                            <option value="raza">Raza específica</option>
                          </select>
                        </div>

                        {formData.tipoEtiquetado === 'tipo' && (
                          <div className="form-group">
                            <label>Seleccionar especies a etiquetar</label>
                            <div className="species-checkboxes">
                              {speciesOptions.map((species) => {
                                const isSelected = formData.especiesEtiquetar?.includes(species.value);
                                return (
                                  <label
                                    key={species.value}
                                    className={`checkbox-label ${isSelected ? 'selected' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        const current = formData.especiesEtiquetar || [];
                                        const newList = e.target.checked
                                          ? [...current, species.value]
                                          : current.filter((s) => s !== species.value);
                                        setFormData((prev) => ({
                                          ...prev,
                                          especiesEtiquetar: newList,
                                        }));
                                      }}
                                    />
                                    <span>{species.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {formData.tipoEtiquetado === 'raza' && (
                          <div className="form-group">
                            <label htmlFor="razasEtiquetar">Razas a etiquetar (separadas por comas)</label>
                            <input
                              type="text"
                              id="razasEtiquetar"
                              name="razasEtiquetar"
                              value={Array.isArray(formData.razasEtiquetar) ? formData.razasEtiquetar.join(', ') : formData.razasEtiquetar || ''}
                              onChange={(e) => {
                                const razas = e.target.value
                                  .split(',')
                                  .map((r) => r.trim())
                                  .filter((r) => r.length > 0);
                                setFormData((prev) => ({
                                  ...prev,
                                  razasEtiquetar: razas,
                                }));
                              }}
                              placeholder="Ej: Labrador Retriever, Golden Retriever, Siames"
                            />
                            <small className="form-hint">
                              Ingresá las razas separadas por comas. Se etiquetarán a todas las mascotas que tengan estas razas.
                            </small>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Guardar cambios' : 'Crear promoción'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        <section className="promociones-list-section">
          <div className="filters-panel">
            <div className="search-input-wrapper">
              <i className="fa-solid fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre, descripción o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              )}
            </div>
            <select
              className="filter-select"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="todas">Todas las promociones</option>
              <option value="activas">Solo activas</option>
              <option value="inactivas">Solo inactivas</option>
              <option value="vencidas">Vencidas</option>
            </select>
          </div>

          {promocionesFiltradas.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-tags"></i>
              <h3>No hay promociones</h3>
              <p>
                {searchTerm || filterEstado !== 'todas'
                  ? 'No se encontraron promociones con los filtros aplicados.'
                  : 'Creá tu primera promoción para comenzar a ofrecer descuentos y ofertas especiales.'}
              </p>
            </div>
          ) : (
            <div className="promociones-grid">
              {promocionesFiltradas.map((promocion) => (
                <article key={promocion.id} className="promocion-card">
                  <div className="promocion-header">
                    <div>
                      <h3>{promocion.nombre}</h3>
                      {promocion.codigoPromocional && (
                        <span className="promocion-codigo">
                          <i className="fa-solid fa-tag"></i> {promocion.codigoPromocional}
                        </span>
                      )}
                    </div>
                    <div className="promocion-descuento">{formatDescuento(promocion)}</div>
                  </div>

                  {promocion.descripcion && (
                    <p className="promocion-descripcion">{promocion.descripcion}</p>
                  )}

                  <div className="promocion-info">
                    <div>
                      <strong>Aplicable a:</strong>{' '}
                      {promocion.aplicableA === 'todos'
                        ? 'Todos los productos y servicios'
                        : promocion.aplicableA === 'productos'
                        ? 'Solo productos'
                        : promocion.aplicableA === 'servicios'
                        ? 'Solo servicios'
                        : promocion.aplicableA === 'categoria'
                        ? `Categoría: ${promocion.categoria || 'N/A'}`
                        : promocion.aplicableA === 'especifico'
                        ? `Productos/servicios específicos (${(promocion.productosIds?.length || 0) + (promocion.serviciosIds?.length || 0)} seleccionados)`
                        : 'N/A'}
                    </div>
                    {(promocion.publicarInstagram || promocion.publicarFacebook) && (
                      <div className="promocion-redes">
                        <strong>Publicar en:</strong>{' '}
                        <span className="redes-badges">
                          {promocion.publicarInstagram && (
                            <span className="red-badge instagram">
                              <i className="fa-brands fa-instagram"></i> Instagram
                            </span>
                          )}
                          {promocion.publicarFacebook && (
                            <span className="red-badge facebook">
                              <i className="fa-brands fa-facebook"></i> Facebook
                            </span>
                          )}
                        </span>
                        {promocion.etiquetarMascotas && (
                          <div className="etiquetado-info">
                            <i className="fa-solid fa-tags"></i>{' '}
                            {promocion.tipoEtiquetado === 'tipo'
                              ? `Etiquetar por tipo: ${promocion.especiesEtiquetar?.map((esp) => speciesOptions.find((s) => s.value === esp)?.label || esp).join(', ') || 'Ninguna'}`
                              : `Etiquetar por raza: ${Array.isArray(promocion.razasEtiquetar) ? promocion.razasEtiquetar.join(', ') : promocion.razasEtiquetar || 'Ninguna'}`}
                          </div>
                        )}
                      </div>
                    )}
                    {promocion.aplicableA === 'especifico' && (
                      <div className="promocion-items-detail">
                        {promocion.productosIds?.length > 0 && (
                          <div>
                            <strong>Productos:</strong>{' '}
                            {promocion.productosIds
                              .map((id) => {
                                const producto = productos.find((p) => p.id === id);
                                return producto?.nombre || `ID: ${id}`;
                              })
                              .join(', ')}
                          </div>
                        )}
                        {promocion.serviciosIds?.length > 0 && (
                          <div>
                            <strong>Servicios:</strong>{' '}
                            {promocion.serviciosIds
                              .map((id) => {
                                const servicio = servicios.find((s) => s.id === id);
                                return servicio?.nombre || `ID: ${id}`;
                              })
                              .join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <strong>Vigencia:</strong>{' '}
                      {new Date(promocion.fechaInicio).toLocaleDateString('es-AR')} -{' '}
                      {new Date(promocion.fechaFin).toLocaleDateString('es-AR')}
                    </div>
                  </div>

                  <div className="promocion-status">
                    <span
                      className={`status-badge ${
                        isVencida(promocion.fechaFin)
                          ? 'vencida'
                          : isActiva(promocion)
                          ? 'activa'
                          : 'inactiva'
                      }`}
                    >
                      {isVencida(promocion.fechaFin)
                        ? 'Vencida'
                        : isActiva(promocion)
                        ? 'Activa'
                        : 'Inactiva'}
                    </span>
                  </div>

                  <div className="promocion-actions">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => toggleActiva(promocion.id)}
                    >
                      <i className={`fa-solid fa-toggle-${promocion.activa ? 'on' : 'off'}`}></i>
                      {promocion.activa ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => handleEdit(promocion)}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Editar
                    </button>
                    <button
                      type="button"
                      className="btn-link danger"
                      onClick={() => handleDelete(promocion.id)}
                    >
                      <i className="fa-solid fa-trash-can"></i> Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPromociones;

