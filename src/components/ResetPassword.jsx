import React, { useState } from "react";
import { Link } from "react-router-dom";
import './styleLogin.css';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { resetPassword, error, setError } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Por favor ingresa tu email.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage("");

        try {
            await resetPassword(email);
            setMessage("Se ha enviado un email con instrucciones para resetear tu contraseña.");
        } catch (error) {
            console.error('Reset password error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-card">
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                Resetear Contraseña
            </h2>
            <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="Ingresa tu email"
                    />
                </div>
                
                {error && (
                    <div style={{ color: "#d32f2f", marginBottom: "1rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}
                
                {message && (
                    <div style={{ color: "#2e7d32", marginBottom: "1rem", textAlign: "center" }}>
                        {message}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    className="login-btn"
                    disabled={isLoading}
                >
                    {isLoading ? "Enviando..." : "Enviar Email"}
                </button>
                
                <p className="register-link">
                    <Link to="/login">Volver al Login</Link>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword; 