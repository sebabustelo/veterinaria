import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function normalizarRoles(usuario) {
    if (!usuario) return { roles: [], roleNames: [] };

    const roles = Array.isArray(usuario.roles) ? usuario.roles : [];
    const roleNames = Array.isArray(usuario.roleNames) ? usuario.roleNames : [];

    if (roleNames.length > 0) {
        return {
            roles,
            roleNames: roleNames.map((name) => String(name || '').toLowerCase())
        };
    }

    const normalizados = roles.map((role) => {
        if (typeof role === 'string') {
            const normalized = role.toLowerCase();
            return { name: normalized, id: normalized, display_name: role };
        }
        if (role && typeof role === 'object') {
            const normalized = String(role.name || role.id || '').toLowerCase();
            return { ...role, name: normalized };
        }
        return { name: '' };
    });

    return {
        roles: normalizados,
        roleNames: normalizados.map((role) => role.name)
    };
}

function RutasProtegidas({ isAuthenticated, roles = [], children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ textAlign: "center", margin: "2rem 0" }}>
                <p>Verificando acceso...</p>
            </div>
        );
    }

    const estaAutenticado = Boolean(
        isAuthenticated ?? (user && Object.keys(user).length > 0)
    );

    if (!estaAutenticado) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0) {
        const { roleNames } = normalizarRoles(user);
        const rolesRequeridos = roles.map((role) => String(role || '').toLowerCase());
        const tieneRol = roleNames.some((role) => rolesRequeridos.includes(role));

        if (!tieneRol) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}

export default RutasProtegidas;