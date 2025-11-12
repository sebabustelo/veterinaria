import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../../components/estaticos/Header";
import Footer from "../../components/estaticos/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const sucursales = [
  {
    id: 1,
    nombre: "Vettix Central",
    alias: "Veterinaria Central",
    telefono: "11 2233 4455",
    email: "central@vet.com",
    direccion: "Av. Siempre Viva 742, CABA",
    notas: "Urgencias 24h · Laboratorio integral · Internación premium",
  },
  {
    id: 2,
    nombre: "Vettix Norte",
    alias: "Veterinaria Norte",
    telefono: "11 4455 6677",
    email: "norte@vet.com",
    direccion: "San Martín 123, Vicente López",
    notas: "Consultorio especializado en rehabilitación y medicina preventiva",
  },
  {
    id: 3,
    nombre: "Vettix Belgrano",
    alias: "Veterinaria Belgrano",
    telefono: "11 4789 1234",
    email: "belgrano@vet.com",
    direccion: "Av. Cabildo 2300, Belgrano",
    notas: "Clínica central con internación, spa y diagnóstico avanzado",
  },
  {
    id: 4,
    nombre: "Vettix Núñez",
    alias: "Veterinaria Núñez",
    telefono: "11 4789 5678",
    email: "nunez@vet.com",
    direccion: "Av. del Libertador 3500, Núñez",
    notas: "Centro de imagenología, cardiología y telemedicina",
  },
  {
    id: 5,
    nombre: "Vettix Saavedra",
    alias: "Veterinaria Saavedra",
    telefono: "11 4789 9012",
    email: "saavedra@vet.com",
    direccion: "Av. Monroe 4800, Saavedra",
    notas: "Spa premium, nutrición y programas Vettix Walkers",
  },
];

const speciesLabels = {
  dog: "Perro",
  cat: "Gato",
  bird: "Ave",
  small_mammal: "Pequeño mamífero",
  reptile: "Reptil",
  other: "Otra especie",
};

const SPECIES_OPTIONS = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "bird", label: "Ave" },
  { value: "small_mammal", label: "Conejo / Pequeño mamífero" },
  { value: "reptile", label: "Reptil" },
  { value: "other", label: "Otra especie" },
];

const getPetStorageKey = (user) => {
  if (!user) return "vettix_pets_guest";
  const identifier = user.id || user.user_id || user.uid || user.email;
  return identifier ? `vettix_pets_${identifier}` : "vettix_pets_guest";
};

const loadPets = (user) => {
  try {
    const key = getPetStorageKey(user);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((pet, index) => ({
      ...pet,
      id: pet.id ?? `${key}-pet-${index}`,
    }));
  } catch (error) {
    console.warn("No se pudieron cargar las mascotas", error);
    return [];
  }
};

const savePets = (user, pets) => {
  try {
    const key = getPetStorageKey(user);
    localStorage.setItem(
      key,
      JSON.stringify(
        pets.map(({ id, ...pet }) => ({
          ...pet,
          id,
        }))
      )
    );
  } catch (error) {
    console.error("No se pudieron guardar las mascotas", error);
  }
};

const SAMPLE_PETS_BY_USER = {
  "mariana.lopez@vettix.com": [
    {
      id: "pet-simba",
      name: "Simba",
      species: "cat",
      breed: "Maine Coon",
      age: 5,
      weight: 6.2,
      notes: "Control renal anual.",
      chronicConditions: "Enfermedad renal estadio I",
    },
    {
      id: "pet-luna",
      name: "Luna",
      species: "dog",
      breed: "Border Collie",
      age: 3,
      weight: 18.5,
      notes: "Turno mensual de fisioterapia.",
      chronicConditions: "Rehabilitación de rodilla",
    },
  ],
  "gonzalo.perez@vettix.com": [
    {
      id: "pet-rocky",
      name: "Rocky",
      species: "dog",
      breed: "Bulldog Francés",
      age: 2,
      weight: 12.1,
      notes: "Consulta trimestral de dermatología.",
      chronicConditions: "Dermatitis atópica",
    },
  ],

  "sample-guest": [
    {
      id: "pet-guest-1",
      name: "Olivia",
      species: "dog",
      breed: "Golden Retriever",
      age: 4,
      weight: 24,
      notes: "Consulta general y plan de vacunación.",
    },
    {
      id: "pet-guest-2",
      name: "Mishi",
      species: "cat",
      breed: "Siames",
      age: 2,
      weight: 4.2,
      notes: "Control anual de salud.",
    },
  ],
};

