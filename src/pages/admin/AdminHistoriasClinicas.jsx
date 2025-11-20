import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeaderAdmin from '@/components/estaticos/HeaderAdmin';
import Footer from '@/components/estaticos/Footer';
import demoClients from '@/data/demoClients.json';
import './AdminHistoriasClinicas.css';
import './Admin.css';

const speciesLabels = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  small_mammal: 'Pequeño mamífero',
  reptile: 'Reptil',
  other: 'Otra especie',
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

const HISTORIAS_CLINICAS_KEY = 'vettix_historias_clinicas';

const loadHistoriaClinica = (petId) => {
  try {
    const stored = localStorage.getItem(HISTORIAS_CLINICAS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[petId]) {
        return parsed[petId];
      }
    }
  } catch (error) {
    console.warn('Error al cargar historia clínica', error);
  }
  return null;
};

const saveHistoriasClinicas = (historias) => {
  try {
    localStorage.setItem(HISTORIAS_CLINICAS_KEY, JSON.stringify(historias));
  } catch (error) {
    console.error('Error al guardar historias clínicas', error);
  }
};

const generateHistoriasClinicasSeed = (demoUsers) => {
  if (demoUsers.length === 0) return {};

  const historias = {};

  // Función para obtener una mascota de un usuario
  const getPetFromUser = (user, petIndex = 0) => {
    const pets = loadPetsFromStorage(user);
    if (pets.length > petIndex) {
      return pets[petIndex];
    }
    if (pets.length > 0) {
      return pets[0];
    }
    return null;
  };

  // Historia clínica para la primera mascota del primer usuario
  const pet1 = getPetFromUser(demoUsers[0], 0);
  if (pet1) {
    historias[pet1.id] = {
      fechaPrimeraConsulta: '2024-03-15T10:00:00',
      veterinarioPrincipal: 'Dra. Ana Torres',
      sucursalPrincipal: 'Vettix Central',
      consultas: [
        {
          tipo: 'Consulta general',
          fecha: '2024-03-15T10:00:00',
          veterinario: 'Dra. Ana Torres',
          motivo: 'Primera consulta y examen general',
          diagnostico: 'Paciente en buen estado general. Sin signos de enfermedad.',
          tratamiento: 'Vacunación anual completa. Desparasitación interna y externa.',
          observaciones: 'Mascota activa, buen apetito. Peso adecuado para su edad y raza.',
          vacunas: ['Antirrábica', 'Sextuple', 'Bordetella'],
        },
        {
          tipo: 'Control de rutina',
          fecha: '2024-06-20T14:30:00',
          veterinario: 'Dra. Ana Torres',
          motivo: 'Control trimestral y refuerzo de vacunas',
          diagnostico: 'Estado de salud óptimo. Peso estable.',
          tratamiento: 'Refuerzo de vacuna antirrábica. Continuar con desparasitación mensual.',
          observaciones: 'Mascota se adaptó bien a la rutina. Sin cambios significativos.',
        },
        {
          tipo: 'Consulta por urgencia',
          fecha: '2024-09-10T18:00:00',
          veterinario: 'Dra. Ana Torres',
          motivo: 'Vómitos y diarrea desde hace 24 horas',
          diagnostico: 'Gastroenteritis aguda. Posible causa: cambio de alimento o ingesta inadecuada.',
          tratamiento: 'Dieta blanda por 48 horas. Medicación antiemética y probióticos.',
          observaciones: 'Paciente respondió bien al tratamiento. Monitorear hidratación.',
        },
      ],
    };
  }

  // Historia clínica para la primera mascota del segundo usuario (si existe)
  if (demoUsers.length > 1) {
    const pet2 = getPetFromUser(demoUsers[1], 0);
    if (pet2) {
      historias[pet2.id] = {
        fechaPrimeraConsulta: '2024-01-10T09:00:00',
        veterinarioPrincipal: 'Dra. Lucía Pérez',
        sucursalPrincipal: 'Vettix Belgrano',
        consultas: [
          {
            tipo: 'Consulta general',
            fecha: '2024-01-10T09:00:00',
            veterinario: 'Dra. Lucía Pérez',
            motivo: 'Primera consulta. Examen completo y plan de salud',
            diagnostico: 'Paciente joven en excelente estado. Sin patologías detectadas.',
            tratamiento: 'Inicio de plan de vacunación. Desparasitación preventiva.',
            observaciones: 'Mascota muy sociable. Recomendaciones sobre alimentación y ejercicio.',
            vacunas: ['Sextuple', 'Antirrábica'],
          },
          {
            tipo: 'Control de crecimiento',
            fecha: '2024-04-15T11:00:00',
            veterinario: 'Dra. Lucía Pérez',
            motivo: 'Control de desarrollo y peso',
            diagnostico: 'Crecimiento normal. Peso adecuado para la edad.',
            tratamiento: 'Ajuste de dieta según crecimiento. Continuar con plan de vacunación.',
            observaciones: 'Excelente desarrollo. Mascota muy activa y saludable.',
          },
          {
            tipo: 'Castración',
            fecha: '2024-07-22T08:30:00',
            veterinario: 'Dra. Lucía Pérez',
            motivo: 'Procedimiento de castración programado',
            diagnostico: 'Paciente apto para cirugía. Exámenes prequirúrgicos normales.',
            tratamiento: 'Castración realizada con éxito. Antibióticos y analgésicos postoperatorios.',
            observaciones: 'Recuperación sin complicaciones. Control en 7 días para retiro de puntos.',
          },
          {
            tipo: 'Control post-operatorio',
            fecha: '2024-07-29T10:00:00',
            veterinario: 'Dra. Lucía Pérez',
            motivo: 'Control post-cirugía y retiro de puntos',
            diagnostico: 'Cicatrización completa. Sin signos de infección.',
            tratamiento: 'Retiro de puntos. Continuar con collar isabelino por 2 días más.',
            observaciones: 'Recuperación exitosa. Mascota en perfecto estado.',
          },
        ],
      };
    }
  }

  // Historia clínica para la primera mascota del tercer usuario (si existe)
  if (demoUsers.length > 2) {
    const pet3 = getPetFromUser(demoUsers[2], 0);
    if (pet3) {
      historias[pet3.id] = {
        fechaPrimeraConsulta: '2023-11-05T15:00:00',
        veterinarioPrincipal: 'Dr. Martín Rivas',
        sucursalPrincipal: 'Vettix Núñez',
        consultas: [
          {
            tipo: 'Consulta cardiológica',
            fecha: '2023-11-05T15:00:00',
            veterinario: 'Dr. Martín Rivas',
            motivo: 'Soplo cardíaco detectado en examen rutinario',
            diagnostico: 'Soplo cardíaco grado II/VI. Requiere seguimiento cardiológico.',
            tratamiento: 'Ecocardiograma realizado. Medicación cardíaca preventiva.',
            observaciones: 'Paciente estable. Control cada 6 meses para monitoreo.',
          },
          {
            tipo: 'Control cardiológico',
            fecha: '2024-05-12T16:00:00',
            veterinario: 'Dr. Martín Rivas',
            motivo: 'Control semestral de cardiopatía',
            diagnostico: 'Soplo estable. Función cardíaca dentro de parámetros normales.',
            tratamiento: 'Continuar con medicación actual. Ajuste de dosis según peso.',
            observaciones: 'Paciente responde bien al tratamiento. Sin cambios significativos.',
          },
          {
            tipo: 'Consulta de rutina',
            fecha: '2024-08-20T10:30:00',
            veterinario: 'Dr. Martín Rivas',
            motivo: 'Control general y vacunación anual',
            diagnostico: 'Estado general bueno. Cardiopatía controlada.',
            tratamiento: 'Vacunación anual. Refuerzo de medicación cardíaca.',
            observaciones: 'Mascota estable. Mantener dieta baja en sodio.',
            vacunas: ['Antirrábica', 'Sextuple'],
          },
        ],
      };
    }
  }

  return historias;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminHistoriasClinicas = () => {
  const navigate = useNavigate();

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

  const [selectedUserId, setSelectedUserId] = useState(() => (demoUsers[0]?.id ? String(demoUsers[0].id) : ''));

  // Cargar historias clínicas de ejemplo al montar el componente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORIAS_CLINICAS_KEY);
      if (!stored) {
        // Si no hay historias guardadas, generar las de ejemplo
        const historiasSeed = generateHistoriasClinicasSeed(demoUsers);
        if (Object.keys(historiasSeed).length > 0) {
          saveHistoriasClinicas(historiasSeed);
        }
      } else {
        // Si ya hay historias, verificar si necesitamos agregar más
        const parsed = JSON.parse(stored);
        const historiasSeed = generateHistoriasClinicasSeed(demoUsers);
        // Fusionar las historias existentes con las nuevas (sin sobrescribir)
        const merged = { ...parsed, ...historiasSeed };
        saveHistoriasClinicas(merged);
      }
    } catch (error) {
      console.error('Error al inicializar historias clínicas', error);
    }
  }, [demoUsers]);

  useEffect(() => {
    if (!selectedUserId && demoUsers.length > 0) {
      setSelectedUserId(String(demoUsers[0].id));
    }
  }, [demoUsers, selectedUserId]);

  const selectedUser = useMemo(
    () => demoUsers.find((user) => String(user.id) === String(selectedUserId)) || null,
    [demoUsers, selectedUserId]
  );

  const [mascotasCliente, setMascotasCliente] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState('');

  useEffect(() => {
    setMascotasCliente([]);
    setMascotaSeleccionada('');
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

  const historiaClinica = useMemo(() => {
    if (!mascotaActiva) return null;
    return loadHistoriaClinica(mascotaActiva.id);
  }, [mascotaActiva]);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const generarContenidoHistoriaClinica = () => {
    if (!mascotaActiva || !historiaClinica) return '';

    let contenido = `HISTORIA CLÍNICA - ${mascotaActiva.name.toUpperCase()}\n`;
    contenido += `========================================\n\n`;

    contenido += `INFORMACIÓN DEL PACIENTE:\n`;
    contenido += `Nombre: ${mascotaActiva.name}\n`;
    contenido += `Especie: ${speciesLabels[mascotaActiva.species] || speciesLabels.other}\n`;
    if (mascotaActiva.breed) contenido += `Raza/Tipo: ${mascotaActiva.breed}\n`;
    if (mascotaActiva.age) contenido += `Edad: ${mascotaActiva.age} ${Number(mascotaActiva.age) === 1 ? 'año' : 'años'}\n`;
    if (mascotaActiva.weight) contenido += `Peso: ${mascotaActiva.weight} kg\n`;
    contenido += `\n`;

    contenido += `INFORMACIÓN GENERAL:\n`;
    contenido += `Fecha de primera consulta: ${formatDate(historiaClinica.fechaPrimeraConsulta)}\n`;
    if (historiaClinica.veterinarioPrincipal) {
      contenido += `Veterinario principal: ${historiaClinica.veterinarioPrincipal}\n`;
    }
    if (historiaClinica.sucursalPrincipal) {
      contenido += `Sucursal principal: ${historiaClinica.sucursalPrincipal}\n`;
    }
    contenido += `\n`;

    if (historiaClinica.consultas && historiaClinica.consultas.length > 0) {
      contenido += `CONSULTAS Y ATENCIONES:\n`;
      contenido += `========================================\n\n`;

      historiaClinica.consultas.forEach((consulta, index) => {
        contenido += `Consulta ${index + 1}: ${consulta.tipo || 'Consulta general'}\n`;
        contenido += `Fecha: ${formatDateTime(consulta.fecha)}\n`;
        if (consulta.veterinario) contenido += `Veterinario: ${consulta.veterinario}\n`;
        contenido += `\n`;

        if (consulta.motivo) {
          contenido += `Motivo de consulta: ${consulta.motivo}\n`;
        }
        if (consulta.diagnostico) {
          contenido += `Diagnóstico: ${consulta.diagnostico}\n`;
        }
        if (consulta.tratamiento) {
          contenido += `Tratamiento: ${consulta.tratamiento}\n`;
        }
        if (consulta.observaciones) {
          contenido += `Observaciones: ${consulta.observaciones}\n`;
        }
        if (consulta.vacunas && consulta.vacunas.length > 0) {
          contenido += `Vacunas aplicadas: ${consulta.vacunas.join(', ')}\n`;
        }
        contenido += `\n${'='.repeat(40)}\n\n`;
      });
    }

    contenido += `\nGenerado el ${new Date().toLocaleDateString('es-AR')} desde Vettix\n`;

    return contenido;
  };

  const handleImprimir = () => {
    if (!mascotaActiva || !historiaClinica) return;

    const contenido = document.getElementById('historia-clinica-print');
    if (!contenido) return;

    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Historia Clínica - ${mascotaActiva.name}</title>
          <style>
            @page {
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #3d407d;
              border-bottom: 3px solid #65ccec;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #3d407d;
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 16pt;
            }
            h3 {
              color: #65ccec;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 14pt;
            }
            .header-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .consulta-print {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
              page-break-inside: avoid;
            }
            .consulta-header-print {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            strong {
              color: #3d407d;
            }
            ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 10pt;
              color: #666;
              text-align: center;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${contenido.innerHTML}
          <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString('es-AR')} desde Vettix</p>
          </div>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    setTimeout(() => {
      ventanaImpresion.print();
    }, 250);
  };

  const handleEnviarEmail = () => {
    if (!mascotaActiva || !historiaClinica) return;
    setEmailAddress(selectedUser?.email || '');
    setShowEmailModal(true);
  };

  const confirmarEnvioEmail = () => {
    if (!emailAddress.trim()) {
      alert('Por favor, ingresá una dirección de email válida.');
      return;
    }

    const contenido = generarContenidoHistoriaClinica();
    const asunto = encodeURIComponent(`Historia Clínica - ${mascotaActiva.name}`);
    const cuerpo = encodeURIComponent(contenido);

    const mailtoLink = `mailto:${emailAddress}?subject=${asunto}&body=${cuerpo}`;
    window.location.href = mailtoLink;

    setShowEmailModal(false);
    setEmailAddress('');
  };

  return (
    <div className="admin-page">
      <Helmet>
        <title>Historias Clínicas | Admin Vettix</title>
        <meta
          name="description"
          content="Panel administrativo para consultar y gestionar las historias clínicas de los pacientes de Vettix."
        />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content admin-historias">
        <section className="admin-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Historias Clínicas</span>
            <h1>Historial Médico de Pacientes</h1>
            <p>
              Consultá y gestioná el historial médico completo de cada paciente. Accedé a consultas previas,
              diagnósticos, tratamientos y seguimientos registrados en el sistema.
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
        </div>

        <section className="selection-panel" style={{marginTop: "2rem"}}>
          <header className="selection-header">
            <h2>Seleccioná el cliente</h2>
            <p>Elegí un cliente para ver las mascotas asociadas y acceder a sus historias clínicas.</p>
          </header>
          <div className="select-row">
            <div className="select-field">
              <label htmlFor="cliente-hc">Cliente</label>
              <select
                id="cliente-hc"
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
          {demoUsers.length === 0 && (
            <p className="form-feedback error">No se pudieron cargar los clientes.</p>
          )}
        </section>

        {selectedUser && (
          <section className="selection-panel" style={{marginTop: "2rem"}}>
            <header className="selection-header">
              <h2>Seleccioná la mascota</h2>
              <p>Elegí la mascota del cliente para visualizar su historia clínica completa.</p>
            </header>
            {mascotasCliente.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-paw"></i>
                <h3>Sin mascotas registradas</h3>
                <p>Este cliente no tiene mascotas registradas en el sistema.</p>
              </div>
            ) : (
              <>
                <div className="select-row">
                  <div className="select-field">
                    <label htmlFor="mascota-hc">Mascota</label>
                    <select
                      id="mascota-hc"
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
        )}

        {mascotaActiva && (
          <section className="historia-clinica-section">
            <header className="historia-section-header">
              <div className="historia-header-content">
                <div className="historia-header-text">
                  <h2>Historia Clínica de {mascotaActiva.name}</h2>
                  <p>Registro completo de consultas, diagnósticos y tratamientos.</p>
                </div>
                {historiaClinica && (
                  <div className="historia-actions">
                    <button
                      type="button"
                      className="btn-action btn-print"
                      onClick={handleImprimir}
                      title="Imprimir historia clínica"
                    >
                      <i className="fa-solid fa-print"></i>
                      Imprimir
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-email"
                      onClick={handleEnviarEmail}
                      title="Enviar por email"
                    >
                      <i className="fa-solid fa-envelope"></i>
                      <span>Enviar email</span>
                    </button>
                  </div>
                )}
              </div>
            </header>

            {historiaClinica ? (
              <>
                <div className="historia-clinica-content">
                <div id="historia-clinica-print" className="print-content">
                  <h1>Historia Clínica - {mascotaActiva.name}</h1>
                  
                  <div className="header-info">
                    <h2>Información del Paciente</h2>
                    <p><strong>Nombre:</strong> {mascotaActiva.name}</p>
                    <p><strong>Especie:</strong> {speciesLabels[mascotaActiva.species] || speciesLabels.other}</p>
                    {mascotaActiva.breed && <p><strong>Raza/Tipo:</strong> {mascotaActiva.breed}</p>}
                    {mascotaActiva.age && (
                      <p><strong>Edad:</strong> {mascotaActiva.age} {Number(mascotaActiva.age) === 1 ? 'año' : 'años'}</p>
                    )}
                    {mascotaActiva.weight && <p><strong>Peso:</strong> {mascotaActiva.weight} kg</p>}
                  </div>

                  <div className="historia-info-print">
                    <h2>Información General</h2>
                    <p><strong>Fecha de primera consulta:</strong> {formatDate(historiaClinica.fechaPrimeraConsulta)}</p>
                    {historiaClinica.veterinarioPrincipal && (
                      <p><strong>Veterinario principal:</strong> {historiaClinica.veterinarioPrincipal}</p>
                    )}
                    {historiaClinica.sucursalPrincipal && (
                      <p><strong>Sucursal principal:</strong> {historiaClinica.sucursalPrincipal}</p>
                    )}
                  </div>

                  <div className="historia-clinica-header">
                    <div className="historia-info">
                      <h3>Información General</h3>
                      <ul>
                        <li>
                          <strong>Fecha de primera consulta:</strong>{' '}
                          {formatDate(historiaClinica.fechaPrimeraConsulta)}
                        </li>
                        {historiaClinica.veterinarioPrincipal && (
                          <li>
                            <strong>Veterinario principal:</strong> {historiaClinica.veterinarioPrincipal}
                          </li>
                        )}
                        {historiaClinica.sucursalPrincipal && (
                          <li>
                            <strong>Sucursal principal:</strong> {historiaClinica.sucursalPrincipal}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {historiaClinica.consultas && historiaClinica.consultas.length > 0 && (
                    <div className="consultas-print">
                      <h2>Consultas y Atenciones</h2>
                      {historiaClinica.consultas.map((consulta, index) => (
                        <div key={index} className="consulta-print">
                          <div className="consulta-header-print">
                            <div>
                              <h3>{consulta.tipo || 'Consulta general'}</h3>
                              <p>{formatDateTime(consulta.fecha)}</p>
                            </div>
                            {consulta.veterinario && <p><strong>{consulta.veterinario}</strong></p>}
                          </div>
                          {consulta.motivo && (
                            <p><strong>Motivo de consulta:</strong> {consulta.motivo}</p>
                          )}
                          {consulta.diagnostico && (
                            <p><strong>Diagnóstico:</strong> {consulta.diagnostico}</p>
                          )}
                          {consulta.tratamiento && (
                            <p><strong>Tratamiento:</strong> {consulta.tratamiento}</p>
                          )}
                          {consulta.observaciones && (
                            <p><strong>Observaciones:</strong> {consulta.observaciones}</p>
                          )}
                          {consulta.vacunas && consulta.vacunas.length > 0 && (
                            <div>
                              <strong>Vacunas aplicadas:</strong>
                              <ul>
                                {consulta.vacunas.map((vacuna, vIndex) => (
                                  <li key={vIndex}>{vacuna}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {historiaClinica.consultas && historiaClinica.consultas.length > 0 && (
                  <div className="consultas-section">
                    <h3>Consultas y Atenciones</h3>
                    <div className="consultas-list">
                      {historiaClinica.consultas.map((consulta, index) => (
                        <article key={index} className="consulta-card">
                          <div className="consulta-header">
                            <div>
                              <h4>{consulta.tipo || 'Consulta general'}</h4>
                              <span className="consulta-date">
                                {formatDateTime(consulta.fecha)}
                              </span>
                            </div>
                            {consulta.veterinario && (
                              <span className="consulta-vet">{consulta.veterinario}</span>
                            )}
                          </div>
                          {consulta.motivo && (
                            <div className="consulta-field">
                              <strong>Motivo de consulta:</strong> {consulta.motivo}
                            </div>
                          )}
                          {consulta.diagnostico && (
                            <div className="consulta-field">
                              <strong>Diagnóstico:</strong> {consulta.diagnostico}
                            </div>
                          )}
                          {consulta.tratamiento && (
                            <div className="consulta-field">
                              <strong>Tratamiento:</strong> {consulta.tratamiento}
                            </div>
                          )}
                          {consulta.observaciones && (
                            <div className="consulta-field">
                              <strong>Observaciones:</strong> {consulta.observaciones}
                            </div>
                          )}
                          {consulta.vacunas && consulta.vacunas.length > 0 && (
                            <div className="consulta-field">
                              <strong>Vacunas aplicadas:</strong>
                              <ul className="vacunas-list">
                                {consulta.vacunas.map((vacuna, vIndex) => (
                                  <li key={vIndex}>{vacuna}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {(!historiaClinica.consultas || historiaClinica.consultas.length === 0) && (
                  <div className="empty-state">
                    <i className="fa-solid fa-file-medical"></i>
                    <h3>Sin consultas registradas</h3>
                    <p>Esta mascota aún no tiene consultas registradas en su historia clínica.</p>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-file-medical"></i>
                <h3>Historia clínica vacía</h3>
                <p>Esta mascota aún no tiene una historia clínica registrada en el sistema.</p>
              </div>
            )}
          </section>
        )}

        {showEmailModal && (
          <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Enviar Historia Clínica por Email</h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowEmailModal(false)}
                  aria-label="Cerrar"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>Se enviará la historia clínica de <strong>{mascotaActiva?.name}</strong> a la siguiente dirección:</p>
                <div className="form-group">
                  <label htmlFor="email-address">Dirección de email</label>
                  <input
                    id="email-address"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="ejemplo@email.com"
                    autoFocus
                  />
                </div>
                <p className="modal-note">
                  <i className="fa-solid fa-info-circle"></i>
                  Se abrirá tu cliente de email predeterminado con la historia clínica adjunta.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={confirmarEnvioEmail}
                >
                  <i className="fa-solid fa-envelope"></i>
                  Enviar
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

export default AdminHistoriasClinicas;

