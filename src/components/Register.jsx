import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './styleLogin.css';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { registerWithEmail, loginWithGoogle, loginWithFacebook, error, setError } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
            setError("Por favor completa todos los campos.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (form.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setIsLoading(true);
        try {
            await registerWithEmail(form.email, form.password, form.name);
            navigate("/productos");
        } catch (error) {
            console.error('Register error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            // No necesitamos navegar aquí porque redirect lo maneja
        } catch (error) {
            console.error('Google login error:', error);
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithFacebook();
            // No necesitamos navegar aquí porque redirect lo maneja
        } catch (error) {
            console.error('Facebook login error:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="login-card">
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                Registro
            </h2>
            <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="form-group">
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>
                {error && (
                    <div style={{ color: "#d32f2f", marginBottom: "1rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}
                <button 
                    type="submit" 
                    className="login-btn"
                    disabled={isLoading}
                >
                    {isLoading ? "Registrando..." : "Registrarse"}
                </button>
                <button 
                    onClick={handleGoogleLogin} 
                    className="login-btn google" 
                    type="button"
                    disabled={isLoading}
                >
                    <i className="fa-brands fa-google"></i>
                    {isLoading ? "Redirigiendo..." : "Registrarse con Google"}
                </button>
             
                <p className="register-link">
                    ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;