import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styleEstatico.css';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleToggle = () => setOpen(!open);
    const handleClose = () => setOpen(false);

    return (
        <header className="header">
            <nav className="nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" className="logo-link" onClick={handleClose}>
                    <img src="/img/logo.png" alt="Logo" className="logo-img" />
                </Link>
                <div className="hamburger" onClick={handleToggle}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
                <ul className={`nav-list ${open ? 'open' : ''}`}>
                    <li className="nav-item">
                        <Link to="/" className='nav-link' onClick={handleClose}>
                        <i className="fa-solid fa-home"></i> Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin" className='nav-link' onClick={handleClose}>
                        <i className="fa-solid fa-gears"></i> Admin
                        </Link>
                    </li>
                  
                   
                    {user && (
                        <li className="nav-item">
                            <Link to="/" className="nav-link" onClick={() => { 
                                //clearCart(); 
                                logout(); 
                                navigate('/'); 
                            }}>
                                <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
                            </Link>
                        </li>
                    )}
                </ul>
               
            </nav>
        </header>
    );
};

export default Header;

