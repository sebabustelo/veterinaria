import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';

const UsersContext = createContext();

export const useUsers = () => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error('useUsers must be used within a UsersProvider');
    }
    return context;
};

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setUsers(data.data); // Solo el array de usuarios
            setError(null);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = async (userId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found');
            return false;
        }

        try {
            const cleanToken = token.trim();
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete user: ${response.status} - ${errorText}`);
            }

            setUsers(users.filter(user => user.id !== userId));
            return true;
        } catch (err) {
            setError(err.message);
            console.error('Error deleting user:', err);
            if (err.message.includes('token no es válido')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return false;
        }
    };

    // Only fetch users when on the users or admin page
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const value = {
        users,
        loading,
        error,
        fetchUsers,
        deleteUser
    };

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    );
};

export default UsersContext;