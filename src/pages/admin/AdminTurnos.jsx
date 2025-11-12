import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import HeaderAdmin from '@/components/estaticos/HeaderAdmin';
import Footer from '@/components/estaticos/Footer';
import demoClients from '@/data/demoClients.json';
import { useToast } from '@/context/ToastContext';
import './AdminTurnos.css';

const sucursales = [
  {
    id: 1,
    nombre: 'Vettix Central',
    alias: 'Veterinaria Central',
    telefono: '11 2233 4455',
    email: 'central@vet.com',
    direccion: 'Av. Siempre Viva 742, CABA',
    notas: 'Urgencias 24h · Laboratorio integral · Internación premium',
  },
  {
    id: 2,
    nombre: 'Vettix Norte',
    alias: 'Veterinaria Norte',
    telefono: '11 4455 6677',
    email: 'norte@vet.com',
    direccion: 'San Martín 123, Vicente López',
    notas: 'Consultorio especializado en rehabilitación y medicina preventiva',
  },
  {
    id: 3,
    nombre: 'Vettix Belgrano',
    alias: 'Veterinaria Belgrano',
    telefono: '11 4789 1234',
    email: 'belgrano@vet.com',
    direccion: 'Av. Cabildo 2300, Belgrano',
    notas: 'Clínica central con internación, spa y diagnóstico avanzado',
  },
  {
    id: 4,
    nombre: 'Vettix Núñez',
    alias: 'Veterinaria Núñez',
    telefono: '11 4789 5678',
    email: 'nunez@vet.com',
    direccion: 'Av. del Libertador 3500, Núñez',
    notas: 'Centro de imagenología, cardiología y telemedicina',
  },
  {
    id: 5,
    nombre: 'Vettix Saavedra',
    alias: 'Veterinaria Saavedra',
    telefono: '11 4789 9012',
    email: 'saavedra@vet.com',
    direccion: 'Av. Monroe 4800, Saavedra',
    notas: 'Spa premium, nutrición y programas Vettix Walkers',
  },
];

const veterinarios = [
  {
    id: 'vet-ana',
    nombre: 'Dra. Ana Torres',
    especialidades: ['Clínica General', 'Urgencias'],
    descripcion: 'Responsable del servicio de urgencias 24h y medicina preventiva en la sede principal de Belgrano.',
    dias: [1, 2, 3, 5],
    horarios: ['09:00', '10:30', '12:00', '16:00', '18:30'],
    sucursales: [1, 3],
  },
  {
    id: 'vet-martin',
    nombre: 'Dr. Martín Rivas',
    especialidades: ['Cardiología', 'Diagnóstico por imágenes'],
    descripcion: 'Especialista en cardiología y ecografía Doppler. Coordina los estudios avanzados en Núñez Centro.',
    dias: [2, 4, 6],
    horarios: ['10:00', '11:30', '15:00', '17:30'],
    sucursales: [3, 4],
  },
  {
    id: 'vet-lucia',
    nombre: 'Dra. Lucía Pérez',
    especialidades: ['Medicina Felina', 'Nutrición'],
    descripcion: 'Lidera el programa Vettix Feline Care con planes nutricionales personalizados y control de patologías crónicas.',
    dias: [1, 3, 4, 5],
    horarios: ['09:30', '11:00', '14:30', '17:00'],
    sucursales: [3, 5],
  },
  {
    id: 'vet-marina',
    nombre: 'Dra. Marina Valdez',
    especialidades: ['Rehabilitación', 'Fisioterapia'],
    descripcion: 'Responsable de la unidad de fisioterapia y rehabilitación neuromuscular con equipamiento de hidroterapia.',
    dias: [1, 2, 4],
    horarios: ['08:30', '10:00', '13:00', '16:30'],
    sucursales: [1, 2, 4],
  },
];

const serviciosComplementarios = [
  {
    id: 'serv-pelu-1',
    nombre: 'Laura Paredes',
    rol: 'Peluquería Premium',
    descripcion: 'Especialista en estilismo canino, tratamientos hipoalergénicos y spa relajante.',
    dias: [2, 4, 6],
    horarios: ['10:00', '12:00', '15:30'],
    sucursales: [1, 3, 5],
  },
  {
    id: 'serv-entren-1',
    nombre: 'Diego Ferreyra',
    rol: 'Entrenador y adiestrador',
    descripcion: 'Adiestramiento positivo, obediencia básica y resolución de problemas de conducta.',
    dias: [1, 3, 5],
    horarios: ['09:00', '11:00', '14:00', '17:00'],
    sucursales: [1, 2, 4],
  },
  {
    id: 'serv-paseo-1',
    nombre: 'Valentina Costa',
    rol: 'Paseadora profesional',
    descripcion: 'Coordinadora del programa Vettix Walkers con circuitos seguros y reporte en vivo.',
    dias: [1, 2, 3, 4, 5],
    horarios: ['08:00', '12:30', '18:00'],
    sucursales: [1, 2, 3, 4, 5],
  },
  {
    id: 'serv-pelu-2',
    nombre: 'Mauro Giménez',
    rol: 'Peluquería Premium',
    descripcion: 'Especialista en razas de pelo largo, cortes de competición y tratamientos detox.',
    dias: [1, 3, 5],
    horarios: ['11:00', '13:30', '16:30'],
    sucursales: [3, 4],
  },
];

const generateDateRange = (days = 18) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = date.toISOString().split('T')[0];
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const label = date.toLocaleDateString('es-AR', options);
    return { iso, date, label, weekday: date.getDay() };
  });
};

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ADMIN_TURNOS_KEY = 'vettix_admin_turnos';

const estadoLabels = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  completado: 'Completado',
};

