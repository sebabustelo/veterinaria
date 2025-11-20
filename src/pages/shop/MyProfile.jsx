import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/estaticos/Header';
import Footer from '@/components/estaticos/Footer';
import adminUsuariosData from '@/data/adminUsuarios.json';
import './MyProfile.css';

const MyProfile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    dni: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);

  useEffect(() => {
    if (user) {
      // Buscar datos del usuario en adminUsuarios.json
      const personas = adminUsuariosData.personas || [];
      const personaFromDB = personas.find(
        (p) => p.email?.toLowerCase() === user.email?.toLowerCase()
      );

      if (personaFromDB) {
        setUserData(personaFromDB);
        const emailValue = personaFromDB.email || user.email || '';
        setOriginalEmail(emailValue);
        setFormData({
          nombre: personaFromDB.nombre || '',
          apellido: personaFromDB.apellido || '',
          email: emailValue,
          telefono: personaFromDB.telefono || user.telefono || '',
          dni: personaFromDB.dni || '',
          direccion: personaFromDB.direccion || '',
          ciudad: personaFromDB.ciudad || '',
          codigoPostal: personaFromDB.codigoPostal || '',
        });
      } else {
        // Si no está en la base de datos, usar datos de Firebase
        const nombreCompleto = user.nombre || user.displayName || user.name || '';
        const [nombre, ...apellidoParts] = nombreCompleto.split(' ');
        const emailValue = user.email || '';
        setOriginalEmail(emailValue);
        setFormData({
          nombre: nombre || '',
          apellido: apellidoParts.join(' ') || '',
          email: emailValue,
          telefono: user.telefono || '',
          dni: '',
          direccion: '',
          ciudad: '',
          codigoPostal: '',
        });
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Detectar si el email cambió
    if (name === 'email' && value !== originalEmail) {
      setEmailChanged(true);
    } else if (name === 'email' && value === originalEmail) {
      setEmailChanged(false);
    }
  };

  const handleSave = () => {
    // Aquí puedes agregar la lógica para guardar los datos
    // Por ahora solo actualizamos el estado local
    if (!formData.nombre.trim() || !formData.email.trim()) {
      showToast('Por favor completá nombre y email', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Por favor ingresá un email válido', 'error');
      return;
    }

    // Si el email cambió, mostrar mensaje de verificación
    if (emailChanged && formData.email !== originalEmail) {
      showToast('Se enviará un código de verificación al nuevo email para validar el cambio', 'info');
      // En producción, aquí enviarías el código de verificación
      setOriginalEmail(formData.email);
      setEmailChanged(false);
    }

    // Simular guardado (en producción, aquí harías una llamada a la API)
    showToast('Datos guardados exitosamente', 'success');
    setIsEditing(false);
    // En producción, actualizarías la base de datos aquí
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (userData) {
      const emailValue = userData.email || user.email || '';
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        email: emailValue,
        telefono: userData.telefono || user.telefono || '',
        dni: userData.dni || '',
        direccion: userData.direccion || '',
        ciudad: userData.ciudad || '',
        codigoPostal: userData.codigoPostal || '',
      });
    }
    setEmailChanged(false);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="my-profile-page">
        <Header />
        <main className="main-content">
          <section className="profile-hero">
            <h1>Mi Perfil</h1>
            <p>Necesitás iniciar sesión para ver tu perfil.</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="my-profile-page">
      <Header />
      <main className="main-content">
        <section className="profile-hero">
          <div>
            <span className="hero-tag">Mi Perfil</span>
            <h1>Mis Datos</h1>
            <p>Gestioná tu información personal y de contacto.</p>
          </div>
        </section>

        <section className="profile-content">
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Información Personal</h2>
              {!isEditing && (
                <button
                  className="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fa-solid fa-pencil"></i>
                  
                </button>
              )}
            </div>

            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                {isEditing ? (
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="field-input"
                  />
                ) : (
                  <span className="info-value">{formData.nombre || '—'}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">Apellido:</span>
                {isEditing ? (
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="field-input"
                  />
                ) : (
                  <span className="info-value">{formData.apellido || '—'}</span>
                )}
              </div>

              <div className={`info-item ${emailChanged && isEditing ? 'info-item-email-changed' : ''}`}>
                <span className="info-label">Email:</span>
                {isEditing ? (
                  <div className="input-wrapper-full">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="field-input"
                    />
                    {emailChanged && (
                      <div className="email-warning">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <div>
                          <strong>Email modificado</strong>
                          <small>
                            Al guardar los cambios, se enviará un código de verificación al nuevo email ({formData.email}). 
                            Deberás ingresar el código para validar el cambio de email.
                          </small>
                        </div>
                      </div>
                    )}
                    {!emailChanged && (
                      <small className="form-hint">
                        Si modificás el email, recibirás un código de verificación para validarlo
                      </small>
                    )}
                  </div>
                ) : (
                  <span className="info-value">{formData.email || '—'}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">Teléfono:</span>
                {isEditing ? (
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="field-input"
                    placeholder="Ej: 1122334455"
                  />
                ) : (
                  <span className="info-value">{formData.telefono || '—'}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">DNI:</span>
                {isEditing ? (
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    className="field-input"
                    placeholder="Ej: 30111222"
                  />
                ) : (
                  <span className="info-value">{formData.dni || '—'}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">Dirección:</span>
                {isEditing ? (
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="field-input"
                    placeholder="Calle y número"
                  />
                ) : (
                  <span className="info-value">{formData.direccion || '—'}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">Ciudad:</span>
                {isEditing ? (
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="field-input"
                    placeholder="Ciudad"
                  />
                ) : (
                  <span className="info-value">{formData.ciudad || '—'}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">Código Postal:</span>
                {isEditing ? (
                  <input
                    type="text"
                    id="codigoPostal"
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    className="field-input"
                    placeholder="CP"
                  />
                ) : (
                  <span className="info-value">{formData.codigoPostal || '—'}</span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>

          {userData && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Información de Cuenta</h2>
              </div>
              <div className="profile-info-grid">
                <div className="info-item">
                  <span className="info-label">Tipo de usuario:</span>
                  <span className="info-value">
                    {userData.roles?.map((rol) => {
                      const roleNames = {
                        cliente: 'Cliente',
                        veterinario: 'Veterinario',
                        personal_servicio: 'Personal de Servicio',
                        usuario_sistema: 'Usuario del Sistema',
                      };
                      return roleNames[rol] || rol;
                    }).join(', ') || 'Cliente'}
                  </span>
                </div>
                {userData.matricula && (
                  <div className="info-item">
                    <span className="info-label">Matrícula:</span>
                    <span className="info-value">{userData.matricula}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Estado:</span>
                  <span className={`status-badge ${userData.activo ? 'active' : 'inactive'}`}>
                    {userData.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyProfile;

