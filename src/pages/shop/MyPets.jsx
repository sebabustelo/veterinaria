import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/estaticos/Header';
import Footer from '@/components/estaticos/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import './MyPets.css';

const speciesOptions = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'small_mammal', label: 'Conejo / Pequeño mamífero' },
  { value: 'reptile', label: 'Reptil' },
  { value: 'other', label: 'Otra especie' },
];

const breedSuggestions = {
  dog: [
    'Mestizo',
    'Labrador Retriever',
    'Golden Retriever',
    'Caniche',
    'Bulldog Francés',
    'Pastor Alemán',
    'Beagle',
    'Border Collie',
    'Dálmata',
    'Chihuahua',
  ],
  cat: [
    'Mestizo',
    'Siames',
    'Bengalí',
    'Maine Coon',
    'Persa',
    'Angora',
    'Sphynx',
    'British Shorthair',
    'Scottish Fold',
    'Bosque de Noruega',
  ],
  bird: [
    'Periquito',
    'Canario',
    'Cacatúa',
    'Loro Amazona',
    'Ninfa',
    'Agapornis',
    'Diamante Mandarín',
    'Jilguero',
    'Cotorra',
  ],
  small_mammal: [
    'Conejo Enano',
    'Conejo Rex',
    'Hámster Sirio',
    'Hámster Ruso',
    'Cuy / Cobayo',
    'Chinchilla',
    'Hurón',
    'Degú',
  ],
  reptile: [
    'Iguana verde',
    'Gecko Leopardo',
    'Dragón barbudo',
    'Serpiente del maíz',
    'Tortuga de orejas rojas',
    'Boa constrictor',
    'Camaleón',
    'Tortuga terrestre',
  ],
};

const initialFormState = {
  name: '',
  species: '',
  breed: '',
  sex: '',
  age: '',
  weight: '',
  color: '',
  birthDate: '',
  microchip: '',
  vaccinated: false,
  dewormed: false,
  sterilized: false,
  allergies: '',
  chronicConditions: '',
  notes: '',
  photo: '',
  instagram: '',
  allowTagging: false,
};

const getAgeFromBirthDate = (birthDate) => {
  if (!birthDate) return '';
  const today = new Date();
  const birth = new Date(birthDate);
  let years = today.getFullYear() - birth.getFullYear();
  const monthsDiff = today.getMonth() - birth.getMonth();
  if (monthsDiff < 0 || (monthsDiff === 0 && today.getDate() < birth.getDate())) {
    years -= 1;
  }
  if (years < 0) {
    return '';
  }
  return years;
};

