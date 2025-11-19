import React, { useMemo, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import HeaderAdmin from '../../components/estaticos/HeaderAdmin';
import Footer from '../../components/estaticos/Footer';
import adminUsuariosData from '@/data/adminUsuarios.json';
import './AdminUsuarios.css';
import './Admin.css';

const formatRoles = (roles) =>
  Array.isArray(roles) && roles.length > 0 ? roles.join(' · ') : 'Sin roles asignados';

const normalizarPersona = (persona) => {
  const roles = Array.isArray(persona.roles) ? persona.roles : [];
  const especialidades = Array.isArray(persona.especialidades) ? persona.especialidades : [];
  const servicioTiposRaw =
    persona.servicio_tipo ??
    persona.servicioTipo ??
    persona.servicioTipos ??
    persona.servicios ??
    [];
  const servicios = Array.isArray(servicioTiposRaw)
    ? servicioTiposRaw
    : servicioTiposRaw
      ? [servicioTiposRaw]
      : [];
  const mascotas = Array.isArray(persona.mascotas) ? persona.mascotas : [];
  const rolesSistema = Array.isArray(persona.rolesSistema) ? persona.rolesSistema : [];
  return {
    id: persona.id,
    nombre: persona.nombre ?? '',
    apellido: persona.apellido ?? '',
    nombreCompleto: `${persona.nombre ?? ''} ${persona.apellido ?? ''}`.trim() || 'Sin nombre',
    email: persona.email ?? 'Sin email',
    dni: persona.dni ?? 'Sin DNI',
    telefono: persona.telefono ?? 'Sin teléfono',
    roles,
    tipo: persona.tipo ?? 'Sin tipo',
    matricula: persona.matricula ?? null,
    especialidades,
    servicioTipo: servicios.join(' · ') || '',
    servicios,
    mascotas,
    rolesSistema,
    activo: persona.activo ?? false
  };
};

const ROLE_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'veterinario', label: 'Veterinario' },
  { value: 'personal_servicio', label: 'Servicios' },
  { value: 'usuario_sistema', label: 'Usuario del sistema' }
];

const SERVICIO_TIPOS = ['Peluquero', 'Entrenador', 'Paseador'];

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'small_mammal', label: 'Conejo / Pequeño mamífero' },
  { value: 'reptile', label: 'Reptil' },
  { value: 'other', label: 'Otra especie' }
];

const initialUserForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  dni: '',
  activo: true,
  roles: [],
  matricula: '',
  specialties: [],
  specialtyInput: '',
  servicios: [],
  systemRole: '',
  mascotas: [],
  petDraft: {
    name: '',
    species: '',
    breed: '',
    sex: '',
    age: '',
    weight: '',
    birthDate: '',
    color: '',
    microchip: '',
    vaccinated: false,
    dewormed: false,
    sterilized: false,
    allergies: '',
    chronicConditions: '',
    notes: ''
  }
};

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const resumenRolesBase = adminUsuariosData.resumen_roles ?? {};
  const [personas, setPersonas] = useState(() =>
    (adminUsuariosData.personas ?? []).map(normalizarPersona)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFiltro, setRolFiltro] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState(initialUserForm);

  const normalize = (value) => (value ?? '').toString().toLowerCase();

  const resumenCalculado = useMemo(() => {
    const total_personas = personas.length;
    const total_clientes = personas.filter((persona) => persona.roles.includes('cliente')).length;
    const total_veterinarios = personas.filter((persona) => persona.roles.includes('veterinario')).length;
    const total_personal_servicio = personas.filter((persona) =>
      persona.roles.includes('personal_servicio')
    ).length;
    const total_usuarios_sistema = personas.filter((persona) =>
      persona.roles.includes('usuario_sistema')
    ).length;

    const rolesSet = new Set(resumenRolesBase.roles_disponibles ?? []);
    personas.forEach((persona) => {
      persona.roles.forEach((role) => rolesSet.add(role));
    });

    return {
      total_personas,
      total_clientes,
      total_veterinarios,
      total_personal_servicio,
      total_usuarios_sistema,
      roles_disponibles: Array.from(rolesSet)
    };
  }, [personas, resumenRolesBase.roles_disponibles]);

  const rolesDisponibles = useMemo(
    () => ['Todos', ...resumenCalculado.roles_disponibles],
    [resumenCalculado.roles_disponibles]
  );

  const especialidadesDisponibles = useMemo(() => {
    const set = new Set();
    personas.forEach((persona) => {
      (persona.especialidades ?? []).forEach((especialidad) => {
        if (especialidad) set.add(especialidad);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [personas]);

  const personasFiltradas = useMemo(() => {
    const term = normalize(searchTerm);
    return personas.filter((persona) => {
      const matchesRol = rolFiltro === 'Todos' || persona.roles.includes(rolFiltro);
      if (!matchesRol) return false;
      if (!term) return true;
      return [persona.nombreCompleto, persona.email, persona.dni, persona.telefono, persona.tipo, ...persona.roles]
        .filter(Boolean)
        .some((field) => normalize(field).includes(term));
    });
  }, [personas, searchTerm, rolFiltro, normalize]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setNuevoUsuario(initialUserForm);
  }, []);

  const handleBaseFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (role) => {
    setNuevoUsuario((prev) => {
      const hasRole = prev.roles.includes(role);
      const roles = hasRole ? prev.roles.filter((item) => item !== role) : [...prev.roles, role];
      let nextState = { ...prev, roles };
      if (!roles.includes('veterinario')) {
        nextState = { ...nextState, specialties: [], matricula: '' };
      }
      if (!roles.includes('personal_servicio')) {
        nextState = { ...nextState, servicios: [] };
      }
      if (!roles.includes('usuario_sistema')) {
        nextState = { ...nextState, systemRole: '' };
      }
      if (!roles.includes('cliente')) {
        nextState = { ...nextState, mascotas: [] };
      }
      return nextState;
    });
  };

  const toggleSpecialty = (specialty) => {
    setNuevoUsuario((prev) => {
      const specialties = prev.specialties.includes(specialty)
        ? prev.specialties.filter((item) => item !== specialty)
        : [...prev.specialties, specialty];
      return { ...prev, specialties };
    });
  };

  const toggleServicioTipo = (servicio) => {
    setNuevoUsuario((prev) => {
      const servicios = prev.servicios?.includes(servicio)
        ? prev.servicios.filter((item) => item !== servicio)
        : [...(prev.servicios ?? []), servicio];
      return { ...prev, servicios };
    });
  };

  const handleAddSpecialty = () => {
    const value = nuevoUsuario.specialtyInput.trim();
    if (!value) return;
    setNuevoUsuario((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(value) ? prev.specialties : [...prev.specialties, value],
      specialtyInput: ''
    }));
  };

  const handlePetDraftChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      petDraft: {
        ...prev.petDraft,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleAddPet = () => {
    const {
      name,
      species,
      breed,
      sex,
      age,
      weight,
      birthDate,
      color,
      microchip,
      vaccinated,
      dewormed,
      sterilized,
      allergies,
      chronicConditions,
      notes
    } = nuevoUsuario.petDraft;

    if (!name.trim() || !species.trim() || !breed.trim()) {
      alert('Completá nombre, especie y raza de la mascota.');
      return;
    }

    const normalizedAge = age !== '' ? Number(age) : '';
    const normalizedWeight = weight !== '' ? Number(weight) : '';
    setNuevoUsuario((prev) => ({
      ...prev,
      mascotas: [
        ...prev.mascotas,
        {
          id: Date.now(),
          name: name.trim(),
          species,
          breed: breed.trim(),
          sex,
          age: Number.isNaN(normalizedAge) ? '' : normalizedAge,
          weight: Number.isNaN(normalizedWeight) ? '' : normalizedWeight,
          birthDate,
          color,
          microchip,
          vaccinated: Boolean(vaccinated),
          dewormed: Boolean(dewormed),
          sterilized: Boolean(sterilized),
          allergies,
          chronicConditions,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      petDraft: {
        name: '',
        species: '',
        breed: '',
        sex: '',
        age: '',
        weight: '',
        birthDate: '',
        color: '',
        microchip: '',
        vaccinated: false,
        dewormed: false,
        sterilized: false,
        allergies: '',
        chronicConditions: '',
        notes: ''
      }
    }));
  };

  const handleRemovePet = (id) => {
    setNuevoUsuario((prev) => ({
      ...prev,
      mascotas: prev.mascotas.filter((pet) => pet.id !== id)
    }));
  };

  const handleSubmitNuevoUsuario = (event) => {
    event.preventDefault();
    if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.apellido.trim()) {
      alert('Completá nombre y apellido del usuario.');
      return;
    }
    if (!nuevoUsuario.email.trim()) {
      alert('Ingresá un email válido.');
      return;
    }
    if (nuevoUsuario.roles.length === 0) {
      alert('Seleccioná al menos un rol.');
      return;
    }
    if (
      nuevoUsuario.roles.includes('veterinario') &&
      nuevoUsuario.specialties.length === 0
    ) {
      alert('Asigná al menos una especialidad para el rol de veterinario.');
      return;
    }
    if (
      nuevoUsuario.roles.includes('personal_servicio') &&
      (!nuevoUsuario.servicios || nuevoUsuario.servicios.length === 0)
    ) {
      alert('Seleccioná al menos un tipo de servicio (peluquero, entrenador o paseador).');
      return;
    }
    if (nuevoUsuario.roles.includes('usuario_sistema') && !nuevoUsuario.systemRole) {
      alert('Seleccioná el rol del usuario del sistema.');
      return;
    }

    const tipoParts = [];
    if (nuevoUsuario.roles.includes('cliente')) tipoParts.push('cliente');
    if (nuevoUsuario.roles.includes('veterinario')) tipoParts.push('veterinario');
    if (nuevoUsuario.roles.includes('personal_servicio')) {
      if (nuevoUsuario.servicios && nuevoUsuario.servicios.length > 0) {
        tipoParts.push(
          nuevoUsuario.servicios.map((servicio) => servicio.toLowerCase()).join('/')
        );
      } else {
        tipoParts.push('personal_servicio');
      }
    }
    if (nuevoUsuario.roles.includes('usuario_sistema')) tipoParts.push('usuario_sistema');

    const nuevaPersona = {
      id: Date.now(),
      nombre: nuevoUsuario.nombre.trim(),
      apellido: nuevoUsuario.apellido.trim(),
      email: nuevoUsuario.email.trim(),
      telefono: nuevoUsuario.telefono.trim(),
      dni: nuevoUsuario.dni.trim(),
      roles: nuevoUsuario.roles,
      tipo: tipoParts.length > 0 ? tipoParts.join('/') : 'Sin tipo',
      activo: nuevoUsuario.activo,
      matricula: nuevoUsuario.roles.includes('veterinario') ? nuevoUsuario.matricula.trim() || null : null,
      especialidades: nuevoUsuario.roles.includes('veterinario') ? nuevoUsuario.specialties : [],
      servicio_tipo:
        nuevoUsuario.roles.includes('personal_servicio') && nuevoUsuario.servicios
          ? nuevoUsuario.servicios
          : undefined,
      mascotas: nuevoUsuario.roles.includes('cliente') ? nuevoUsuario.mascotas : [],
      rolesSistema: nuevoUsuario.roles.includes('usuario_sistema')
        ? [nuevoUsuario.systemRole]
        : []
    };

    const personaNormalizada = normalizarPersona(nuevaPersona);
    setPersonas((prev) => [...prev, personaNormalizada]);
    closeModal();
  };

  return (
    <div className="admin-page">
      <Helmet>
        <title>Gestión de Usuarios | Admin Vettix</title>
        <meta
          name="description"
          content="Panel administrativo para consultar clientes, veterinarios y personal del ecosistema Vettix." />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content">
        <section className="admin-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Administrar Usuarios</span>
            <h1>Clientes, veterinarios y personal de servicios</h1>
            <p>
              Explorá la base consolidada de personas y roles asociados al sistema.
            </p>
          </div>
          <div className="admin-users-hero-card">
            <ul>
              <li>Total personas registradas: {resumenCalculado.total_personas}</li>
              <li>Clientes activos: {resumenCalculado.total_clientes}</li>
              <li>Veterinarios activos: {resumenCalculado.total_veterinarios}</li>
              <li>Personal de servicios: {resumenCalculado.total_personal_servicio}</li>
            </ul>
          </div>
        </section>

        <section className="users-summary-grid">
          <article className="users-summary-card">
            <h3>Personas</h3>
            <p className="summary-value">{personas.length}</p>
            <span className="summary-sub">Contactos consolidados en el sistema</span>
          </article>
          <article className="users-summary-card">
            <h3>Roles únicos</h3>
            <p className="summary-value">{resumenCalculado.roles_disponibles.length}</p>
            <span className="summary-sub">Roles disponibles para asignación</span>
          </article>
          <article className="users-summary-card">
            <h3>Usuarios del sistema</h3>
            <p className="summary-value">{resumenCalculado.total_usuarios_sistema}</p>
            <span className="summary-sub">Usuarios con acceso al panel</span>
          </article>
          <article className="users-summary-card">
            <h3>Última actualización</h3>
            <p className="summary-value">
              {resumenRolesBase.fecha_actualizacion
                ? new Date(resumenRolesBase.fecha_actualizacion).toLocaleDateString('es-AR')
                : new Date(adminUsuariosData.metadata?.fecha_actualizacion ?? Date.now()).toLocaleDateString('es-AR')}
            </p>
            <span className="summary-sub">Sincronización de datos de personas</span>
          </article>
        </section>

        <section className="users-toolbar">
          <div className="search-box">
            <i className="fa-solid fa-search search-icon"></i>&nbsp;
            <input
              type="text"
              placeholder="Buscar por nombre, email, DNI o rol..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} aria-label="Limpiar búsqueda">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <div className='admin-actions-bar'>
            <button
              type="button"
              className="admin-card-link"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fa-solid fa-user-plus"></i> Nuevo usuario
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


        </section>

        <section className="users-table-wrapper">
          {personasFiltradas.length === 0 ? (
            <div className="users-empty">
              <i className="fa-solid fa-users-slash"></i>
              <h3>No se encontraron personas</h3>
              <p>Ajustá la búsqueda o seleccioná otro rol para visualizar resultados.</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre · Email</th>
                  <th>Contacto</th>
                  <th>Roles</th>
                  <th>Detalles</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {personasFiltradas.map((persona) => (
                  <tr key={persona.id}>
                    <td data-label="Nombre y email">
                      <div className="user-name-block">
                        <strong>{persona.nombreCompleto}</strong>
                        <span>{persona.email}</span>
                      </div>
                    </td>
                    <td data-label="Contacto">
                      <div className="user-contact-block">
                        <span>DNI: {persona.dni}</span>
                        <span>Tel: {persona.telefono}</span>
                      </div>
                    </td>
                    <td data-label="Roles">
                      <div className="user-roles">
                        {persona.roles.map((rol) => (
                          <span key={`${persona.id}-${rol}`} className="users-pill">
                            {rol}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td data-label="Detalles">
                      <div className="user-details">
                        <span className="summary-muted">Tipo: {persona.tipo}</span>
                        {persona.matricula && <span>Matrícula: {persona.matricula}</span>}
                        {persona.especialidades.length > 0 && (
                          <span>Especialidades: {persona.especialidades.join(', ')}</span>
                        )}
                        {persona.servicios?.length > 0 && (
                          <span>
                            Servicio: {persona.servicios.join(' · ')}
                          </span>
                        )}
                        {persona.rolesSistema?.length > 0 && (
                          <span>Rol sistema: {persona.rolesSistema.join(', ')}</span>
                        )}
                      </div>
                    </td>
                    <td data-label="Estado">
                      <span className={`status-chip ${persona.activo ? 'active' : 'inactive'}`}>
                        {persona.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
      <Footer />
      {isModalOpen && (
        <div className="users-modal-backdrop" role="dialog" aria-modal="true">
          <div className="users-modal">
            <header className="users-modal__header">
              <div>
                <h2>Alta de usuario</h2>
                <p>Completá los datos y asigná los roles correspondientes.</p>
              </div>
              <button type="button" className="users-modal__close" onClick={closeModal} aria-label="Cerrar">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </header>
            <form className="users-modal__form" onSubmit={handleSubmitNuevoUsuario}>
              <section className="users-modal__grid">
                <div className="form-control">
                  <label htmlFor="nuevo-nombre">Nombre</label>
                  <input
                    id="nuevo-nombre"
                    name="nombre"
                    value={nuevoUsuario.nombre}
                    onChange={handleBaseFieldChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="nuevo-apellido">Apellido</label>
                  <input
                    id="nuevo-apellido"
                    name="apellido"
                    value={nuevoUsuario.apellido}
                    onChange={handleBaseFieldChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="nuevo-email">Email</label>
                  <input
                    id="nuevo-email"
                    name="email"
                    type="email"
                    value={nuevoUsuario.email}
                    onChange={handleBaseFieldChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="nuevo-telefono">Teléfono</label>
                  <input
                    id="nuevo-telefono"
                    name="telefono"
                    value={nuevoUsuario.telefono}
                    onChange={handleBaseFieldChange}
                    placeholder="Ej: 1122334455"
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="nuevo-dni">DNI</label>
                  <input
                    id="nuevo-dni"
                    name="dni"
                    value={nuevoUsuario.dni}
                    onChange={handleBaseFieldChange}
                    placeholder="Ej: 30111222"
                  />
                </div>
                <div className="form-control form-control--toggle">
                  <label htmlFor="nuevo-activo">Estado</label>
                  <div className="switch">
                    <input
                      id="nuevo-activo"
                      name="activo"
                      type="checkbox"
                      checked={nuevoUsuario.activo}
                      onChange={handleBaseFieldChange}
                    />
                    <span>{nuevoUsuario.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
              </section>

              <section className="form-block">
                <h3>Roles</h3>
                <div className="role-selection">
                  {ROLE_OPTIONS.map((rol) => (
                    <label key={rol.value} className="role-option">
                      <input
                        type="checkbox"
                        checked={nuevoUsuario.roles.includes(rol.value)}
                        onChange={() => handleRoleToggle(rol.value)}
                      />
                      <span>{rol.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              {nuevoUsuario.roles.includes('veterinario') && (
                <section className="form-block">
                  <h3>Datos de veterinario</h3>
                  <div className="form-control">
                    <label htmlFor="nuevo-matricula">Matrícula profesional</label>
                    <input
                      id="nuevo-matricula"
                      name="matricula"
                      value={nuevoUsuario.matricula}
                      onChange={handleBaseFieldChange}
                      placeholder="Ej: MAT-123"
                      required={nuevoUsuario.roles.includes('veterinario')}
                    />
                  </div>
                  <div className="form-control">
                    <label>Especialidades</label>
                    <div className="specialties-grid">
                      {especialidadesDisponibles.map((especialidad) => {
                        const active = nuevoUsuario.specialties.includes(especialidad);
                        return (
                          <button
                            type="button"
                            key={especialidad}
                            className={`specialty-chip ${active ? 'active' : ''}`}
                            onClick={() => toggleSpecialty(especialidad)}
                          >
                            {especialidad}
                          </button>
                        );
                      })}
                    </div>
                    <div className="specialty-input">
                      <input
                        name="specialtyInput"
                        value={nuevoUsuario.specialtyInput}
                        onChange={handleBaseFieldChange}
                        placeholder="Agregar otra especialidad"
                      />
                      <button type="button" onClick={handleAddSpecialty}>
                        Añadir
                      </button>
                    </div>
                    {nuevoUsuario.specialties.length > 0 && (
                      <div className="selected-tags">
                        {nuevoUsuario.specialties.map((especialidad) => (
                          <span key={especialidad} className="tag-pill">
                            {especialidad}
                            <button
                              type="button"
                              onClick={() => toggleSpecialty(especialidad)}
                              aria-label={`Quitar ${especialidad}`}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {nuevoUsuario.roles.includes('personal_servicio') && (
                <section className="form-block">
                  <h3>Tipos de servicio</h3>
                  <p className="form-hint">Seleccioná uno o varios perfiles operativos.</p>
                  <div className="specialties-grid">
                    {SERVICIO_TIPOS.map((tipo) => {
                      const active = nuevoUsuario.servicios?.includes(tipo);
                      return (
                        <button
                          type="button"
                          key={tipo}
                          className={`specialty-chip ${active ? 'active' : ''}`}
                          onClick={() => toggleServicioTipo(tipo)}
                        >
                          {tipo}
                        </button>
                      );
                    })}
                  </div>
                  {nuevoUsuario.servicios?.length === 0 && (
                    <p className="form-hint warning">Debes elegir al menos un tipo de servicio.</p>
                  )}
                  {nuevoUsuario.servicios?.length > 0 && (
                    <div className="selected-tags">
                      {nuevoUsuario.servicios.map((servicio) => (
                        <span key={servicio} className="tag-pill">
                          {servicio}
                          <button
                            type="button"
                            onClick={() => toggleServicioTipo(servicio)}
                            aria-label={`Quitar ${servicio}`}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {nuevoUsuario.roles.includes('usuario_sistema') && (
                <section className="form-block">
                  <h3>Rol del sistema</h3>
                  <div className="form-control">
                    <label htmlFor="nuevo-system-role">Seleccioná el rol del sistema</label>
                    <select
                      id="nuevo-system-role"
                      name="systemRole"
                      value={nuevoUsuario.systemRole}
                      onChange={handleBaseFieldChange}
                      required
                    >
                      <option value="">Elegí un rol</option>
                      {resumenCalculado.roles_disponibles
                        .filter((rol) => rol !== 'usuario_sistema')
                        .map((rol) => (
                          <option key={rol} value={rol}>
                            {formatRoles([rol])}
                          </option>
                        ))}
                    </select>
                  </div>
                </section>
              )}

              {nuevoUsuario.roles.includes('cliente') && (
                <section className="form-block">
                  <h3>Mascotas</h3>
                  <p className="form-hint">Añadí las fichas básicas para agilizar turnos y servicios.</p>
                  <div className="pet-form-grid extended">
                    <div className="form-control">
                      <label htmlFor="pet-name">Nombre</label>
                      <input
                        id="pet-name"
                        name="name"
                        value={nuevoUsuario.petDraft.name}
                        onChange={handlePetDraftChange}
                        placeholder="Ej: Luna"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-breed">Raza / Tipo</label>
                      <input
                        id="pet-breed"
                        name="breed"
                        value={nuevoUsuario.petDraft.breed}
                        onChange={handlePetDraftChange}
                        placeholder="Ej: Mestizo"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-species">Especie</label>
                      <select
                        id="pet-species"
                        name="species"
                        value={nuevoUsuario.petDraft.species}
                        onChange={handlePetDraftChange}
                        required
                      >
                        <option value="">Seleccioná</option>
                        {SPECIES_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-sex">Sexo</label>
                      <select
                        id="pet-sex"
                        name="sex"
                        value={nuevoUsuario.petDraft.sex}
                        onChange={handlePetDraftChange}
                      >
                        <option value="">Seleccioná una opción</option>
                        <option value="female">Hembra</option>
                        <option value="male">Macho</option>
                        <option value="unknown">Sin definir</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-age">Edad (años)</label>
                      <input
                        id="pet-age"
                        name="age"
                        type="number"
                        min="0"
                        step="0.5"
                        value={nuevoUsuario.petDraft.age}
                        onChange={handlePetDraftChange}
                        placeholder="Ej: 4"
                      />
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-weight">Peso (kg)</label>
                      <input
                        id="pet-weight"
                        name="weight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={nuevoUsuario.petDraft.weight}
                        onChange={handlePetDraftChange}
                        placeholder="Ej: 12.5"
                      />
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-birthDate">Fecha de nacimiento</label>
                      <input
                        id="pet-birthDate"
                        name="birthDate"
                        type="date"
                        value={nuevoUsuario.petDraft.birthDate}
                        onChange={handlePetDraftChange}
                      />
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-color">Color / señas</label>
                      <input
                        id="pet-color"
                        name="color"
                        value={nuevoUsuario.petDraft.color}
                        onChange={handlePetDraftChange}
                        placeholder="Ej: Blanco con manchas negras"
                      />
                    </div>
                    <div className="form-control">
                      <label htmlFor="pet-microchip">Microchip / Identificador</label>
                      <input
                        id="pet-microchip"
                        name="microchip"
                        value={nuevoUsuario.petDraft.microchip}
                        onChange={handlePetDraftChange}
                        placeholder="Código de microchip o chapita"
                      />
                    </div>

                    <div className="form-checkbox-group inline">
                      <label>
                        <input
                          type="checkbox"
                          name="vaccinated"
                          checked={nuevoUsuario.petDraft.vaccinated}
                          onChange={handlePetDraftChange}
                        />
                        Vacunas al día
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="dewormed"
                          checked={nuevoUsuario.petDraft.dewormed}
                          onChange={handlePetDraftChange}
                        />
                        Desparasitado
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="sterilized"
                          checked={nuevoUsuario.petDraft.sterilized}
                          onChange={handlePetDraftChange}
                        />
                        Castrado / Esterilizado
                      </label>
                    </div>
                    <div className="form-control full-width">
                      <label htmlFor="pet-allergies">Alergias conocidas</label>
                      <textarea
                        id="pet-allergies"
                        name="allergies"
                        value={nuevoUsuario.petDraft.allergies}
                        onChange={handlePetDraftChange}
                        placeholder="Ej: Alérgico a ciertos antibióticos"
                        rows={2}
                      />
                    </div>
                    <div className="form-control full-width">
                      <label htmlFor="pet-conditions">Condiciones crónicas / tratamientos</label>
                      <textarea
                        id="pet-conditions"
                        name="chronicConditions"
                        value={nuevoUsuario.petDraft.chronicConditions}
                        onChange={handlePetDraftChange}
                        placeholder="Ej: Hipotiroidismo, medicación diaria"
                        rows={2}
                      />
                    </div>
                    <div className="form-control full-width">
                      <label htmlFor="pet-notes">Notas adicionales</label>
                      <textarea
                        id="pet-notes"
                        name="notes"
                        value={nuevoUsuario.petDraft.notes}
                        onChange={handlePetDraftChange}
                        placeholder="Preferencias de manejo, historial importante, comportamiento"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="pet-form-actions">
                    <button type="button" onClick={handleAddPet}>
                      Añadir mascota
                    </button>
                  </div>
                  {nuevoUsuario.mascotas.length > 0 && (
                    <ul className="pet-list">
                      {nuevoUsuario.mascotas.map((pet) => (
                        <li key={pet.id} className="pet-list-item">
                          <div className="pet-list-info">
                            <strong>{pet.name}</strong>{' '}
                            <span className="pet-list-tag">
                              {SPECIES_OPTIONS.find((opt) => opt.value === pet.species)?.label ||
                                pet.species}{' '}
                              · {pet.breed}
                            </span>
                            <div className="pet-list-meta">
                              {pet.sex && (
                                <span>
                                  Sexo:{' '}
                                  {pet.sex === 'female'
                                    ? 'Hembra'
                                    : pet.sex === 'male'
                                      ? 'Macho'
                                      : 'Sin definir'}
                                </span>
                              )}
                              {pet.age !== '' && pet.age !== null && (
                                <span>
                                  Edad:{' '}
                                  {pet.age} {Number(pet.age) === 1 ? 'año' : 'años'}
                                </span>
                              )}
                              {pet.weight !== '' && pet.weight !== null && (
                                <span>Peso: {pet.weight} kg</span>
                              )}
                              {pet.birthDate && (
                                <span>
                                  Nacido el:{' '}
                                  {new Date(pet.birthDate).toLocaleDateString('es-AR')}
                                </span>
                              )}
                              {pet.color && <span>Color/señas: {pet.color}</span>}
                              {pet.microchip && <span>ID: {pet.microchip}</span>}
                            </div>
                            <div className="pet-list-flags">
                              {pet.vaccinated && <span className="flag success">Vacunas al día</span>}
                              {pet.dewormed && <span className="flag success">Desparasitado</span>}
                              {pet.sterilized && <span className="flag info">Castrado</span>}
                            </div>
                            {(pet.allergies || pet.chronicConditions || pet.notes) && (
                              <div className="pet-list-notes">
                                {pet.allergies && (
                                  <p>
                                    <strong>Alergias:</strong> {pet.allergies}
                                  </p>
                                )}
                                {pet.chronicConditions && (
                                  <p>
                                    <strong>Condiciones:</strong> {pet.chronicConditions}
                                  </p>
                                )}
                                {pet.notes && (
                                  <p>
                                    <strong>Notas:</strong> {pet.notes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <button type="button" onClick={() => handleRemovePet(pet.id)}>
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              <footer className="users-modal__footer admin-actions-bar">
                <button type="button" className="admin-card-link" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-card-link">
                  Guardar
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;

