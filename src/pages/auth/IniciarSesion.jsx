import React from "react";
import Header from "../../components/estaticos/Header";
import Footer from "../../components/estaticos/Footer";
import Login from "../../components/Login";
import { Helmet } from 'react-helmet-async';

const IniciarSesion = () => {
    return (
        <>
            <Helmet>
                <title>Iniciar sesión | E-commerce de Mascotas</title>
                <meta name="description" content="Accede a tu cuenta para gestionar pedidos, ver productos y disfrutar de beneficios exclusivos para tu mascota." />
            </Helmet>
            <Header />
            <div className="main-content">
                <Login />
            </div>
            <Footer />
        </>
    );
};

export default IniciarSesion;