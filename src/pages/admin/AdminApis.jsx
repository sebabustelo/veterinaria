import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/apiConfig';
import HeaderAdmin from '../../components/estaticos/HeaderAdmin';
import Footer from '../../components/estaticos/Footer';
import loading_img from '../../assets/loading.gif'
import './Users.css';

const AdminApis = () => {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApi, setSelectedApi] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [filteredApis, setFilteredApis] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [_error, setError] = useState(null);
    const [apiData, setApiData] = useState({
        endpoint: '',
        description: '',
        hidden: false,
        public: false,
        tipo: 'GET'
    });
    const [syncLoading, setSyncLoading] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncMissing, setSyncMissing] = useState([]);
    const [syncSelected, setSyncSelected] = useState([]);
    const [syncSuccess, setSyncSuccess] = useState("");

    // Estado para controlar qué grupos están abiertos
    const [openGroups, setOpenGroups] = useState(() => {
        const initial = {};
        const { sortedCategories } = groupAndSortApis(filteredApis);
        sortedCategories.forEach(cat => { initial[cat] = true; });
        return initial;
    });

    // Función para verificar el token
    const checkToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/check`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Error verificando token:', error);
            return false;
        }
    };

    useEffect(() => {
        const fetchApis = async () => {
            try {
                // Verificar si el usuario está logueado
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No hay token de autenticación. Por favor, inicie sesión.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/apis`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                setApis(data);
                setFilteredApis(data);
            } catch (err) {
                console.error('Error al obtener APIs:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchApis();
    }, []);

    // Función para filtrar APIs
    useEffect(() => {
        const filtered = apis.filter(api => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                (api.endpoint || '').toLowerCase().includes(searchTermLower) ||
                (api.description || '').toLowerCase().includes(searchTermLower)
            );
        });
        setFilteredApis(filtered);
    }, [searchTerm, apis]);

    // Función para truncar texto
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handleDelete = async (apiId) => {
        // Verificar token antes de proceder
        const tokenValid = await checkToken();
        if (!tokenValid) {
            alert('Token de autenticación inválido o expirado. Por favor, inicie sesión nuevamente.');
            return;
        }

        if (window.confirm('¿Estás seguro de que deseas eliminar esta API?')) {
            try {
                setLoading(true);

                const token = localStorage.getItem('token');
                console.log('Token para eliminar:', token ? 'Presente' : 'No encontrado');
                const response = await fetch(`${API_BASE_URL}/apis/${apiId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                // Eliminar la API de la lista local
                setApis(prevApis =>
                    prevApis.filter(api => api.ID !== apiId)
                );

                alert('API eliminada correctamente');

            } catch (error) {
                console.error('Error al eliminar API:', error);
                alert(`Error al eliminar API: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar token antes de proceder
        const tokenValid = await checkToken();
        if (!tokenValid) {
            alert('Token de autenticación inválido o expirado. Por favor, inicie sesión nuevamente.');
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('token');
            const apiDataToSend = {
                endpoint: apiData.endpoint,
                description: apiData.description,
                hidden: apiData.hidden,
                public: apiData.public,
                tipo: apiData.tipo
            };

            let response;
            let result;

            if (isEditing && selectedApi) {
                // Editar API existente
                const url = `${API_BASE_URL}/apis/${selectedApi.ID}`;
                console.log('Editando API en URL:', url);
                console.log(apiDataToSend);
                console.log('Token:', token ? 'Presente' : 'No encontrado');

                response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(apiDataToSend)
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                result = await response.json();

                // Actualizar la lista de APIs
                setApis(prevApis =>
                    prevApis.map(api =>
                        api.ID === selectedApi.ID ? result : api
                    )
                );

                // Refresca la lista de roles desde el backend
                const rolesResponse = await fetch(`${API_BASE_URL}/roles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (rolesResponse.ok) {
                    const rolesData = await rolesResponse.json();
                    const normalizedRoles = rolesData.map(role => ({
                        id: role.ID,
                        name: role.name,
                        description: role.description,
                        apis: (role.Apis || []).map(api => ({
                            id: api.ID || api.id,
                            endpoint: api.endpoint,
                            description: api.description
                        })),
                        users: (role.Users || []).map(user => ({
                            id: user.ID,
                            name: user.name,
                            email: user.email
                        }))
                    }));
                    setApis(normalizedRoles);
                    setFilteredApis(normalizedRoles);
                }

                alert('APIs del rol actualizadas correctamente');
            } else {
                // Crear nueva API
                const url = `${API_BASE_URL}/apis`;
                console.log('Creando API en URL:', url);
                console.log('Datos a enviar:', apiDataToSend);
                console.log('Token:', token ? 'Presente' : 'No encontrado');

                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(apiDataToSend)
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                result = await response.json();

                // Agregar la nueva API a la lista
                setApis(prevApis => [...prevApis, result]);

                alert('API creada correctamente');
            }

            setShowModal(false);
            setSelectedApi(null);
            setApiData({
                endpoint: '',
                description: '',
                hidden: false,
                public: false,
                tipo: 'GET'
            });
            setIsEditing(false);

        } catch (error) {
            console.error('Error al procesar API:', error);
            alert(`Error al procesar API: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncApis = async () => {
        setSyncLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/apis/sync`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.missing && data.missing.length > 0) {
                setSyncMissing(data.missing);
                setSyncSelected(data.missing); // Por defecto, todas seleccionadas
                setShowSyncModal(true);
            } else {
                alert('No hay endpoints faltantes. Todo está sincronizado.');
            }
        } catch {
            alert('Error al sincronizar APIs');
        } finally {
            setSyncLoading(false);
        }
    };

    const handleAddSelectedApis = async () => {
        if (syncSelected.length === 0) {
            alert('Selecciona al menos una API para agregar.');
            return;
        }
        setSyncLoading(true);
        try {
            const token = localStorage.getItem('token');
            const addResp = await fetch(`${API_BASE_URL}/apis/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ endpoints: syncSelected })
            });
            const addData = await addResp.json();
            setSyncSuccess(`Agregados: ${addData.added.join(', ')}`);
            setTimeout(() => {
                setShowSyncModal(false);
                setSyncMissing([]);
                setSyncSelected([]);
                setSyncSuccess("");
                window.location.reload();
            }, 1500);
        } catch {
            alert('Error al agregar APIs');
        } finally {
            setSyncLoading(false);
        }
    };

    // Agrupa y ordena las APIs por la primera parte del endpoint
    function groupAndSortApis(apis) {
        const groups = {};
        apis.forEach(api => {
            const match = (api.endpoint || '').match(/^\/([^/]+)/);
            const category = match ? match[1] : 'otros';
            if (!groups[category]) groups[category] = [];
            groups[category].push(api);
        });
        // Ordena los grupos alfabéticamente
        const sortedCategories = Object.keys(groups).sort();
        // Ordena los endpoints dentro de cada grupo
        sortedCategories.forEach(cat => {
            groups[cat].sort((a, b) => (a.endpoint || '').localeCompare(b.endpoint || ''));
        });
        return { groups, sortedCategories };
    }

    // <-- AQUI: Defino las variables antes del return
    const { groups, sortedCategories } = groupAndSortApis(filteredApis);

    return (
        <>
            <div className="admin-page">
                <HeaderAdmin />
                <main className="main-content">
                    <div className="header-container">
                        <h1 className="main-title">
                            <i className="fa-solid fa-code" style={{ marginRight: "0.5em" }}></i>
                            APIs
                        </h1>

                        <div className="header-buttons">
                            <button
                                className="add-button"
                                onClick={() => {
                                    setSelectedApi(null);
                                    setApiData({
                                        endpoint: '',
                                        description: '',
                                        hidden: false,
                                        public: false,
                                        tipo: 'GET'
                                    });
                                    setIsEditing(false);
                                    setShowModal(true);
                                }}
                            >
                                <i className="fa-solid fa-plus"></i>
                                Nueva API
                            </button>
                            <button
                                className="sync-button add-button"
                                onClick={handleSyncApis}
                               
                                disabled={syncLoading}
                            >
                                <i className="fa-solid fa-arrows-rotate"></i>
                                {syncLoading ? 'Sincronizando...' : 'Sincronizar APIs'}
                            </button>
                            <Link to="/admin" className="back-button">
                                <i className="fa-solid fa-arrow-left"></i>
                                Volver al Admin
                            </Link>
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="search-container">
                        <div className="search-box">
                            <i className="fa-solid fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Buscar APIs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            {searchTerm && (
                                <button
                                    className="clear-search"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <img src={loading_img} alt="Cargando..." className="loading-img" />
                    ) : (
                        <div className="users-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Endpoint</th>
                                        <th>Método</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center' }}>
                                                {searchTerm ? 'No se encontraron APIs' : 'No hay APIs disponibles'}
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedCategories.map(category => [
                                            <tr key={category + '-header'}>
                                                <td colSpan="5" style={{ background: '#f5f7fa', fontWeight: 700, color: '#2E8B57', fontSize: '1.05em', borderTop: '2px solid #e0e0e0', cursor: 'pointer', userSelect: 'none' }}
                                                    onClick={() => setOpenGroups(prev => ({ ...prev, [category]: !prev[category] }))}>
                                                    <span style={{ marginRight: 8, fontWeight: 900, fontSize: '1.1em', display: 'inline-block', transition: 'transform 0.2s', transform: openGroups[category] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                        ▶
                                                    </span>
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </td>
                                            </tr>,
                                            openGroups[category] && groups[category].map((api, idx) => (
                                                <tr key={api.ID || api.endpoint || idx}>
                                                    <td>{api.endpoint}</td>
                                                    <td>{api.tipo || api.Tipo}</td>
                                                    <td className="description-cell" title={api.description}>
                                                        {truncateText(api.description)}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            {api.hidden && (
                                                                <span className="role-badge" style={{ backgroundColor: '#ff9800' }}>
                                                                    Oculto
                                                                </span>
                                                            )}
                                                            {api.public && (
                                                                <span className="role-badge" style={{ backgroundColor: '#4caf50' }}>
                                                                    Público
                                                                </span>
                                                            )}
                                                            {!api.hidden && !api.public && (
                                                                <span className="role-badge" style={{ backgroundColor: '#2196f3' }}>
                                                                    Privado
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="action-button edit-button icon-button"
                                                                onClick={() => {
                                                                    setSelectedApi(api);
                                                                    setApiData({
                                                                        endpoint: api.endpoint || '',
                                                                        description: api.description || '',
                                                                        hidden: api.hidden || false,
                                                                        public: api.public || false,
                                                                        tipo: api.tipo || api.Tipo || 'GET'
                                                                    });
                                                                    setIsEditing(true);
                                                                    setShowModal(true);
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-pen-to-square"></i>
                                                            </button>
                                                            <button
                                                                className="action-button delete-button icon-button"
                                                                onClick={() => handleDelete(api.ID)}
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ])
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            Total de APIs: {filteredApis.length}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            {showModal && (
                                <div className="modal">
                                    <div className="modal-content">
                                        <h2>{isEditing ? 'Editar API' : 'Nueva API'}</h2>
                                        <form onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <label htmlFor="endpoint">Endpoint *</label>
                                                <input
                                                    type="text"
                                                    id="endpoint"
                                                    className="form-control"
                                                    value={apiData.endpoint}
                                                    onChange={(e) => setApiData({ ...apiData, endpoint: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="tipo">Método HTTP *</label>
                                                <select
                                                    id="tipo"
                                                    className="form-control"
                                                    value={apiData.tipo || 'GET'}
                                                    onChange={e => setApiData({ ...apiData, tipo: e.target.value })}
                                                    required
                                                >
                                                    <option value="GET">GET</option>
                                                    <option value="POST">POST</option>
                                                    <option value="PUT">PUT</option>
                                                    <option value="DELETE">DELETE</option>
                                                    <option value="PATCH">PATCH</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="description">Descripción</label>
                                                <textarea
                                                    id="description"
                                                    className="form-control"
                                                    value={apiData.description}
                                                    onChange={(e) => setApiData({ ...apiData, description: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={apiData.hidden}
                                                        onChange={(e) => setApiData({ ...apiData, hidden: e.target.checked })}
                                                    />
                                                    Oculto
                                                </label>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={apiData.public}
                                                        onChange={(e) => setApiData({ ...apiData, public: e.target.checked })}
                                                    />
                                                    Público
                                                </label>
                                            </div>
                                            <div className="modal-buttons">
                                                <button
                                                    type="button"
                                                    className="cancel-button"
                                                    onClick={() => setShowModal(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="save-button"
                                                >
                                                    Guardar
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {showSyncModal && (
                        <div className="modal" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="modal-content" style={{ maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', borderRadius: 8, padding: 24, margin: 16 }}>
                                <h2 style={{ marginTop: 0 }}>Selecciona las APIs a agregar</h2>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                    <button
                                        className="save-button"
                                        style={{ padding: '0.25em 0.75em' }}
                                        onClick={() => setSyncSelected(syncMissing)}
                                        type="button"
                                    >
                                        Seleccionar todas
                                    </button>
                                    <button
                                        className="cancel-button"
                                        style={{ padding: '0.25em 0.75em' }}
                                        onClick={() => setSyncSelected([])}
                                        type="button"
                                    >
                                        Ninguna
                                    </button>
                                </div>
                                <div style={{ maxHeight: 250, overflowY: 'auto', marginBottom: 16 }}>
                                    {syncMissing.map((ep) => (
                                        <label
                                            key={ep}
                                            style={{
                                                display: 'block',
                                                marginBottom: 8,
                                                background: syncSelected.includes(ep) ? '#e3f2fd' : 'transparent',
                                                borderRadius: 4,
                                                padding: '2px 6px'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={syncSelected.includes(ep)}
                                                onChange={() => {
                                                    setSyncSelected((prev) =>
                                                        prev.includes(ep)
                                                            ? prev.filter((e) => e !== ep)
                                                            : [...prev, ep]
                                                    );
                                                }}
                                            />
                                            <span style={{ marginLeft: 8 }}>{ep}</span>
                                        </label>
                                    ))}
                                </div>
                                {syncSuccess && (
                                    <div style={{ color: '#388e3c', fontWeight: 600, marginBottom: 12 }}>{syncSuccess}</div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                    <button className="cancel-button" onClick={() => setShowSyncModal(false)} disabled={syncLoading}>
                                        Cancelar
                                    </button>
                                    <button
                                        className="save-button"
                                        onClick={handleAddSelectedApis}
                                        disabled={syncLoading || syncSelected.length === 0}
                                    >
                                        {syncLoading ? 'Agregando...' : 'Agregar seleccionadas'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </>
    );
};

export default AdminApis; 