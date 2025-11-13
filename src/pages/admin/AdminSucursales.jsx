import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeaderAdmin from '@/components/estaticos/HeaderAdmin';
import Footer from '@/components/estaticos/Footer';
import { useToast } from '@/context/ToastContext';
import './Admin.css';

const todosLosServicios = [
  { id: 1, nombre: 'Consulta general', descripcion: 'Consulta de rutina para revisión de mascota', precio: 8000, categoria: 1 },
  { id: 2, nombre: 'Vacunación', descripcion: 'Aplicación de vacunas anuales', precio: 5000, categoria: 1 },
  { id: 3, nombre: 'Baño y corte', descripcion: 'Servicio de peluquería completa', precio: 7000, categoria: 2 },
  { id: 4, nombre: 'Cirugía menor', descripcion: 'Procedimientos quirúrgicos simples', precio: 15000, categoria: 1 },
  { id: 6, nombre: 'Spa para mascotas', descripcion: 'Tratamiento de relajación y estética completa', precio: 9000, categoria: 2 },
  { id: 7, nombre: 'Peluquería', descripcion: 'Corte de pelo y arreglo general', precio: 7000, categoria: 2 },
  { id: 8, nombre: 'Atención 24 horas', descripcion: 'Servicio de atención veterinaria de emergencia', precio: 12000, categoria: 4 },
  { id: 9, nombre: 'Internación', descripcion: 'Cuidado y monitoreo de mascotas internadas', precio: 18000, categoria: 1 },
  { id: 10, nombre: 'Desparasitación', descripcion: 'Tratamiento completo de desparasitación', precio: 4500, categoria: 1 },
  { id: 11, nombre: 'Limpieza dental', descripcion: 'Limpieza dental profesional', precio: 8000, categoria: 1 },
  { id: 12, nombre: 'Entrenamiento avanzado', descripcion: 'Sesión de entrenamiento especializado', precio: 12000, categoria: 2 },
];

const sucursales = [
  {
    id: 1,
    nombre: 'Vettix Central',
    alias: 'Veterinaria Central',
    telefono: '11 2233 4455',
    email: 'central@vet.com',
    direccion: 'Av. Siempre Viva 742, CABA',
    notas: 'Urgencias 24h · Laboratorio integral · Internación premium',
    serviciosIniciales: [1, 2, 4, 8, 9, 10, 11], // Consulta, Vacunación, Cirugía, Atención 24h, Internación, Desparasitación, Limpieza dental
  },
  {
    id: 2,
    nombre: 'Vettix Norte',
    alias: 'Veterinaria Norte',
    telefono: '11 4455 6677',
    email: 'norte@vet.com',
    direccion: 'San Martín 123, Vicente López',
    notas: 'Consultorio especializado en rehabilitación y medicina preventiva',
    serviciosIniciales: [1, 2, 10], // Consulta, Vacunación, Desparasitación
  },
  {
    id: 3,
    nombre: 'Vettix Belgrano',
    alias: 'Veterinaria Belgrano',
    telefono: '11 4789 1234',
    email: 'belgrano@vet.com',
    direccion: 'Av. Cabildo 2300, Belgrano',
    notas: 'Clínica central con internación, spa y diagnóstico avanzado',
    serviciosIniciales: [1, 2, 4, 6, 9, 10, 11], // Consulta, Vacunación, Cirugía, Spa, Internación, Desparasitación, Limpieza dental
  },
  {
    id: 4,
    nombre: 'Vettix Núñez',
    alias: 'Veterinaria Núñez',
    telefono: '11 4789 5678',
    email: 'nunez@vet.com',
    direccion: 'Av. del Libertador 3500, Núñez',
    notas: 'Centro de imagenología, cardiología y telemedicina',
    serviciosIniciales: [1, 2, 4, 10, 11], // Consulta, Vacunación, Cirugía, Desparasitación, Limpieza dental
  },
  {
    id: 5,
    nombre: 'Vettix Saavedra',
    alias: 'Veterinaria Saavedra',
    telefono: '11 4789 9012',
    email: 'saavedra@vet.com',
    direccion: 'Av. Monroe 4800, Saavedra',
    notas: 'Spa premium, nutrición y programas Vettix Walkers',
    serviciosIniciales: [3, 6, 7, 12], // Baño y corte, Spa, Peluquería, Entrenamiento avanzado
  },
];