const MyPets = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');

  const storageKey = useMemo(() => {
    if (!user) return null;
    const identifier = user.id || user.user_id || user.uid || user.email;
    if (!identifier) return null;
    return `vettix_pets_${identifier}`;
  }, [user]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPets(parsed);
        }
      }
    } catch (error) {
      console.error('Error al leer mascotas guardadas', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(pets));
    } catch (error) {
      console.error('Error al guardar mascotas', error);
    }
  }, [pets, storageKey]);

  const availableBreeds = formData.species ? breedSuggestions[formData.species] || [] : [];

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    let processedValue = type === 'checkbox' ? checked : value;
    
    // Normalizar Instagram: remover @ y espacios
    if (name === 'instagram' && processedValue) {
      processedValue = processedValue.replace('@', '').trim();
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    if (name === 'birthDate') {
      const computedAge = getAgeFromBirthDate(value);
      setFormData((prev) => ({
        ...prev,
        birthDate: value,
        age: computedAge !== '' ? String(computedAge) : prev.age,
      }));
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      showError('Por favor, seleccioná un archivo de imagen válido.');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        photo: reader.result,
      }));
    };
    reader.onerror = () => {
      showError('Error al leer la imagen. Intentá nuevamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (event) => {
    event.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      photo: '',
    }));
    // Resetear el input file
    const fileInput = document.getElementById('photo');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showError('Por favor, ingresa el nombre de la mascota.');
      return;
    }
    if (!formData.species) {
      showError('Selecciona la especie de la mascota.');
      return;
    }
    if (!formData.breed.trim()) {
      showError('Indica la raza o tipo de tu mascota.');
      return;
    }

    const normalizedPet = {
      ...formData,
      id: editingId || Date.now(),
      age: formData.age ? Number(formData.age) : '',
      weight: formData.weight ? Number(formData.weight) : '',
      updatedAt: new Date().toISOString(),
      createdAt: editingId
        ? pets.find((pet) => pet.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    if (editingId) {
      setPets((prev) =>
        prev.map((pet) => (pet.id === editingId ? normalizedPet : pet))
      );
      showSuccess('Mascota actualizada correctamente.');
    } else {
      setPets((prev) => [normalizedPet, ...prev]);
      showSuccess('Mascota agregada correctamente.');
    }

    resetForm();
  };

  const handleEdit = (pet) => {
    setFormData({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      sex: pet.sex || '',
      age: pet.age !== undefined && pet.age !== null && pet.age !== '' ? String(pet.age) : '',
      weight: pet.weight !== undefined && pet.weight !== null && pet.weight !== '' ? String(pet.weight) : '',
      color: pet.color || '',
      birthDate: pet.birthDate || '',
      microchip: pet.microchip || '',
      vaccinated: Boolean(pet.vaccinated),
      dewormed: Boolean(pet.dewormed),
      sterilized: Boolean(pet.sterilized),
      allergies: pet.allergies || '',
      chronicConditions: pet.chronicConditions || '',
      notes: pet.notes || '',
      photo: pet.photo || '',
    });
    setEditingId(pet.id);
    showInfo(`Editando la ficha de ${pet.name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (petId) => {
    const target = pets.find((pet) => pet.id === petId);
    if (!target) return;
    const confirmed = window.confirm(
      `¿Confirmás que querés eliminar a ${target.name} de tus mascotas?`
    );
    if (!confirmed) return;
    setPets((prev) => prev.filter((pet) => pet.id !== petId));
    showSuccess(`${target.name} se eliminó de tu lista.`);
    if (editingId === petId) {
      resetForm();
    }
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSpecies = filterSpecies === 'all' || pet.species === filterSpecies;
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return matchesSpecies;
    const haystack = [
      pet.name,
      pet.breed,
      pet.color,
      pet.microchip,
      pet.notes,
      pet.allergies,
      pet.chronicConditions,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
      .join(' ');

    return matchesSpecies && haystack.includes(normalizedSearch);
  });

  return (
    <>
      <Header />
      <main className="main-content">
        <section className="pets-hero">
          <div>
            <span className="hero-tag">Historial clínico personal</span>
            <h1>Mis Mascotas</h1>
            <p>
              Creá y administrá las fichas de todas tus mascotas. Registrá datos clínicos,
              recordatorios y preferencias para que nuestro equipo pueda brindarles una
              atención personalizada.
            </p>
          </div>

        </section>
        <br />
        <section className="pets-wrapper">
          <div className="pets-form-card">
            <div className="form-header">
              <h2>{editingId ? 'Editar mascota' : 'Agregar nueva mascota'}</h2>
              {editingId && (
                <button type="button" className="btn-reset" onClick={resetForm}>
                  Cancelar edición
                </button>
              )}
            </div>
            <form className="pets-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  Nombre <span>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  placeholder="Ej: Lola"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="photo">Foto de la mascota</label>
                <div className="photo-upload-container">
                  {formData.photo ? (
                    <div className="photo-preview">
                      <label htmlFor="photo" className="photo-preview-label">
                        <img src={formData.photo} alt="Vista previa" />
                        <div className="photo-overlay">
                          <i className="fa-solid fa-camera"></i>
                          <span>Cambiar foto</span>
                        </div>
                      </label>
                      <button
                        type="button"
                        className="btn-remove-photo"
                        onClick={handleRemovePhoto}
                        aria-label="Eliminar foto"
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="photo" className="photo-upload-label">
                      <i className="fa-solid fa-camera"></i>
                      <span>Hacé clic para subir una foto</span>
                      <small>JPG, PNG o GIF (máx. 5MB)</small>
                    </label>
                  )}
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="species">
                    Especie <span>*</span>
                  </label>
                  <select
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleFieldChange}
                    required
                  >
                    <option value="">Seleccioná una especie</option>
                    {speciesOptions.map((species) => (
                      <option key={species.value} value={species.value}>
                        {species.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="breed">
                    Raza / Tipo <span>*</span>
                  </label>
                  <input
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleFieldChange}
                    placeholder="Ej: Mestizo"
                    list="breed-suggestions"
                    required
                  />
                  <datalist id="breed-suggestions">
                    {availableBreeds.map((breed) => (
                      <option key={breed} value={breed} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="sex">Sexo</label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleFieldChange}
                  >
                    <option value="">Seleccioná una opción</option>
                    <option value="female">Hembra</option>
                    <option value="male">Macho</option>
                    <option value="unknown">Sin definir</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="age">Edad (años)</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.age}
                    onChange={handleFieldChange}
                    placeholder="Ej: 4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Peso (kg)</label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleFieldChange}
                    placeholder="Ej: 12.5"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="birthDate">Fecha de nacimiento</label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color / Señales particulares</label>
                  <input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleFieldChange}
                    placeholder="Ej: Blanco con manchas negras"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="microchip">Microchip / Identificador</label>
                  <input
                    id="microchip"
                    name="microchip"
                    value={formData.microchip}
                    onChange={handleFieldChange}
                    placeholder="Código de microchip o chapita"
                  />
                </div>
              </div>

              <div className="form-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="vaccinated"
                    checked={formData.vaccinated}
                    onChange={handleFieldChange}
                  />
                  Vacunas al día
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="dewormed"
                    checked={formData.dewormed}
                    onChange={handleFieldChange}
                  />
                  Desparasitado
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="sterilized"
                    checked={formData.sterilized}
                    onChange={handleFieldChange}
                  />
                  Castrado / Esterilizado
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="allergies">Alergias conocidas</label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleFieldChange}
                  placeholder="Ej: alérgico a ciertos antibióticos"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="chronicConditions">Enfermedades crónicas / Tratamientos</label>
                <textarea
                  id="chronicConditions"
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleFieldChange}
                  placeholder="Ej: Hipotiroidismo, medicación diaria"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notas adicionales</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFieldChange}
                  placeholder="Preferencias de manejo, historial importante, comportamiento"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="instagram">
                  <i className="fa-brands fa-instagram"></i> Instagram de la mascota
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleFieldChange}
                  placeholder="Ej: @lola_labrador"
                />
                <small className="form-hint">Opcional: Ingresá el usuario de Instagram sin el @</small>
              </div>

              {formData.instagram && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="allowTagging"
                      checked={formData.allowTagging}
                      onChange={handleFieldChange}
                    />
                    <span>
                      <i className="fa-solid fa-check-circle"></i> Permitir que Vettix etiquete a{' '}
                      <strong>@{formData.instagram}</strong> en nuestras publicaciones
                    </span>
                  </label>
                  <small className="form-hint">
                    Podremos etiquetar a tu mascota en fotos de turnos, procedimientos o eventos especiales
                  </small>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Guardar cambios' : 'Agregar mascota'}
                </button>
              </div>
            </form>
          </div>

          <div className="pets-list-card">
            <div className="list-header">
              <div>
                <h2>Mis mascotas registradas</h2>
                <p>Organizá la información para compartirla con nuestros profesionales.</p>
              </div>
              <div className="filters">
                <div className="form-group">
                  <label htmlFor="search" className="sr-only">
                    Buscar
                  </label>
                  <input
                    id="search"
                    type="search"
                    placeholder="Buscar por nombre, raza o nota"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="filterSpecies" className="sr-only">
                    Filtrar por especie
                  </label>
                  <select
                    id="filterSpecies"
                    value={filterSpecies}
                    onChange={(event) => setFilterSpecies(event.target.value)}
                  >
                    <option value="all">Todas las especies</option>
                    {speciesOptions.map((species) => (
                      <option key={species.value} value={species.value}>
                        {species.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredPets.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-dog"></i>
                <h3>Todavía no cargaste mascotas</h3>
                <p>
                  Registralas para agilizar turnos, internaciones y recomendaciones personalizadas.
                </p>
              </div>
            ) : (
              <div className="pets-grid">
                {filteredPets.map((pet) => (
                  <article key={pet.id} className="pet-card">
                    <header className="pet-card-header">
                      <div className="pet-avatar">
                        {pet.photo ? (
                          <img src={pet.photo} alt={pet.name} />
                        ) : (
                          <span aria-hidden="true">
                            {pet.name?.charAt(0).toUpperCase() || '🐾'}
                          </span>
                        )}
                      </div>
                      <div className="pet-header-info">
                        <div className="pet-name-row">
                          <h3>{pet.name}</h3>
                          {pet.instagram && (
                            <a
                              href={`https://instagram.com/${pet.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pet-instagram-link"
                              title={`Instagram: @${pet.instagram.replace('@', '')}`}
                            >
                              <i className="fa-brands fa-instagram"></i>
                            </a>
                          )}
                        </div>
                        <p>
                          {speciesOptions.find((item) => item.value === pet.species)?.label || 'Mascota'} ·{' '}
                          {pet.breed}
                        </p>
                        {pet.instagram && pet.allowTagging && (
                          <small className="pet-tagging-badge">
                            <i className="fa-solid fa-check-circle"></i> Etiquetado permitido
                          </small>
                        )}
                      </div>
                    </header>

                    <section className="pet-details">
                      <div>
                        <strong>Edad:</strong>{' '}
                        {pet.age !== '' && pet.age !== undefined && pet.age !== null
                          ? `${pet.age} ${Number(pet.age) === 1 ? 'año' : 'años'}`
                          : 'No especificada'}
                      </div>
                      <div>
                        <strong>Peso:</strong>{' '}
                        {pet.weight
                          ? `${pet.weight} kg`
                          : 'No registrado'}
                      </div>
                      {pet.birthDate && (
                        <div>
                          <strong>Nacido el:</strong>{' '}
                          {new Date(pet.birthDate).toLocaleDateString('es-AR')}
                        </div>
                      )}
                      {pet.sex && (
                        <div>
                          <strong>Sexo:</strong>{' '}
                          {pet.sex === 'female'
                            ? 'Hembra'
                            : pet.sex === 'male'
                              ? 'Macho'
                              : 'Sin definir'}
                        </div>
                      )}
                      {pet.color && (
                        <div>
                          <strong>Color / señas:</strong> {pet.color}
                        </div>
                      )}
                      {pet.microchip && (
                        <div>
                          <strong>Identificador:</strong> {pet.microchip}
                        </div>
                      )}
                    </section>

                    <section className="pet-flags">
                      {pet.vaccinated && <span className="flag success">Vacunas al día</span>}
                      {pet.dewormed && <span className="flag success">Desparasitado</span>}
                      {pet.sterilized && <span className="flag info">Castrado</span>}
                    </section>

                    {(pet.allergies || pet.chronicConditions || pet.notes) && (
                      <section className="pet-notes">
                        {pet.allergies && (
                          <p>
                            <strong>Alergias:</strong> {pet.allergies}
                          </p>
                        )}
                        {pet.chronicConditions && (
                          <p>
                            <strong>Condiciones crónicas:</strong> {pet.chronicConditions}
                          </p>
                        )}
                        {pet.notes && (
                          <p>
                            <strong>Notas:</strong> {pet.notes}
                          </p>
                        )}
                      </section>
                    )}

                    <span className="pet-card-actions">
                      <button type="button" className="btn-link" onClick={() => handleEdit(pet)}>
                        <i className="fa-solid fa-pen-to-square"></i> Editar
                      </button>
                      <button type="button" className="btn-link danger" onClick={() => handleDelete(pet.id)}>
                        <i className="fa-solid fa-trash-can"></i> Eliminar
                      </button>
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MyPets;