const speciesLabels = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  small_mammal: 'Pequeño mamífero',
  reptile: 'Reptil',
  other: 'Otra especie',
};

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'small_mammal', label: 'Conejo / Pequeño mamífero' },
  { value: 'reptile', label: 'Reptil' },
  { value: 'other', label: 'Otra especie' },
];

const categoriaLabels = {
  programado: 'Programado',
  emergencia: 'Emergencia',
  atencion_directa: 'Atención directa',
};

const categoriaDescription = {
  programado: 'Reservá turnos planificados con agenda completa y disponibilidad estándar.',
  emergencia: 'Gestioná urgencias presenciales priorizando atención veterinaria inmediata en sala de emergencias.',
  atencion_directa: 'Cliente atendido in situ por el staff administrativo que agenda en nombre del paciente y asigna un profesional disponible.',
};

const buildPetStorageKeys = (user) => {
  if (!user) return [];
  const identifiers = [user.id, user.user_id, user.uid, user.email]
    .map((value) => (value !== undefined && value !== null ? String(value) : null))
    .filter(Boolean);

  const unique = Array.from(new Set(identifiers));
  return unique.map((identifier) => `vettix_pets_${identifier}`);
};

const loadPetsFromStorage = (user) => {
  const keys = buildPetStorageKeys(user);
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((pet, index) => ({
          ...pet,
          id: pet.id ?? `${key}-pet-${index}`,
        }));
      }
    } catch (error) {
      console.warn('No se pudo leer mascotas para', key, error);
    }
  }

  const fallbackPets = Array.isArray(user?.pets) ? user.pets : [];
  return fallbackPets.map((pet, index) => ({
    ...pet,
    id: pet.id ?? `${user?.id ?? user?.email ?? 'demo-client'}-pet-${index}`,
  }));
};

const savePetsToStorage = (user, pets) => {
  const keys = buildPetStorageKeys(user);
  if (keys.length === 0) return;
  const sanitized = pets.map(({ isSample, ...pet }) => pet);
  try {
    localStorage.setItem(keys[0], JSON.stringify(sanitized));
  } catch (error) {
    console.error('No se pudo guardar mascotas para', keys[0], error);
  }
};

