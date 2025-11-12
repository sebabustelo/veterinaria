import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styleEstatico.css';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import Cart from '../Cart';

const Header = () => {
    const [open, setOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { user, logout } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();

    const handleToggle = () => setOpen(!open);
    const handleClose = () => setOpen(false);
    const toggleUserMenu = () => setUserMenuOpen(!isUserMenuOpen);
    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };
    const closeCart = () => {
        setIsCartOpen(false);
    };

    // Cerrar menú al hacer clic en el overlay
    const handleOverlayClick = () => {
        setOpen(false);
        setUserMenuOpen(false);
    };

    // Cerrar dropdown de usuario al hacer clic fuera
    const handleUserDropdownClose = () => {
        setUserMenuOpen(false);
    };

    const isAdmin = user && user.roles && user.roles.some(role => role.name === "admin");
    const cartItemsCount = getTotalItems();



    return (
        <>
            <header className="header">
                <nav className="nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/" className="logo-link" onClick={handleClose}>
                        <img src="/img/logo.png" alt="Logo" className="logo-img" />
                    </Link>
                    {/* Cart Icon */}

                    <Link to="#" className='nav-link cart-link icon-only' onClick={toggleCart}>
                        <i className="fa-solid fa-cart-shopping"></i>
                        {cartItemsCount > 0 && (
                            <span className="cart-badge">{cartItemsCount}</span>
                        )}
                    </Link>

                    <div className={`hamburger ${open ? 'active' : ''}`} onClick={handleToggle}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </div>

                    {/* Overlay para cerrar el menú */}
                    <div className={`nav-overlay ${open ? 'open' : ''}`} onClick={handleOverlayClick}></div>

                    {/* Overlay para cerrar el dropdown de usuario */}
                    {isUserMenuOpen && (
                        <div className="user-dropdown-overlay" onClick={handleUserDropdownClose}></div>
                    )}

                    <ul className={`nav-list ${open ? 'open' : ''}`}>
                        <li className="nav-item">
                            <Link to="/" className='nav-link' onClick={handleClose}>
                                <i className="fa-solid fa-home"></i> Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/productos" className='nav-link' onClick={handleClose}>
                                <i className="fa-solid fa-box"></i> Productos
                            </Link>
                        </li>
                        {user && (
                            <li className="nav-item">
                                <Link to="/turnos" className='nav-link' onClick={handleClose}>
                                    <i className="fa-solid fa-calendar-check"></i> Turnos
                                </Link>

                            </li>
                        )}



                        <li className="nav-item">
                            <Link to="/acercade" className='nav-link' onClick={handleClose}>
                                <i className="fa-solid fa-address-card"></i> Nosotros
                            </Link>
                        </li>




                        {/* Menú de usuario para desktop */}
                        <li className="nav-item desktop-user-menu">
                            <Link to="#" className='nav-link' onClick={toggleUserMenu}>
                                <i className="fa-solid fa-user-circle"></i>

                            </Link>
                            {isUserMenuOpen && (
                                <div className="user-dropdown">
                                    {user ? (
                                        <>
                                            <Link to="/mis-pedidos" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                <i className="fa-solid fa-shopping-bag"></i> Mis Pedidos
                                            </Link>
                                            <Link to="/mis-mascotas" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                <i className="fa-solid fa-paw"></i> Mis Mascotas
                                            </Link>
                                            <Link to="/" className="dropdown-item" onClick={() => {
                                                logout();
                                                setUserMenuOpen(false);
                                            }}>
                                                <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                <i className="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
                                            </Link>
                                            <Link to="/registrarse" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                <i className="fa-solid fa-user-plus"></i> Registrarse
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </li>

                        {/* Menú de usuario para móvil */}
                        {user ? (
                            <>
                                <li className="nav-item mobile-user-menu">
                                    <Link to="/mis-pedidos" className='nav-link' onClick={handleClose}>
                                        <i className="fa-solid fa-shopping-bag"></i> Mis Pedidos
                                    </Link>
                                </li>

                                <li className="nav-item mobile-user-menu">
                                    <Link to="/" className='nav-link' onClick={() => {
                                        logout();
                                        handleClose();
                                    }}>
                                        <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>

                                <li className="nav-item mobile-user-menu">
                                    <Link to="/login" className='nav-link' onClick={handleClose}>
                                        <i className="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
                                    </Link>
                                </li>
                                <li className="nav-item mobile-user-menu">
                                    <Link to="/registrarse" className='nav-link' onClick={handleClose}>
                                        <i className="fa-solid fa-user-plus"></i> Registrarse
                                    </Link>
                                </li>
                            </>
                        )}

                        {isAdmin && (
                            <li className="nav-item">
                                <Link
                                    to="/admin"
                                    className="nav-link"
                                    onClick={handleClose}
                                >
                                    <i className="fa-solid fa-gears"></i>
                                </Link>
                            </li>
                        )}

                    </ul>
                </nav>
            </header>

            {/* Cart Modal */}
            {isCartOpen && (
                <>
                    <div className="cart-overlay open" onClick={closeCart}></div>
                    <Cart isOpen={isCartOpen} onClose={closeCart} />
                </>
            )}
        </>
    );
};

export default Header;