const AdminSucursales = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [sucursalesList, setSucursalesList] = useState(() => {
    const stored = localStorage.getItem('sucursales-list');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Si hay error, usar valores iniciales
      }
    }
    return sucursales;
  });

  const [serviciosPorSucursal, setServiciosPorSucursal] = useState(() => {
    const stored = localStorage.getItem('sucursales-servicios');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Normalizar las claves a números
        const normalized = {};
        Object.keys(parsed).forEach((key) => {
          normalized[Number(key)] = parsed[key];
        });
        return normalized;
      } catch {
        // Si hay error, usar valores iniciales
      }
    }
    // Valores iniciales según las notas
    const initial = {};
    sucursalesList.forEach((suc) => {
      initial[Number(suc.id)] = suc.serviciosIniciales || [];
    });
    return initial;
  });

  const [sucursalExpandida, setSucursalExpandida] = useState(null);
  const [showModalNuevaSucursal, setShowModalNuevaSucursal] = useState(false);
  const [nuevaSucursal, setNuevaSucursal] = useState({
    nombre: '',
    alias: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: '',
  });

  useEffect(() => {
    localStorage.setItem('sucursales-servicios', JSON.stringify(serviciosPorSucursal));
  }, [serviciosPorSucursal]);

  useEffect(() => {
    localStorage.setItem('sucursales-list', JSON.stringify(sucursalesList));
    
    // Asegurar que todas las sucursales tengan su entrada en serviciosPorSucursal
    setServiciosPorSucursal((prev) => {
      const updated = { ...prev };
      let hasChanges = false;
      
      sucursalesList.forEach((suc) => {
        const idNum = Number(suc.id);
        if (!(idNum in updated)) {
          updated[idNum] = suc.serviciosIniciales || [];
          hasChanges = true;
        }
      });
      
      return hasChanges ? updated : prev;
    });
  }, [sucursalesList]);

  const serviciosDeSucursal = (sucursalId) => {
    const idNum = Number(sucursalId);
    return serviciosPorSucursal[idNum] || [];
  };

  const serviciosDisponiblesParaAgregar = (sucursalId) => {
    const serviciosActuales = serviciosDeSucursal(sucursalId);
    return todosLosServicios.filter((serv) => !serviciosActuales.includes(serv.id));
  };

  const agregarServicio = (sucursalId, servicioId) => {
    const idNum = Number(sucursalId);
    const servIdNum = Number(servicioId);
    
    setServiciosPorSucursal((prev) => {
      const actuales = prev[idNum] || [];
      if (actuales.includes(servIdNum)) return prev;
      const nuevoEstado = {
        ...prev,
        [idNum]: [...actuales, servIdNum],
      };
      return nuevoEstado;
    });
    const servicio = todosLosServicios.find((s) => s.id === servIdNum);
    if (servicio) {
      showSuccess(`Servicio "${servicio.nombre}" agregado a la sucursal`);
    }
  };

  const eliminarServicio = (sucursalId, servicioId) => {
    const idNum = Number(sucursalId);
    const servIdNum = Number(servicioId);
    
    setServiciosPorSucursal((prev) => {
      const actuales = prev[idNum] || [];
      return {
        ...prev,
        [idNum]: actuales.filter((id) => id !== servIdNum),
      };
    });
    const servicio = todosLosServicios.find((s) => s.id === servIdNum);
    if (servicio) {
      showSuccess(`Servicio "${servicio.nombre}" eliminado de la sucursal`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaSucursal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarNuevaSucursal = () => {
    if (!nuevaSucursal.nombre || !nuevaSucursal.direccion || !nuevaSucursal.telefono || !nuevaSucursal.email) {
      showError('Por favor completá todos los campos obligatorios');
      return;
    }

    const nuevoId = Math.max(...sucursalesList.map((s) => s.id), 0) + 1;
    const nueva = {
      id: nuevoId,
      nombre: nuevaSucursal.nombre,
      alias: nuevaSucursal.alias || nuevaSucursal.nombre,
      telefono: nuevaSucursal.telefono,
      email: nuevaSucursal.email,
      direccion: nuevaSucursal.direccion,
      notas: nuevaSucursal.notas || '',
      serviciosIniciales: [],
    };

    setSucursalesList((prev) => [...prev, nueva]);
    setServiciosPorSucursal((prev) => ({
      ...prev,
      [nuevoId]: [],
    }));

    setNuevaSucursal({
      nombre: '',
      alias: '',
      telefono: '',
      email: '',
      direccion: '',
      notas: '',
    });
    setShowModalNuevaSucursal(false);
    showSuccess(`Sucursal "${nueva.nombre}" agregada exitosamente`);
  };

  return (
    <>
      <Helmet>
        <title>Gestión de Sucursales | Vettix</title>
        <meta
          name="description"
          content="Administrá las sucursales de Vettix: información de contacto, ubicaciones y servicios disponibles en cada sede."
        />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content admin-orders">
        <section className="admin-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Gestión de Sucursales</span>
            <h1>Red de Clínicas Vettix</h1>
            <p>
              Administrá la información de contacto, ubicaciones y servicios disponibles en cada una de nuestras sedes.
            </p>
          </div>
          <div className="admin-hero-card">
            <ul>
              <li>Total sucursales: {sucursalesList.length}</li>
              <li>Cobertura: CABA y GBA Norte</li>
              <li>Servicios disponibles en todas las sedes</li>
            </ul>
          </div>
        </section>

        <div className="admin-actions-bar">
         
          <button
            type="button"
            className="admin-card-link"
            onClick={() => setShowModalNuevaSucursal(true)}
          >
            <i className="fa-solid fa-plus"></i>
            Agregar Nueva Sucursal
          </button>
          <button
            type="button"
            className="admin-card-link"
            onClick={() => navigate('/admin')}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al Admin
          </button>
        </div>

        <section className="orders-summary-grid">
          {sucursalesList.map((sucursal) => {
            const sucursalIdNum = Number(sucursal.id);
            const serviciosActuales = serviciosDeSucursal(sucursalIdNum);
            const serviciosDisponibles = serviciosDisponiblesParaAgregar(sucursalIdNum);
            const estaExpandida = Number(sucursalExpandida) === sucursalIdNum;

            return (
              <article key={sucursal.id} className="sucursal-card">
                <div className="sucursal-card-header">
                  <div className="sucursal-icon">
                    <i className="fa-solid fa-store"></i>
                  </div>
                  <div>
                    <h2>{sucursal.nombre}</h2>
                    <span className="sucursal-alias">{sucursal.alias}</span>
                  </div>
                </div>
                <div className="sucursal-card-body">
                  <div className="sucursal-info-row">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{sucursal.direccion}</span>
                  </div>
                  <div className="sucursal-info-row">
                    <i className="fa-solid fa-phone"></i>
                    <span>{sucursal.telefono}</span>
                  </div>
                  <div className="sucursal-info-row">
                    <i className="fa-solid fa-envelope"></i>
                    <span>{sucursal.email}</span>
                  </div>
                  <div className="sucursal-notas">
                    <i className="fa-solid fa-star"></i>
                    <span>{sucursal.notas}</span>
                  </div>

                  <div className="sucursal-servicios-section">
                    <button
                      type="button"
                      className="sucursal-servicios-toggle"
                      onClick={() => setSucursalExpandida(estaExpandida ? null : sucursalIdNum)}
                    >
                      <span>
                        <i className="fa-solid fa-list-check"></i>
                        Servicios ({serviciosActuales.length})
                      </span>
                      <i className={`fa-solid ${estaExpandida ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </button>

                    {estaExpandida && (
                      <div className="sucursal-servicios-content">
                        <div className="servicios-actuales">
                          <h4>Servicios asignados</h4>
                          {serviciosActuales.length === 0 ? (
                            <p className="sin-servicios">No hay servicios asignados</p>
                          ) : (
                            <ul className="servicios-list">
                              {serviciosActuales.map((servicioId) => {
                                const servicio = todosLosServicios.find((s) => s.id === servicioId);
                                if (!servicio) return null;
                                return (
                                  <li key={servicioId} className="servicio-item">
                                    <div className="servicio-info">
                                      <span className="servicio-nombre">{servicio.nombre}</span>
                                      <span className="servicio-precio">${servicio.precio.toLocaleString()}</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn-eliminar-servicio"
                                      onClick={() => eliminarServicio(sucursalIdNum, servicioId)}
                                      title="Eliminar servicio"
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        {serviciosDisponibles.length > 0 && (
                          <div className="servicios-disponibles">
                            <h4>Agregar servicio</h4>
                            <select
                              className="select-agregar-servicio"
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  agregarServicio(sucursalIdNum, Number(e.target.value));
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Seleccionar servicio...</option>
                              {serviciosDisponibles.map((servicio) => (
                                <option key={servicio.id} value={servicio.id}>
                                  {servicio.nombre} - ${servicio.precio.toLocaleString()}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <Footer />

      {showModalNuevaSucursal && (
        <div className="modal-overlay" onClick={() => setShowModalNuevaSucursal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Nueva Sucursal</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowModalNuevaSucursal(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={nuevaSucursal.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Vettix Nueva Sede"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="alias">Alias</label>
                <input
                  type="text"
                  id="alias"
                  name="alias"
                  value={nuevaSucursal.alias}
                  onChange={handleInputChange}
                  placeholder="Ej: Veterinaria Nueva Sede"
                />
              </div>
              <div className="form-group">
                <label htmlFor="direccion">Dirección *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={nuevaSucursal.direccion}
                  onChange={handleInputChange}
                  placeholder="Ej: Av. Principal 123, CABA"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={nuevaSucursal.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: 11 1234 5678"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={nuevaSucursal.email}
                    onChange={handleInputChange}
                    placeholder="Ej: nueva@vet.com"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="notas">Notas / Servicios destacados</label>
                <textarea
                  id="notas"
                  name="notas"
                  value={nuevaSucursal.notas}
                  onChange={handleInputChange}
                  placeholder="Ej: Urgencias 24h · Laboratorio integral"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={() => setShowModalNuevaSucursal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-guardar"
                onClick={guardarNuevaSucursal}
              >
                <i className="fa-solid fa-check"></i>
                Guardar Sucursal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSucursales;