const AdminTurnos = () => {
  const { showError, showSuccess } = useToast();

  const demoUsers = useMemo(
    () =>
      demoClients.map((client, index) => {
        const id = client.id ?? client.email ?? `demo-client-${index}`;
        const pets = Array.isArray(client.pets)
          ? client.pets.map((pet, petIndex) => ({
              ...pet,
              id: pet.id ?? `${id}-pet-${petIndex}`,
            }))
          : [];
        return {
          ...client,
          id,
          name: client.name || client.email || `Cliente ${index + 1}`,
          email: client.email || '',
          pets,
        };
      }),
    []
  );

  const demoTurnosSeed = useMemo(() => {
    if (demoUsers.length === 0) return [];

    const resolveUser = (index) => demoUsers[index % demoUsers.length];
    const resolveSucursal = (id) => sucursales.find((item) => item.id === id) || sucursales[0];
    const resolveVeterinario = (id) => veterinarios.find((item) => item.id === id) || null;
    const resolveServicio = (id) => serviciosComplementarios.find((item) => item.id === id) || null;

    const ensurePetForUser = (user, desiredIndex = 0, override = null) => {
      if (override) {
        return {
          ...override,
          id: override.id ?? `${user.id}-pet-seed`,
        };
      }
      if (user?.pets?.length) {
        const pet = user.pets[desiredIndex % user.pets.length];
        return pet;
      }
      const fallbackName = user?.name?.split?.(' ')?.[0] || 'Mascota';
      return {
        id: `${user?.id ?? 'seed-user'}-pet-${desiredIndex}`,
        name: fallbackName,
        species: 'dog',
      };
    };

    const makeTurno = (config) => {
      const {
        id,
        userIndex = 0,
        sucursalId = sucursales[0].id,
        providerType = 'vet',
        providerId,
        fechaISO,
        hora,
        modalidad = 'programado',
        estado = 'pendiente',
        petIndex = 0,
        petOverride = null,
      } = config;

      const user = resolveUser(userIndex);
      if (!user || !fechaISO || !hora) return null;

      const sucursal = resolveSucursal(sucursalId);
      const provider = providerType === 'servicio'
        ? resolveServicio(providerId)
        : resolveVeterinario(providerId);
      const pet = ensurePetForUser(user, petIndex, petOverride);

      const petSpecies = pet?.species || 'dog';
      const petSpeciesLabel = speciesLabels[petSpecies] || speciesLabels.other;

      const proveedorNombre = provider?.nombre || provider?.rol || 'Profesional Vettix';
      const proveedorDetalle = providerType === 'servicio'
        ? provider?.rol || 'Servicio complementario'
        : provider?.especialidades?.join(', ') || 'Clínica integral';

      return {
        id: `seed-turno-${id}`,
        userId: user.id,
        userName: user.name || user.email,
        userEmail: user.email || 'sin-email@vettix.com',
        petId: pet?.id || `${user.id}-pet-${id}`,
        petName: pet?.name || 'Mascota',
        petSpecies,
        petSpeciesLabel,
        sucursalId: sucursal.id,
        sucursalNombre: sucursal.nombre,
        sucursalDireccion: sucursal.direccion,
        proveedorId: provider?.id || providerId,
        proveedorNombre,
        proveedorDetalle,
        fechaISO,
        hora,
        tipo: providerType === 'servicio' ? 'servicio' : 'atencion_directa',
        modalidad,
        estado,
        createdAt: new Date().toISOString(),
      };
    };

    const seedPlan = [
      { id: '01', userIndex: 0, sucursalId: 1, providerType: 'vet', providerId: 'vet-ana', fechaISO: '2025-10-01', hora: '09:00', modalidad: 'programado', estado: 'pendiente' },
      { id: '02', userIndex: 1, sucursalId: 3, providerType: 'vet', providerId: 'vet-lucia', fechaISO: '2025-10-02', hora: '10:30', modalidad: 'programado', estado: 'confirmado', petIndex: 1 },
      { id: '03', userIndex: 2, sucursalId: 4, providerType: 'vet', providerId: 'vet-martin', fechaISO: '2025-10-03', hora: '15:00', modalidad: 'emergencia', estado: 'pendiente' },
      { id: '04', userIndex: 3, sucursalId: 2, providerType: 'servicio', providerId: 'serv-entren-1', fechaISO: '2025-10-04', hora: '11:00', modalidad: 'atencion_directa', estado: 'confirmado' },
      { id: '05', userIndex: 4, sucursalId: 5, providerType: 'servicio', providerId: 'serv-paseo-1', fechaISO: '2025-10-05', hora: '12:30', modalidad: 'programado', estado: 'completado' },      
      { id: '11', userIndex: 0, sucursalId: 1, providerType: 'vet', providerId: 'vet-ana', fechaISO: '2025-10-11', hora: '12:00', modalidad: 'programado', estado: 'confirmado', petIndex: 0 },
    ];

    return seedPlan.map(makeTurno).filter(Boolean);
  }, [demoUsers]);

  const [selectedUserId, setSelectedUserId] = useState(() => (demoUsers[0]?.id ? String(demoUsers[0].id) : ''));

  useEffect(() => {
    if (!selectedUserId && demoUsers.length > 0) {
      setSelectedUserId(String(demoUsers[0].id));
    }
  }, [demoUsers, selectedUserId]);

  const selectedUser = useMemo(
    () => demoUsers.find((user) => String(user.id) === String(selectedUserId)) || null,
    [demoUsers, selectedUserId]
  );

  const [turnoCategoria, setTurnoCategoria] = useState('programado');
  const [mascotasCliente, setMascotasCliente] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState('');
  const [showPetForm, setShowPetForm] = useState(false);
  const [newPetData, setNewPetData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    notes: '',
  });

  useEffect(() => {
    setMascotasCliente([]);
    setMascotaSeleccionada('');
    setShowPetForm(false);
    setNewPetData({ name: '', species: '', breed: '', age: '', weight: '', notes: '' });
    if (!selectedUser) return;
    const mascotas = loadPetsFromStorage(selectedUser);
    if (mascotas.length === 0) {
      setMascotasCliente([]);
      return;
    }
    setMascotasCliente(mascotas);
    if (mascotas.length > 0) {
      setMascotaSeleccionada(String(mascotas[0].id));
    }
  }, [selectedUser]);

  const mascotaActiva = useMemo(
    () => mascotasCliente.find((pet) => String(pet.id) === String(mascotaSeleccionada)) || null,
    [mascotasCliente, mascotaSeleccionada]
  );

  const handleNewPetFieldChange = (event) => {
    const { name, value } = event.target;
    setNewPetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPet = (event) => {
    event.preventDefault();
    if (!selectedUser) {
      showError('Seleccioná un cliente antes de cargar una mascota.');
      return;
    }
    if (!newPetData.name.trim()) {
      showError('Indicá el nombre de la mascota.');
      return;
    }
    if (!newPetData.species) {
      showError('Seleccioná la especie de la mascota.');
      return;
    }

    const nuevaMascota = {
      id: Date.now(),
      name: newPetData.name.trim(),
      species: newPetData.species,
      breed: newPetData.breed.trim() || undefined,
      age: newPetData.age !== '' ? Number(newPetData.age) : undefined,
      weight: newPetData.weight !== '' ? Number(newPetData.weight) : undefined,
      notes: newPetData.notes.trim() || undefined,
    };

    const actualizadas = [...mascotasCliente, nuevaMascota];
    setMascotasCliente(actualizadas);
    setMascotaSeleccionada(String(nuevaMascota.id));
    setShowPetForm(false);
    setNewPetData({ name: '', species: '', breed: '', age: '', weight: '', notes: '' });
    savePetsToStorage(selectedUser, actualizadas);
    showSuccess('Mascota agregada para el cliente.');
  };

  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(sucursales[0].id);
  const [turnoTipo, setTurnoTipo] = useState('veterinario');
  const [filtroVet, setFiltroVet] = useState('especialidad');

  const sucursalActiva = useMemo(
    () => sucursales.find((sucursal) => sucursal.id === Number(sucursalSeleccionada)) || null,
    [sucursalSeleccionada]
  );

  const veterinariosDisponibles = useMemo(
    () => veterinarios.filter((vet) => vet.sucursales.includes(Number(sucursalSeleccionada))),
    [sucursalSeleccionada]
  );

  const especialidades = useMemo(
    () => Array.from(new Set(veterinariosDisponibles.flatMap((v) => v.especialidades))),
    [veterinariosDisponibles]
  );

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  useEffect(() => {
    if (especialidades.length === 0) {
      if (especialidadSeleccionada) {
        setEspecialidadSeleccionada('');
      }
      return;
    }
    if (!especialidadSeleccionada || !especialidades.includes(especialidadSeleccionada)) {
      setEspecialidadSeleccionada(especialidades[0]);
    }
  }, [especialidades, especialidadSeleccionada]);

  const veterinariosPorEspecialidad = useMemo(() => {
    if (filtroVet === 'especialidad' && especialidadSeleccionada) {
      return veterinariosDisponibles.filter((vet) => vet.especialidades.includes(especialidadSeleccionada));
    }
    return veterinariosDisponibles;
  }, [filtroVet, especialidadSeleccionada, veterinariosDisponibles]);

  const [veterinarioSeleccionado, setVeterinarioSeleccionado] = useState('');
  useEffect(() => {
    const listaBase = filtroVet === 'especialidad' ? veterinariosPorEspecialidad : veterinariosDisponibles;
    if (listaBase.length === 0) {
      if (veterinarioSeleccionado) {
        setVeterinarioSeleccionado('');
      }
      return;
    }
    const existe = listaBase.some((vet) => vet.id === veterinarioSeleccionado);
    if (!existe) {
      setVeterinarioSeleccionado(listaBase[0].id);
    }
  }, [veterinariosPorEspecialidad, veterinariosDisponibles, filtroVet, veterinarioSeleccionado]);

  const serviciosDisponibles = useMemo(
    () => serviciosComplementarios.filter((servicio) => servicio.sucursales.includes(Number(sucursalSeleccionada))),
    [sucursalSeleccionada]
  );

  const rolesServicio = useMemo(
    () => Array.from(new Set(serviciosDisponibles.map((s) => s.rol))),
    [serviciosDisponibles]
  );

  const [rolServicioSeleccionado, setRolServicioSeleccionado] = useState('');
  useEffect(() => {
    if (rolesServicio.length === 0) {
      if (rolServicioSeleccionado) {
        setRolServicioSeleccionado('');
      }
      return;
    }
    if (!rolServicioSeleccionado || !rolesServicio.includes(rolServicioSeleccionado)) {
      setRolServicioSeleccionado(rolesServicio[0]);
    }
  }, [rolesServicio, rolServicioSeleccionado]);

  const profesionalesServicioFiltrados = useMemo(
    () => serviciosDisponibles.filter((servicio) => (rolServicioSeleccionado ? servicio.rol === rolServicioSeleccionado : true)),
    [serviciosDisponibles, rolServicioSeleccionado]
  );

  const [profesionalServicioSeleccionado, setProfesionalServicioSeleccionado] = useState('');
  useEffect(() => {
    if (profesionalesServicioFiltrados.length === 0) {
      if (profesionalServicioSeleccionado) {
        setProfesionalServicioSeleccionado('');
      }
      return;
    }
    const existe = profesionalesServicioFiltrados.some((servicio) => servicio.id === profesionalServicioSeleccionado);
    if (!existe) {
      setProfesionalServicioSeleccionado(profesionalesServicioFiltrados[0].id);
    }
  }, [profesionalesServicioFiltrados, profesionalServicioSeleccionado]);

  const fechas = useMemo(() => generateDateRange(18), []);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

  useEffect(() => {
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
    if (turnoCategoria !== 'programado') {
      setTurnoTipo('veterinario');
    }
  }, [turnoCategoria]);

  const proveedorActivo = useMemo(() => {
    if (turnoTipo === 'veterinario') {
      return veterinariosDisponibles.find((v) => v.id === veterinarioSeleccionado) || null;
    }
    return serviciosDisponibles.find((servicio) => servicio.id === profesionalServicioSeleccionado) || null;
  }, [
    turnoTipo,
    veterinariosDisponibles,
    veterinarioSeleccionado,
    serviciosDisponibles,
    profesionalServicioSeleccionado,
  ]);

  useEffect(() => {
    if (!proveedorActivo) return;

    const findFirstDate = () => {
      return fechas.find(({ iso }) => {
        const day = new Date(`${iso}T12:00:00`).getDay();
        return proveedorActivo.dias.includes(day);
      });
    };

    if (!fechaSeleccionada || !proveedorActivo.dias.includes(new Date(`${fechaSeleccionada}T12:00:00`).getDay())) {
      const next = findFirstDate();
      if (next) {
        setFechaSeleccionada(next.iso);
        setHoraSeleccionada(null);
      }
    }
  }, [proveedorActivo, fechas, fechaSeleccionada]);

  const diasDisponiblesProveedor = useMemo(() => {
    if (!proveedorActivo) return new Set();
    return new Set(proveedorActivo.dias);
  }, [proveedorActivo]);

  const slotsDisponibles = useMemo(() => {
    if (!proveedorActivo || !fechaSeleccionada) return [];
    const fecha = new Date(`${fechaSeleccionada}T12:00:00`);
    const disponible = diasDisponiblesProveedor.has(fecha.getDay());
    return disponible ? proveedorActivo.horarios : [];
  }, [proveedorActivo, fechaSeleccionada, diasDisponiblesProveedor]);

  const manejarSeleccionFecha = (fechaIso, disponible) => {
    if (!disponible) return;
    setFechaSeleccionada(fechaIso);
    setHoraSeleccionada(null);
  };

  const [turnosRegistrados, setTurnosRegistrados] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_TURNOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalizados = parsed.map((turno) => {
            const petSpeciesLabel =
              turno.petSpeciesLabel ||
              (turno.petSpecies ? speciesLabels[turno.petSpecies] || speciesLabels.other : undefined);
            return {
              ...turno,
              modalidad: turno.modalidad || 'programado',
              petSpeciesLabel,
            };
          });
          setTurnosRegistrados(normalizados);
          return;
        }
      }
    } catch (error) {
      console.error('Error al leer turnos administrados', error);
    }

    if (demoTurnosSeed.length > 0) {
      setTurnosRegistrados(demoTurnosSeed);
    }
  }, [demoTurnosSeed]);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_TURNOS_KEY, JSON.stringify(turnosRegistrados));
    } catch (error) {
      console.error('Error al guardar turnos administrados', error);
    }
  }, [turnosRegistrados]);

  const manejarConfirmacion = () => {
    if (!selectedUser) {
      showError('Seleccioná el cliente que recibirá la atención.');
      return;
    }
    if (!mascotaActiva) {
      showError('Seleccioná la mascota a la que corresponde el turno.');
      return;
    }
    if (!sucursalActiva || !proveedorActivo || !fechaSeleccionada || !horaSeleccionada) {
      showError('Completá la selección de sucursal, profesional, fecha y horario.');
      return;
    }

    const petSpeciesLabel = speciesLabels[mascotaActiva.species] || speciesLabels.other;

    const turnoRegistrado = {
      id: Date.now(),
      userId: selectedUser.id,
      userName: selectedUser.name || selectedUser.email,
      userEmail: selectedUser.email,
      petId: mascotaActiva.id,
      petName: mascotaActiva.name,
      petSpecies: mascotaActiva.species,
      petSpeciesLabel,
      sucursalId: sucursalActiva.id,
      sucursalNombre: sucursalActiva.nombre,
      sucursalDireccion: sucursalActiva.direccion,
      proveedorId: proveedorActivo.id,
      proveedorNombre: proveedorActivo.nombre,
      proveedorDetalle: turnoTipo === 'veterinario' ? proveedorActivo.especialidades.join(', ') : proveedorActivo.rol,
      fechaISO: fechaSeleccionada,
      hora: horaSeleccionada,
      tipo: turnoTipo === 'veterinario' ? 'atencion_directa' : 'servicio',
      modalidad: turnoCategoria,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    setTurnosRegistrados((prev) => [turnoRegistrado, ...prev]);
    showSuccess('Turno registrado y asignado correctamente.');
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
  };

  const actualizarEstadoTurno = (turnoId, nuevoEstado) => {
    setTurnosRegistrados((prev) =>
      prev.map((turno) => (turno.id === turnoId ? { ...turno, estado: nuevoEstado, updatedAt: new Date().toISOString() } : turno))
    );
  };

  const eliminarTurno = (turnoId) => {
    if (!window.confirm('¿Deseás eliminar este turno?')) return;
    setTurnosRegistrados((prev) => prev.filter((turno) => turno.id !== turnoId));
  };

  const mostrarCalendario = Boolean(proveedorActivo);

  return (
    <div className="admin-page">
      <Helmet>
        <title>Panel Admin | Solicitud de turnos</title>
        <meta
          name="description"
          content="Gestioná los turnos solicitados desde el sitio público y asignalos a clientes desde el panel administrativo."
        />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content turno-page">
        <section className="turnos-hero admin-orders-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Administrar Turnos</span>
            <h1>Agenda clínica y servicios</h1>
            <p>
              Coordiná turnos programados, emergencias y atención directa para clientes y mascotas desde un tablero
              unificado. Visualizá rápidamente los turnos asignados, su estado y los profesionales involucrados.
            </p>
          </div>
          <div className="admin-turnos-hero-card">
            <ul>
              <li>Total turnos registrados: {turnosRegistrados.length}</li>
              <li>Modalidades activas: Programado · Emergencia · Atención directa</li>
              <li>Profesionales disponibles: {veterinarios.length} veterinarios · {serviciosComplementarios.length} servicios</li>
              {sucursalActiva && (
                <li>Sucursal enfocada: {sucursalActiva.nombre}</li>
              )}
            </ul>
          </div>
        </section>

        <section className="selection-panel">
          <header className="selection-header">
            <h2>Seleccioná el tipo de turno</h2>
            <p>Definí si el caso es programado, emergencia o atención directa antes de asignar la agenda.</p>
          </header>
          <div className="turno-category-toggle" role="group" aria-label="Tipo de turno">
            {Object.entries(categoriaLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`category-button ${turnoCategoria === value ? 'active' : ''}`}
                onClick={() => setTurnoCategoria(value)}
                aria-pressed={turnoCategoria === value}
              >
                <span className="category-label">{label}</span>
                <span className="category-subtext">{categoriaDescription[value]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="selection-panel">
          <header className="selection-header">
            <h2>Elegí la sucursal Vettix</h2>
            <p>Seleccioná la clínica donde se realizará la atención. Mostramos únicamente los profesionales habilitados en esa sede.</p>
          </header>
          <div className="select-row">
            <div className="select-field">
              <label htmlFor="sucursal">Sucursal</label>
              <select
                id="sucursal"
                value={sucursalSeleccionada}
                onChange={(event) => {
                  setSucursalSeleccionada(Number(event.target.value));
                  setFechaSeleccionada(null);
                  setHoraSeleccionada(null);
                }}
              >
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {sucursalActiva && (
            <div className="branch-card">
              <div className="branch-card-header">
                <h3>{sucursalActiva.nombre}</h3>
                <span>{sucursalActiva.alias}</span>
              </div>
              <p className="branch-address">{sucursalActiva.direccion}</p>
              <ul>
                <li>
                  <span>Tel:</span> {sucursalActiva.telefono}
                </li>
                <li>
                  <span>Email:</span> {sucursalActiva.email}
                </li>
                <li>
                  <span>Servicios destacados:</span> {sucursalActiva.notas}
                </li>
              </ul>
            </div>
          )}
        </section>

        <section className="selection-panel">
          <header className="selection-header">
            <h2>Asigná el cliente</h2>
            <p>Seleccioná uno de los clientes registrados para confirmar la atención directa desde el panel.</p>
          </header>
          <div className="select-row">
            <div className="select-field">
              <label htmlFor="cliente">Cliente</label>
              <select
                id="cliente"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                disabled={demoUsers.length === 0}
              >
                {demoUsers.length === 0 ? (
                  <option value="">Sin clientes disponibles</option>
                ) : (
                  demoUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.email}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          {demoUsers.length === 0 && <p className="form-feedback error">No se pudieron cargar los clientes.</p>}
        </section>

        <section className="selection-panel">
          <header className="selection-header">
            <h2>Seleccioná la mascota</h2>
            <p>Definí para qué paciente se agenda el turno. Los datos provienen de "Mis Mascotas" del cliente.</p>
          </header>
          {mascotasCliente.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-paw"></i>
              <h3>Sin mascotas registradas</h3>
              <p>Pedile al cliente que cargue las fichas desde su cuenta o ingresá una ficha rápida desde aquí.</p>
              <div className="pet-actions">
                <button
                  type="button"
                  className="btn tertiary"
                  onClick={() => setShowPetForm((prev) => !prev)}
                >
                  {showPetForm ? 'Cerrar formulario' : 'Agregar mascota rápida'}
                </button>
              </div>
              {showPetForm && (
                <form className="pet-form" onSubmit={handleAddPet}>
                  <div className="pet-form-grid">
                    <div className="form-group">
                      <label htmlFor="pet-name">Nombre</label>
                      <input
                        id="pet-name"
                        name="name"
                        value={newPetData.name}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: Olivia"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-species">Especie</label>
                      <select
                        id="pet-species"
                        name="species"
                        value={newPetData.species}
                        onChange={handleNewPetFieldChange}
                        required
                      >
                        <option value="">Seleccioná una especie</option>
                        {SPECIES_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-breed">Raza / Tipo</label>
                      <input
                        id="pet-breed"
                        name="breed"
                        value={newPetData.breed}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: Mestizo"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-age">Edad (años)</label>
                      <input
                        id="pet-age"
                        name="age"
                        type="number"
                        min="0"
                        step="0.5"
                        value={newPetData.age}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: 2"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-weight">Peso (kg)</label>
                      <input
                        id="pet-weight"
                        name="weight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={newPetData.weight}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: 5.4"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="pet-notes">Notas</label>
                    <textarea
                      id="pet-notes"
                      name="notes"
                      rows={3}
                      value={newPetData.notes}
                      onChange={handleNewPetFieldChange}
                      placeholder="Datos adicionales relevantes para la atención"
                    />
                  </div>
                  <div className="pet-form-actions">
                    <button type="submit" className="btn primary">
                      Guardar mascota
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className="pet-actions">
                <button
                  type="button"
                  className="btn tertiary"
                  onClick={() => setShowPetForm((prev) => !prev)}
                >
                  {showPetForm ? 'Cerrar formulario' : 'Agregar mascota rápida'}
                </button>
              </div>

              {showPetForm && (
                <form className="pet-form" onSubmit={handleAddPet}>
                  <div className="pet-form-grid">
                    <div className="form-group">
                      <label htmlFor="pet-name">Nombre</label>
                      <input
                        id="pet-name"
                        name="name"
                        value={newPetData.name}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: Olivia"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-species">Especie</label>
                      <select
                        id="pet-species"
                        name="species"
                        value={newPetData.species}
                        onChange={handleNewPetFieldChange}
                        required
                      >
                        <option value="">Seleccioná una especie</option>
                        {SPECIES_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-breed">Raza / Tipo</label>
                      <input
                        id="pet-breed"
                        name="breed"
                        value={newPetData.breed}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: Mestizo"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-age">Edad (años)</label>
                      <input
                        id="pet-age"
                        name="age"
                        type="number"
                        min="0"
                        step="0.5"
                        value={newPetData.age}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: 2"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pet-weight">Peso (kg)</label>
                      <input
                        id="pet-weight"
                        name="weight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={newPetData.weight}
                        onChange={handleNewPetFieldChange}
                        placeholder="Ej: 5.4"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="pet-notes">Notas</label>
                    <textarea
                      id="pet-notes"
                      name="notes"
                      rows={3}
                      value={newPetData.notes}
                      onChange={handleNewPetFieldChange}
                      placeholder="Datos adicionales relevantes para la atención"
                    />
                  </div>
                  <div className="pet-form-actions">
                    <button type="submit" className="btn primary">
                      Guardar mascota
                    </button>
                  </div>
                </form>
              )}

              <div className="select-row">
                <div className="select-field">
                  <label htmlFor="mascota">Mascota</label>
                  <select
                    id="mascota"
                    value={mascotaSeleccionada}
                    onChange={(event) => setMascotaSeleccionada(event.target.value)}
                  >
                    {mascotasCliente.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} · {speciesLabels[pet.species] || speciesLabels.other}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {mascotaActiva && (
                <div className="branch-card pet-summary-card">
                  <div className="branch-card-header">
                    <h3>{mascotaActiva.name}</h3>
                    <span>{speciesLabels[mascotaActiva.species] || speciesLabels.other}</span>
                  </div>
                  <ul>
                    {mascotaActiva.breed && (
                      <li>
                        <span>Raza/Tipo:</span> {mascotaActiva.breed}
                      </li>
                    )}
                    {mascotaActiva.age !== undefined && mascotaActiva.age !== '' && (
                      <li>
                        <span>Edad:</span> {mascotaActiva.age} {Number(mascotaActiva.age) === 1 ? 'año' : 'años'}
                      </li>
                    )}
                    {mascotaActiva.weight && (
                      <li>
                        <span>Peso:</span> {mascotaActiva.weight} kg
                      </li>
                    )}
                    {mascotaActiva.chronicConditions && (
                      <li>
                        <span>Condiciones crónicas:</span> {mascotaActiva.chronicConditions}
                      </li>
                    )}
                    {mascotaActiva.notes && (
                      <li>
                        <span>Notas:</span> {mascotaActiva.notes}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>

        {turnoCategoria === 'programado' ? (
          <div className="turno-toggle">
            <button
              type="button"
              onClick={() => {
                setTurnoTipo('veterinario');
                setFechaSeleccionada(null);
                setHoraSeleccionada(null);
              }}
              className={turnoTipo === 'veterinario' ? 'toggle-button active' : 'toggle-button'}
            >
              Profesionales veterinarios
            </button>
            <button
              type="button"
              onClick={() => {
                setTurnoTipo('servicio');
                setFechaSeleccionada(null);
                setHoraSeleccionada(null);
              }}
              className={turnoTipo === 'servicio' ? 'toggle-button active' : 'toggle-button'}
            >
              Servicios complementarios
            </button>
          </div>
        ) : (
          <div className="turno-alert" role="status">
            <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
            <span>
              {turnoCategoria === 'emergencia'
                ? 'Emergencia presencial: derivá al equipo veterinario de guardia y confirmá rápido la agenda.'
                : 'Atención directa: el administrativo recibe al cliente en el local y agenda el turno con el profesional disponible.'}
            </span>
          </div>
        )}

        {turnoTipo === 'veterinario' ? (
          <section className="selection-panel">
            <header className="selection-header">
              <h2>Agenda con un profesional veterinario</h2>
              <p>Podés buscar por especialidad o por el nombre del profesional. Los turnos se guardan como atención directa.</p>
            </header>

            {veterinariosDisponibles.length === 0 ? (
              <p className="no-slots">No hay profesionales disponibles en esta sucursal. Elegí otra ubicación.</p>
            ) : (
              <>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="filtro-vet"
                      value="especialidad"
                      checked={filtroVet === 'especialidad'}
                      onChange={() => {
                        setFiltroVet('especialidad');
                        setFechaSeleccionada(null);
                        setHoraSeleccionada(null);
                      }}
                    />
                    Buscar por especialidad
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filtro-vet"
                      value="profesional"
                      checked={filtroVet === 'profesional'}
                      onChange={() => {
                        setFiltroVet('profesional');
                        setFechaSeleccionada(null);
                        setHoraSeleccionada(null);
                      }}
                    />
                    Buscar por profesional
                  </label>
                </div>

                {filtroVet === 'especialidad' ? (
                  <div className="select-row">
                    <div className="select-field">
                      <label htmlFor="especialidad">Especialidad</label>
                      <select
                        id="especialidad"
                        value={especialidadSeleccionada}
                        onChange={(event) => setEspecialidadSeleccionada(event.target.value)}
                      >
                        {especialidades.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="select-field">
                      <label htmlFor="profesional-especialidad">Profesional</label>
                      <select
                        id="profesional-especialidad"
                        value={veterinarioSeleccionado}
                        onChange={(event) => setVeterinarioSeleccionado(event.target.value)}
                      >
                        {veterinariosPorEspecialidad.map((vet) => (
                          <option key={vet.id} value={vet.id}>
                            {vet.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="select-row">
                    <div className="select-field">
                      <label htmlFor="profesional-directo">Profesional</label>
                      <select
                        id="profesional-directo"
                        value={veterinarioSeleccionado}
                        onChange={(event) => setVeterinarioSeleccionado(event.target.value)}
                      >
                        {veterinariosDisponibles.map((vet) => (
                          <option key={vet.id} value={vet.id}>
                            {vet.nombre} ({vet.especialidades.join(', ')})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="selection-panel">
            <header className="selection-header">
              <h2>Reservá un servicio complementario</h2>
              <p>Coordiná peluquería, entrenamiento y otros servicios premium disponibles por sucursal.</p>
            </header>

            {serviciosDisponibles.length === 0 ? (
              <p className="no-slots">No hay servicios complementarios disponibles en esta sucursal.</p>
            ) : (
              <div className="select-row">
                <div className="select-field">
                  <label htmlFor="rol-servicio">Servicio</label>
                  <select
                    id="rol-servicio"
                    value={rolServicioSeleccionado}
                    onChange={(event) => setRolServicioSeleccionado(event.target.value)}
                  >
                    {rolesServicio.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="select-field">
                  <label htmlFor="profesional-servicio">Profesional</label>
                  <select
                    id="profesional-servicio"
                    value={profesionalServicioSeleccionado}
                    onChange={(event) => setProfesionalServicioSeleccionado(event.target.value)}
                  >
                    {profesionalesServicioFiltrados.map((profesional) => (
                      <option key={profesional.id} value={profesional.id}>
                        {profesional.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>
        )}

        {proveedorActivo && (
          <section className="provider-profile">
            <div>
              <h2>{proveedorActivo.nombre}</h2>
              <p>{proveedorActivo.descripcion}</p>
              {sucursalActiva && (
                <p className="provider-location">
                  Sucursal seleccionada: {sucursalActiva.nombre} · {sucursalActiva.direccion}
                </p>
              )}
              <div className="provider-tags">
                {turnoTipo === 'veterinario'
                  ? proveedorActivo.especialidades.map((esp) => (
                      <span key={esp} className="provider-tag">
                        {esp}
                      </span>
                    ))
                  : (
                      <span className="provider-tag">{proveedorActivo.rol}</span>
                    )}
              </div>
              <p className="provider-days">
                Atiende los {proveedorActivo.dias.map((day) => diasSemana[day]).join(', ')}
              </p>
            </div>
          </section>
        )}

        {mostrarCalendario && (
          <section className="calendar-section">
            <h2 className="section-title">Seleccioná la fecha</h2>
            <div className="calendar-grid">
              {fechas.map(({ iso, label, weekday }) => {
                const disponible = diasDisponiblesProveedor.has(weekday);
                const isSelected = fechaSeleccionada === iso;
                return (
                  <button
                    type="button"
                    key={iso}
                    className={`calendar-day ${disponible ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => manejarSeleccionFecha(iso, disponible)}
                    disabled={!disponible}
                  >
                    <span className="day-label">{label}</span>
                    <span className="day-status">{disponible ? 'Disponible' : 'Sin turnos'}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {fechaSeleccionada && (
          <section className="slots-section">
            <h2 className="section-title">Horarios disponibles</h2>
            {slotsDisponibles.length > 0 ? (
              <div className="slots-grid">
                {slotsDisponibles.map((hora) => {
                  const isSelected = horaSeleccionada === hora;
                  return (
                    <button
                      key={hora}
                      type="button"
                      className={`slot-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => setHoraSeleccionada(hora)}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="no-slots">No hay horarios disponibles en esta fecha.</p>
            )}
          </section>
        )}

        {proveedorActivo && fechaSeleccionada && horaSeleccionada && (
          <section className="turno-summary">
            <h2>Resumen del turno</h2>
            <ul>
              <li>
                <strong>Cliente:</strong> {selectedUser ? (
                  <>
                    {selectedUser.name} <span className="summary-muted">({selectedUser.email})</span>
                  </>
                ) : (
                  'Seleccionar cliente'
                )}
              </li>
              <li>
                <strong>Modalidad:</strong> {categoriaLabels[turnoCategoria]}
              </li>
              {mascotaActiva && (
                <li>
                  <strong>Mascota:</strong> {mascotaActiva.name}{' '}
                  <span className="summary-muted">({speciesLabels[mascotaActiva.species] || speciesLabels.other})</span>
                </li>
              )}
              {sucursalActiva && (
                <li>
                  <strong>Sucursal:</strong> {sucursalActiva.nombre} ({sucursalActiva.direccion})
                </li>
              )}
              <li>
                <strong>Profesional:</strong> {proveedorActivo.nombre}
              </li>
              <li>
                <strong>Tipo:</strong> {turnoTipo === 'veterinario' ? 'Atención directa' : 'Servicio'}
              </li>
              <li>
                <strong>Canal de atención:</strong>{' '}
                {turnoCategoria === 'atencion_directa'
                  ? 'Administrativo en local'
                  : turnoCategoria === 'emergencia'
                    ? 'Equipo de emergencias veterinarias'
                    : turnoTipo === 'veterinario'
                      ? 'Profesional veterinario'
                      : 'Servicio complementario'}
              </li>
              <li>
                <strong>{turnoTipo === 'veterinario' ? 'Especialidad' : 'Servicio'}:</strong>{' '}
                {turnoTipo === 'veterinario' ? proveedorActivo.especialidades.join(', ') : proveedorActivo.rol}
              </li>
              <li>
                <strong>Fecha:</strong>{' '}
                {new Date(fechaSeleccionada).toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </li>
              <li>
                <strong>Hora:</strong> {horaSeleccionada}
              </li>
            </ul>
            <div className="summary-actions">
              <button type="button" className="btn primary" onClick={manejarConfirmacion} disabled={!mascotaActiva}>
                Asignar turno
              </button>
              <button
                type="button"
                className="btn tertiary"
                onClick={() => {
                  setFechaSeleccionada(null);
                  setHoraSeleccionada(null);
                }}
              >
                Modificar selección
              </button>
            </div>
          </section>
        )}

        <section className="turnos-admin-list">
          <header className="selection-header">
            <h2>Agenda de turnos</h2>
            <p>Seguimiento de los turnos asignados por el equipo administrativo.</p>
          </header>
          {turnosRegistrados.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-calendar-days"></i>
              <h3>Sin turnos registrados</h3>
              <p>Registrá nuevos turnos para verlos listados aquí y actualizar su estado.</p>
            </div>
          ) : (
            <div className="turnos-table-wrapper">
              <table className="turnos-admin-table">
                <thead>
                  <tr>
                    <th>Cliente · Mascota</th>
                    <th>Sucursal</th>
                    <th>Profesional</th>
                    <th>Fecha y hora</th>
                    <th>Modalidad / Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosRegistrados.slice(0, 5).map((turno) => (
                    <tr key={turno.id}>
                      <td data-label="Cliente y mascota">
                        <div className="client-pet-cell">
                          <div className="cliente-cell">
                            <strong>{turno.userName}</strong>
                            <span>{turno.userEmail}</span>
                          </div>
                          {turno.petName ? (
                            <div className="pet-cell">
                              <strong>{turno.petName}</strong>
                              <span>{turno.petSpeciesLabel || speciesLabels[turno.petSpecies] || speciesLabels.other}</span>
                            </div>
                          ) : (
                            <span className="table-pill muted">Sin mascota cargada</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Sucursal">
                        <span className="table-pill">{turno.sucursalNombre}</span>
                      </td>
                      <td data-label="Profesional">
                        <div className="profesional-cell">
                          <strong>{turno.proveedorNombre}</strong>
                          <span>{turno.proveedorDetalle}</span>
                        </div>
                      </td>
                      <td data-label="Fecha y hora">
                        <div className="cell-datetime">
                          <span className="cell-date">{new Date(turno.fechaISO).toLocaleDateString('es-AR')}</span>
                          <span className="cell-time">{turno.hora}</span>
                        </div>
                      </td>
                      <td data-label="Modalidad / Tipo">
                        <div className="cell-mode">
                          <span>{categoriaLabels[turno.modalidad] || categoriaLabels.programado}</span>
                          <span className="summary-muted">{turno.tipo === 'atencion_directa' ? 'Atención directa' : 'Servicio complementario'}</span>
                        </div>
                      </td>
                      <td data-label="Estado">
                        <span className={`turno-status status-${turno.estado}`}>
                          {estadoLabels[turno.estado] || turno.estado}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className="turnos-actions icon-only">
                          {turno.estado !== 'confirmado' && turno.estado !== 'completado' && (
                            <button
                              type="button"
                              className="action-icon"
                              onClick={() => actualizarEstadoTurno(turno.id, 'confirmado')}
                              title="Confirmar turno"
                            >
                              <i className="fa-solid fa-circle-check"></i>
                            </button>
                          )}
                          {turno.estado !== 'completado' && (
                            <button
                              type="button"
                              className="action-icon secondary"
                              onClick={() => actualizarEstadoTurno(turno.id, 'completado')}
                              title="Marcar como completado"
                            >
                              <i className="fa-solid fa-circle-check"></i>
                            </button>
                          )}
                          <button
                            type="button"
                            className="action-icon danger"
                            onClick={() => eliminarTurno(turno.id)}
                            title="Eliminar turno"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTurnos;