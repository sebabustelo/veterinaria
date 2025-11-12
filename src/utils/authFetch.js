// authFetch.js
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('tokenExpired'));
    window.location.href = '/login'; // Redirige a /login
    return;
  }

  return response;
}; 