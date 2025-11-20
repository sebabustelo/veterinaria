import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/estaticos/Header";
import Footer from "../../components/estaticos/Footer";
import { Helmet } from 'react-helmet-async';

// Datos de contacto para urgencias 24hs
const urgenciasContact = {
    telefono: "+5491123456789", // Formato internacional para WhatsApp
    telefonoDisplay: "(011) 1234-5678",
    direccion: "Av. Belgrano 1234, CABA",
    horario: "Disponible las 24 horas, los 365 días del año",
    whatsappMessage: "Hola, necesito atención veterinaria de urgencia para mi mascota."
};

const serviceCards = [
    {
        title: "Urgencias 24 horas",
        description: "Atención inmediata con equipo veterinario especializado disponible las 24h en nuestra sede central de Belgrano.",
        image: "https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?auto=format&fit=crop&w=900&q=80",
        cta: "Contacto urgente",
        to: "/contactos",
        isUrgencia: true
    },
    {
        title: "Internación Premium",
        description: "Hospitalización con monitoreo 24/7, salas equipadas y cuidados personalizados en tres sucursales estratégicas.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
        cta: "Solicitar turno",
        to: "/turnos"
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
                                    
                                    {service.isUrgencia ? (
                                        <div className="urgencia-contact-info">
                                            <div className="contact-details">
                                                <p><strong>📍 {urgenciasContact.direccion}</strong></p>
                                                <p><strong>📞 {urgenciasContact.telefonoDisplay}</strong></p>
                                                <p><strong>🕐 {urgenciasContact.horario}</strong></p>
                                            </div>
                                            <a
                                                href={`https://wa.me/${urgenciasContact.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(urgenciasContact.whatsappMessage)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="whatsapp-button"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                Escribir por WhatsApp
                                            </a>
                                        </div>
                                    ) : (
                                        <Link to={service.to} className="service-link">
                                            {service.cta} →
                                        </Link>
                                    )}
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