const veterinarios = [
  {
    id: "vet-ana",
    nombre: "Dra. Ana Torres",
    especialidades: ["Clínica General", "Urgencias"],
    descripcion:
      "Responsable del servicio de urgencias 24h y medicina preventiva en la sede principal de Belgrano.",
    dias: [1, 2, 3, 5],
    horarios: ["09:00", "10:30", "12:00", "16:00", "18:30"],
    sucursales: [1, 3],
  },
  {
    id: "vet-martin",
    nombre: "Dr. Martín Rivas",
    especialidades: ["Cardiología", "Diagnóstico por imágenes"],
    descripcion:
      "Especialista en cardiología y ecografía Doppler. Coordina los estudios avanzados en Núñez Centro.",
    dias: [2, 4, 6],
    horarios: ["10:00", "11:30", "15:00", "17:30"],
    sucursales: [3, 4],
  },
  {
    id: "vet-lucia",
    nombre: "Dra. Lucía Pérez",
    especialidades: ["Medicina Felina", "Nutrición"],
    descripcion:
      "Lidera el programa Vettix Feline Care con planes nutricionales personalizados y control de patologías crónicas.",
    dias: [1, 3, 4, 5],
    horarios: ["09:30", "11:00", "14:30", "17:00"],
    sucursales: [3, 5],
  },
  {
    id: "vet-marina",
    nombre: "Dra. Marina Valdez",
    especialidades: ["Rehabilitación", "Fisioterapia"],
    descripcion:
      "Responsable de la unidad de fisioterapia y rehabilitación neuromuscular con equipamiento de hidroterapia.",
    dias: [1, 2, 4],
    horarios: ["08:30", "10:00", "13:00", "16:30"],
    sucursales: [1, 2, 4],
  },
];

const serviciosComplementarios = [
  {
    id: "serv-pelu-1",
    nombre: "Laura Paredes",
    rol: "Peluquería Premium",
    descripcion:
      "Especialista en estilismo canino, tratamientos hipoalergénicos y spa relajante.",
    dias: [2, 4, 6],
    horarios: ["10:00", "12:00", "15:30"],
    sucursales: [1, 3, 5],
  },
  {
    id: "serv-entren-1",
    nombre: "Diego Ferreyra",
    rol: "Entrenador y adiestrador",
    descripcion:
      "Adiestramiento positivo, obediencia básica y resolución de problemas de conducta.",
    dias: [1, 3, 5],
    horarios: ["09:00", "11:00", "14:00", "17:00"],
    sucursales: [1, 2, 4],
  },
  {
    id: "serv-paseo-1",
    nombre: "Valentina Costa",
    rol: "Paseadora profesional",
    descripcion:
      "Coordinadora del programa Vettix Walkers con circuitos seguros y reporte en vivo.",
    dias: [1, 2, 3, 4, 5],
    horarios: ["08:00", "12:30", "18:00"],
    sucursales: [1, 2, 3, 4, 5],
  },
  {
    id: "serv-pelu-2",
    nombre: "Mauro Giménez",
    rol: "Peluquería Premium",
    descripcion:
      "Especialista en razas de pelo largo, cortes de competición y tratamientos detox.",
    dias: [1, 3, 5],
    horarios: ["11:00", "13:30", "16:30"],
    sucursales: [3, 4],
  },
];

const generateDateRange = (days = 14) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = date.toISOString().split("T")[0];
    const options = { weekday: "short", day: "numeric", month: "short" };
    const label = date.toLocaleDateString("es-AR", options);
    return { iso, date, label, weekday: date.getDay() };
  });
};

const diasSemana = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const getSamplePets = (user) => {
  const key = user?.email ? user.email.toLowerCase() : 'sample-guest';
  const sample = SAMPLE_PETS_BY_USER[key] || SAMPLE_PETS_BY_USER['sample-guest'] || [];
  return sample.map((pet, index) => ({
    ...pet,
    id: pet.id ?? `sample-${key}-${index}`,
  }));
};

const getPetsForUser = (user) => {
  let pets = loadPets(user);
  if (pets.length === 0) {
    const sample = getSamplePets(user);
    if (sample.length > 0) {
      savePets(user, sample);
      pets = sample;
    }
  }
  return pets;
};

