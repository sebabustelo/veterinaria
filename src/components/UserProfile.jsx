import React, { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './UserProfile.css';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const { handleDeleteCart } = useContext(CartContext);

    const handleLogout = async () => {
        try {
            // Vaciar el carrito antes de cerrar sesión
            handleDeleteCart();
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="user-profile">
            <div className="user-info">
                <div className="user-avatar">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" />
                    ) : (
                        <div className="avatar-placeholder">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="user-details">
                    <h3>{user.displayName || 'Usuario'}</h3>
                    <p>{user.email}</p>
                    <p className="user-provider">
                        Conectado con: {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 
                                      user.providerData[0]?.providerId === 'facebook.com' ? 'Facebook' : 'Email'}
                    </p>
                </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
                <i className="fa-solid fa-sign-out-alt"></i>
                Cerrar Sesión
            </button>
        </div>
    );
};

export default UserProfile; 