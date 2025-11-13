import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/estaticos/Header";
import Footer from "../../components/estaticos/Footer";
import { Helmet } from 'react-helmet-async';

const serviceCards = [
    {
        title: "Urgencias 24 horas",
        description: "Atención inmediata con equipo veterinario especializado disponible las 24h en nuestra sede central de Belgrano.",
        image: "https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?auto=format&fit=crop&w=900&q=80",
        cta: "Contacto urgente",
        to: "/contactos"
    },
    {
        title: "Internación Premium",
        description: "Hospitalización con monitoreo 24/7, salas equipadas y cuidados personalizados en tres sucursales estratégicas.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
        cta: "Solicitar turno",
        to: "/contactos"
    },
    {
        title: "Spa & Peluquería",
        description: "Tratamientos de spa, cortes profesionales y bienestar integral con productos hipoalergénicos de alta gama.",
        image: "/img/spa.jpg",
        cta: "Reservar servicio",
        to: "/turnos"
    },
    {
        title: "Teleconsulta",
        description: "Consultas veterinarias a distancia con especialistas certificados. Próximamente disponible para seguimiento, consultas de rutina y segunda opinión desde la comodidad de tu hogar.",
        image: "/img/teleconsulta.jpg",
        cta: "Próximamente",
        to: "#"
    }
];

const valueHighlights = [
    {
        icon: "💙",
        title: "Cuidado integral",
        description: "Medicina preventiva, diagnósticos avanzados y planes personalizados para cada especie."
    },
    {
        icon: "🩺",
        title: "Tecnología de vanguardia",
        description: "Laboratorio propio, imagenología digital, telemedicina y seguimiento en tiempo real."
    },
    {
        icon: "👩‍⚕️",
        title: "Equipo experto",
        description: "Más de 30 profesionales especialistas en clínica, cirugía, rehabilitación y etología."
    },
    {
        icon: "🏥",
        title: "5 sucursales",
        description: "Belgrano, Núñez y Saavedra con internación, urgencias, spa y pet shop premium."
    }
];

const stats = [
    { number: "+15", label: "años liderando el cuidado veterinario" },
    { number: "5", label: "sucursales Vettix en Belgrano y Núñez" },
    { number: "3", label: "unidades de internación con monitoreo 24/7" },
    { number: "24/7", label: "servicio de urgencias y teleasistencia" },
    { number: "+2000", label: "Implantación de microchip para localización" },
    { number: "100%", label: "historias clínicas digitalizadas" }
];

const Home = () => {
    return (
        <>
            <Helmet>
                <title>Vettix | Clínica Veterinaria Premium en Belgrano y Núñez</title>
                <meta
                    name="description"
                    content="Vettix ofrece urgencias 24h, internación premium, spa veterinario y pet shop de alta gama en Belgrano y Núñez. Reserva tu turno y viví la excelencia en cuidado animal."
                />
            </Helmet>
            <Header />

            <main className="main-content">
                <section className="admin-hero">
                    <div>
                        <span className="hero-tag">Clínica Veterinaria Integral</span>
                        <h1 >
                            Vettix, excelencia veterinaria en Belgrano, Núñez y Saavedra
                        </h1>
                        <p className="hero-subtitle">
                            Urgencias 24 horas, internación premium, spa veterinario y pet shop especializado. Más de 15 años cuidando a las mascotas de la ciudad con tecnología de última generación y un equipo humano excepcional.
                        </p>
                       
                        <div className="hero-stats">
                            {stats.map((item) => (
                                <div key={item.label} className="stat-card">
                                    <span className="stat-number">{item.number}</span>
                                    <span className="stat-label">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="hero-cta">
                            <Link to="/turnos" className="btn primary">Solicitar turno</Link>
                            <Link to="/acercade#contact-form" className="btn primary">Contactar equipo</Link>
                            <Link to="/productos" className="btn primary">Ver pet shop </Link>
                        </div>
                    </div>
                    <div className="hero-media">
                        <img src="/img/home.png" alt="home" className="logo-img" />
                        <div className="media-badge">
                            <span className="badge-icon">⭐</span>
                            <div>
                                <strong>Clínica Certificada</strong>
                                <p>Atención reconocida por asociaciones veterinarias</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="service-section">
                    <h2 className="section-title">Servicios insignia Vettix</h2>
                    <p className="section-text">
                        Acompañamos a tu mascota en cada etapa con unidades especializadas, especialistas certificados y protocolos clínicos de nivel internacional.
                    </p>
                    <div className="service-grid">
                        {serviceCards.map((service) => (
                            <article key={service.title} className="service-card">
                                <div className="service-image">
                                    <img src={service.image} alt={service.title} loading="lazy" />
                                </div>
                                <div className="service-content">
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                    <Link to={service.to} className="service-link">
                                        {service.cta} →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="values-section">
                    <h2 className="section-title">¿Por qué elegir Vettix?</h2>
                    <div className="values-grid">
                        {valueHighlights.map((value) => (
                            <div key={value.title} className="value-card">
                                <span className="value-icon" aria-hidden>{value.icon}</span>
                                <div>
                                    <h3>{value.title}</h3>
                                    <p>{value.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

               
            </main>

            <Footer />
        </>
    );
};

export default Home;