const SolicitarTurno = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(sucursales[0].id);
  const [turnoTipo, setTurnoTipo] = useState("veterinario");
  const [filtroVet, setFiltroVet] = useState("especialidad");
  const [mascotasCliente, setMascotasCliente] = useState(() => getPetsForUser(user));
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(() => {
    const initial = getPetsForUser(user);
    return initial.length ? String(initial[0].id) : "";
  });
  const [mostrarFormularioMascota, setMostrarFormularioMascota] = useState(false);
  const [nuevaMascota, setNuevaMascota] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    notes: "",
  });

  useEffect(() => {
    const cargadas = getPetsForUser(user);
    setMascotasCliente(cargadas);
    setMascotaSeleccionada(cargadas.length ? String(cargadas[0].id) : "");
  }, [user]);

  const mascotaActiva = useMemo(
    () => mascotasCliente.find((pet) => String(pet.id) === String(mascotaSeleccionada)) || null,
    [mascotasCliente, mascotaSeleccionada]
  );

  const sucursalActiva = useMemo(
    () => sucursales.find((sucursal) => sucursal.id === sucursalSeleccionada) || null,
    [sucursalSeleccionada]
  );

  const veterinariosDisponibles = useMemo(
    () => veterinarios.filter((vet) => vet.sucursales.includes(sucursalSeleccionada)),
    [sucursalSeleccionada]
  );

  const especialidades = useMemo(
    () => Array.from(new Set(veterinariosDisponibles.flatMap((v) => v.especialidades))),
    [veterinariosDisponibles]
  );

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  useEffect(() => {
    if (especialidades.length === 0) {
      if (especialidadSeleccionada) {
        setEspecialidadSeleccionada("");
      }
      return;
    }
    if (!especialidadSeleccionada || !especialidades.includes(especialidadSeleccionada)) {
      setEspecialidadSeleccionada(especialidades[0]);
    }
  }, [especialidades, especialidadSeleccionada]);

  const veterinariosPorEspecialidad = useMemo(() => {
    if (filtroVet === "especialidad" && especialidadSeleccionada) {
      return veterinariosDisponibles.filter((v) =>
        v.especialidades.includes(especialidadSeleccionada)
      );
    }
    return veterinariosDisponibles;
  }, [filtroVet, especialidadSeleccionada, veterinariosDisponibles]);

  const [veterinarioSeleccionado, setVeterinarioSeleccionado] = useState("");
  useEffect(() => {
    const listaBase =
      filtroVet === "especialidad" ? veterinariosPorEspecialidad : veterinariosDisponibles;
    if (listaBase.length === 0) {
      if (veterinarioSeleccionado) {
        setVeterinarioSeleccionado("");
      }
      return;
    }
    const existe = listaBase.some((vet) => vet.id === veterinarioSeleccionado);
    if (!existe) {
      setVeterinarioSeleccionado(listaBase[0].id);
    }
  }, [veterinariosPorEspecialidad, veterinariosDisponibles, filtroVet, veterinarioSeleccionado]);

  const serviciosDisponibles = useMemo(
    () => serviciosComplementarios.filter((servicio) => servicio.sucursales.includes(sucursalSeleccionada)),
    [sucursalSeleccionada]
  );

  const rolesServicio = useMemo(
    () => Array.from(new Set(serviciosDisponibles.map((s) => s.rol))),
    [serviciosDisponibles]
  );

  const [rolServicioSeleccionado, setRolServicioSeleccionado] = useState("");
  useEffect(() => {
    if (rolesServicio.length === 0) {
      if (rolServicioSeleccionado) {
        setRolServicioSeleccionado("");
      }
      return;
    }
    if (!rolServicioSeleccionado || !rolesServicio.includes(rolServicioSeleccionado)) {
      setRolServicioSeleccionado(rolesServicio[0]);
    }
  }, [rolesServicio, rolServicioSeleccionado]);

  const profesionalesServicioFiltrados = useMemo(() => {
    return serviciosDisponibles.filter((servicio) =>
      rolServicioSeleccionado ? servicio.rol === rolServicioSeleccionado : true
    );
  }, [serviciosDisponibles, rolServicioSeleccionado]);

  const [profesionalServicioSeleccionado, setProfesionalServicioSeleccionado] = useState("");
  useEffect(() => {
    if (profesionalesServicioFiltrados.length === 0) {
      if (profesionalServicioSeleccionado) {
        setProfesionalServicioSeleccionado("");
      }
      return;
    }
    const existe = profesionalesServicioFiltrados.some(
      (servicio) => servicio.id === profesionalServicioSeleccionado
    );
    if (!existe) {
      setProfesionalServicioSeleccionado(profesionalesServicioFiltrados[0].id);
    }
  }, [profesionalesServicioFiltrados, profesionalServicioSeleccionado]);

  const fechas = useMemo(() => generateDateRange(18), []);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

  const proveedorActivo = useMemo(() => {
    if (turnoTipo === "veterinario") {
      return (
        veterinariosDisponibles.find((v) => v.id === veterinarioSeleccionado) || null
      );
    }
    return (
      serviciosDisponibles.find(
        (servicio) => servicio.id === profesionalServicioSeleccionado
      ) || null
    );
  }, [
    turnoTipo,
    veterinariosDisponibles,
    veterinarioSeleccionado,
    serviciosDisponibles,
    profesionalServicioSeleccionado,
  ]);

  const diasDisponiblesProveedor = useMemo(() => {
    if (!proveedorActivo) return [];
    return new Set(proveedorActivo.dias);
  }, [proveedorActivo]);

  const slotsDisponibles = useMemo(() => {
    if (!proveedorActivo || !fechaSeleccionada) return [];
    const fecha = new Date(fechaSeleccionada);
    const disponible = diasDisponiblesProveedor.has(fecha.getDay());
    return disponible ? proveedorActivo.horarios : [];
  }, [proveedorActivo, fechaSeleccionada, diasDisponiblesProveedor]);

  const handleSeleccionEspecialidad = (value) => {
    setEspecialidadSeleccionada(value);
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
  };

  const handleSeleccionVeterinario = (value) => {
    setVeterinarioSeleccionado(value);
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
  };

  const handleSeleccionRolServicio = (value) => {
    setRolServicioSeleccionado(value);
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
  };

  const handleSeleccionProfesionalServicio = (value) => {
    setProfesionalServicioSeleccionado(value);
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
  };

  const manejarSeleccionFecha = (fechaIso, disponible) => {
    if (!disponible) return;
    setFechaSeleccionada(fechaIso);
    setHoraSeleccionada(null);
  };

  const manejarConfirmacion = () => {
    if (!mascotaActiva) {
      showError("Seleccioná la mascota antes de confirmar el turno.");
      return;
    }
    if (!proveedorActivo || !fechaSeleccionada || !horaSeleccionada || !sucursalActiva) return;
    const fecha = new Date(fechaSeleccionada).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const resumen = `Turno para ${mascotaActiva.name} en ${sucursalActiva.nombre} con ${
      proveedorActivo.nombre
    } el ${fecha} a las ${horaSeleccionada}.`;
    alert(
      `${resumen}\nNos comunicaremos desde ${sucursalActiva.telefono} para confirmar la visita.`
    );
  };

  const mostrarCalendario = Boolean(proveedorActivo);

  const handleNuevaMascotaCampo = (event) => {
    const { name, value } = event.target;
    setNuevaMascota((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAgregarMascota = (event) => {
    event.preventDefault();

    if (!nuevaMascota.name.trim()) {
      showError("Indicá el nombre de la mascota.");
      return;
    }

    if (!nuevaMascota.species) {
      showError("Seleccioná la especie de la mascota.");
      return;
    }

    const nueva = {
      id: Date.now(),
      name: nuevaMascota.name.trim(),
      species: nuevaMascota.species,
      breed: nuevaMascota.breed.trim() || undefined,
      age: nuevaMascota.age !== "" ? Number(nuevaMascota.age) : undefined,
      weight: nuevaMascota.weight !== "" ? Number(nuevaMascota.weight) : undefined,
      notes: nuevaMascota.notes.trim() || undefined,
    };

    const actualizadas = [...mascotasCliente, nueva];
    setMascotasCliente(actualizadas);
    setMascotaSeleccionada(String(nueva.id));
    setMostrarFormularioMascota(false);
    setNuevaMascota({ name: "", species: "", breed: "", age: "", weight: "", notes: "" });
    savePets(user, actualizadas);
    showSuccess("Mascota agregada correctamente.");
  };

  return (
    <>
      <Helmet>
        <title>Solicitar Turno | Vettix Clínica Veterinaria Premium</title>
        <meta
          name="description"
          content="Reservá turnos con veterinarios especialistas, peluqueros premium, entrenadores y paseadores certificados de Vettix."
        />
      </Helmet>
      <Header />
      <main className="main-content turno-page">
        <section className="turnos-hero">
          <div>
            <span className="hero-tag">Agenda tu experiencia Vettix</span>
            <h1>Solicitar turno</h1>
            <p>
              Elegí el profesional o servicio que necesitás, consultá las disponibilidades en el calendario y reservá tu turno en cuestión de segundos. Nuestro equipo confirmará la cita por el canal que prefieras.
            </p>
          </div>
        </section>
      
        <section className="selection-panel">
          <header className="selection-header">
            <h2>Elegí la sucursal Vettix</h2>
            <p>
              Seleccioná la clínica donde querés atenderte. Te mostraremos únicamente los
              profesionales y servicios disponibles en esa ubicación.
            </p>
          </header>
          <div className="select-row">
            <div className="select-field">
              <label htmlFor="sucursal">Sucursal</label>
              <select
                id="sucursal"
                value={sucursalSeleccionada}
                onChange={(e) => {
                  setSucursalSeleccionada(Number(e.target.value));
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
            <h2>Elegí la mascota</h2>
            <p>
              Seleccioná la mascota para la que reservás el turno o cargá una ficha rápida si todavía no la agregaste en tu cuenta.
            </p>
          </header>

          {mascotasCliente.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-paw"></i>
              <h3>Sin mascotas registradas</h3>
              <p>Agregá la ficha de tu mascota para continuar con la reserva del turno.</p>
              <button
                type="button"
                className="btn tertiary"
                onClick={() => setMostrarFormularioMascota((prev) => !prev)}
              >
                {mostrarFormularioMascota ? "Cerrar formulario" : "Agregar mascota rápida"}
              </button>
            </div>
          ) : (
            <>
              <div className="pet-actions">
                <button
                  type="button"
                  className="btn tertiary"
                  onClick={() => setMostrarFormularioMascota((prev) => !prev)}
                >
                  {mostrarFormularioMascota ? "Cerrar formulario" : "Agregar otra mascota"}
                </button>
              </div>

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
                    {mascotaActiva.age !== undefined && mascotaActiva.age !== null && mascotaActiva.age !== "" && (
                      <li>
                        <span>Edad:</span> {mascotaActiva.age} {Number(mascotaActiva.age) === 1 ? "año" : "años"}
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

          {mostrarFormularioMascota && (
            <form className="pet-form" onSubmit={handleAgregarMascota}>
              <div className="pet-form-grid">
                <div className="form-group">
                  <label htmlFor="pet-name">Nombre</label>
                  <input
                    id="pet-name"
                    name="name"
                    value={nuevaMascota.name}
                    onChange={handleNuevaMascotaCampo}
                    placeholder="Ej: Olivia"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pet-species">Especie</label>
                  <select
                    id="pet-species"
                    name="species"
                    value={nuevaMascota.species}
                    onChange={handleNuevaMascotaCampo}
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
                    value={nuevaMascota.breed}
                    onChange={handleNuevaMascotaCampo}
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
                    value={nuevaMascota.age}
                    onChange={handleNuevaMascotaCampo}
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
                    value={nuevaMascota.weight}
                    onChange={handleNuevaMascotaCampo}
                    placeholder="Ej: 5.2"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pet-notes">Notas adicionales</label>
                <textarea
                  id="pet-notes"
                  name="notes"
                  rows={3}
                  value={nuevaMascota.notes}
                  onChange={handleNuevaMascotaCampo}
                  placeholder="Datos relevantes para el turno (medicación, comportamiento, recordatorios, etc.)"
                />
              </div>
              <div className="pet-form-actions">
                <button type="submit" className="btn primary">
                  Guardar mascota
                </button>
              </div>
            </form>
          )}
        </section>


        <div className="turno-toggle">
          <button
            type="button"
            onClick={() => {
              setTurnoTipo("veterinario");
              setFechaSeleccionada(null);
              setHoraSeleccionada(null);
            }}
            className={turnoTipo === "veterinario" ? "toggle-button active" : "toggle-button"}
          >
            Turno con veterinario
          </button>
          <button
            type="button"
            onClick={() => {
              setTurnoTipo("servicio");
              setFechaSeleccionada(null);
              setHoraSeleccionada(null);
            }}
            className={turnoTipo === "servicio" ? "toggle-button active" : "toggle-button"}
          >
            Servicios complementarios
          </button>
        </div>

        {turnoTipo === "veterinario" ? (
          <section className="selection-panel">
            <header className="selection-header">
              <h2>Agenda con un profesional veterinario</h2>
              <p>
                Podés buscar por especialidad o directamente por el nombre del profesional. Todos los turnos incluyen historia clínica digital, recordatorios automáticos y seguimiento post consulta.
              </p>
            </header>

            {veterinariosDisponibles.length === 0 ? (
              <p className="no-slots">
                No contamos con profesionales veterinarios disponibles en esta sucursal. Elegí otra clínica para reservar tu turno.
              </p>
            ) : (
              <>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="filtro-vet"
                      value="especialidad"
                      checked={filtroVet === "especialidad"}
                      onChange={() => {
                        setFiltroVet("especialidad");
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
                      checked={filtroVet === "profesional"}
                      onChange={() => {
                        setFiltroVet("profesional");
                        setFechaSeleccionada(null);
                        setHoraSeleccionada(null);
                      }}
                    />
                    Buscar por profesional
                  </label>
                </div>

                {filtroVet === "especialidad" ? (
                  <div className="select-row">
                    <div className="select-field">
                      <label htmlFor="especialidad">Especialidad</label>
                      <select
                        id="especialidad"
                        value={especialidadSeleccionada}
                        onChange={(e) => handleSeleccionEspecialidad(e.target.value)}
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
                        onChange={(e) => handleSeleccionVeterinario(e.target.value)}
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
                        onChange={(e) => handleSeleccionVeterinario(e.target.value)}
                      >
                        {veterinariosDisponibles.map((vet) => (
                          <option key={vet.id} value={vet.id}>
                            {vet.nombre} ({vet.especialidades.join(", ")})
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
              <p>
                Elegí entre peluquería premium, entrenamiento, paseos y programas de adiestramiento. Todos los servicios son coordinados por profesionales certificados Vettix.
              </p>
            </header>

            {serviciosDisponibles.length === 0 ? (
              <p className="no-slots">
                No hay servicios complementarios disponibles en esta sucursal. Probá seleccionando otra clínica.
              </p>
            ) : (
              <div className="select-row">
                <div className="select-field">
                  <label htmlFor="rol-servicio">Servicio</label>
                  <select
                    id="rol-servicio"
                    value={rolServicioSeleccionado}
                    onChange={(e) => handleSeleccionRolServicio(e.target.value)}
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
                    onChange={(e) => handleSeleccionProfesionalServicio(e.target.value)}
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
                {turnoTipo === "veterinario"
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
                Atiende los {proveedorActivo.dias
                  .map((day) => diasSemana[day])
                  .join(", ")}
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
                    className={`calendar-day ${disponible ? "available" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => manejarSeleccionFecha(iso, disponible)}
                    disabled={!disponible}
                  >
                    <span className="day-label">{label}</span>
                    <span className="day-status">{disponible ? "Disponible" : "Sin turnos"}</span>
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
                      className={`slot-button ${isSelected ? "selected" : ""}`}
                      onClick={() => setHoraSeleccionada(hora)}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="no-slots">
                No hay horarios disponibles para esta fecha. Probá seleccionando otro día.
              </p>
            )}
          </section>
        )}

        {proveedorActivo && fechaSeleccionada && horaSeleccionada && (
          <section className="turno-summary">
            <h2>Resumen del turno</h2>
            <ul>
              {mascotaActiva && (
                <li>
                  <strong>Mascota:</strong> {mascotaActiva.name}{" "}
                  <span className="summary-muted">
                    ({speciesLabels[mascotaActiva.species] || speciesLabels.other})
                  </span>
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
              {turnoTipo === "veterinario" ? (
                <li>
                  <strong>Especialidad:</strong> {proveedorActivo.especialidades.join(", ")}
                </li>
              ) : (
                <li>
                  <strong>Servicio:</strong> {proveedorActivo.rol}
                </li>
              )}
              <li>
                <strong>Fecha:</strong> {new Date(fechaSeleccionada).toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </li>
              <li>
                <strong>Hora:</strong> {horaSeleccionada}
              </li>
            </ul>
            <div className="summary-actions">
              <button
                type="button"
                className="btn primary"
                onClick={manejarConfirmacion}
                disabled={!mascotaActiva}
              >
                Confirmar turno
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
      </main>
      <Footer />
    </>
  );
};

export default SolicitarTurno;
