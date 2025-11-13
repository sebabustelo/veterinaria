import React, { useState, useEffect } from "react";
import Header from "../../components/estaticos/Header";
import Footer from "../../components/estaticos/Footer";
import "./styleContactos.css";
import { Helmet } from 'react-helmet-async';
import '../admin/AdminTurnos.css';
import '../admin/Admin.css';

const sucursales = [
  {
    nombre: "Vettix Belgrano",
    descripcion: "Clínica central con hospitalización, diagnóstico avanzado y servicio de urgencias 24/7.",
  },
  {
    nombre: "Vettix Núñez",
    descripcion: "Internación premium, cardiología, telemedicina y programas de seguimiento remoto.",
  },
  {
    nombre: "Vettix Cabildo",
    descripcion: "Internación supervisada, laboratorio integral y coordinación de cirugías especializadas.",
  },
  {
    nombre: "Vettix Saavedra",
    descripcion: "Spa veterinario, peluquería, tienda de accesorios y programas de bienestar para mascotas.",
  },
  {
    nombre: "Vettix Barrio Parque",
    descripcion: "Servicios ambulatorios, vacunatorio, adiestramiento y atención domiciliaria programada.",
  },
  {
    nombre: "Proximamente Vettix San Isidro",
    descripcion: "Servicios ambulatorios, vacunatorio, adiestramiento y atención domiciliaria programada.",
  },
];

const funcionalidades = [
  "Atención médica ambulatoria multiespecie y por especialidad",
  "Internación, monitoreo y seguimiento del estado clínico",
  "Servicios de spa, peluquería y bienestar integral",
  "Gestión de turnos, agenda dinámica y recordatorios automáticos",
  "Historias clínicas digitales con trazabilidad completa",
  "Gestión de médicos veterinarios y profesionales por especialidad",
  "Gestión de stock de medicamentos, insumos y accesorios",
  "Seguimiento con microchip para localización y control de mascotas",
  "Gestión de ventas por servicio/producto, promociones y programas de fidelización",
];

const capacidades = [
  {
    icono: "🏥",
    titulo: "Red de 5 sucursales",
    detalle: "Tres cuentan con internación y una opera urgencias 24/7, cubriendo toda la zona norte de CABA.",
  },
  {
    icono: "🩺",
    titulo: "Equipo interdisciplinario",
    detalle: "Veterinarios especialistas, groomers, entrenadores y paseadores certificados bajo protocolos Vettix.",
  },
  {
    icono: "🛠️",
    titulo: "Servicios integrales",
    detalle: "Salud preventiva, spa, peluquería, adiestramiento, tienda premium y programas de bienestar.",
  },
  {
    icono: "💡",
    titulo: "Tecnología y análisis",
    detalle: "Sistema de gestión pensado para registrar, analizar y optimizar todas las operaciones de la clínica.",
  },
];

const AcercaDe = () => {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    // Si hay un hash en la URL, hacer scroll al elemento
    if (window.location.hash === '#contact-form') {
      setTimeout(() => {
        const element = document.getElementById('contact-form');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setEnviado(true);
    setForm({ nombre: "", email: "", mensaje: "" });
  };

  return (
    <>
      <Helmet>
        <title>Acerca de Vettix | Clínica Veterinaria Premium</title>
        <meta
          name="description"
          content="Conocé la red de clínicas Vettix: cinco sucursales, internación premium, urgencias 24/7, spa y servicios integrales para mascotas." />
      </Helmet>
      <Header />
      <main className="main-content">
      <section className="admin-hero">
          <div className="acerca-hero-header">
            <span className="hero-tag hero-tag-contrast">Sobre Vettix</span>
            <h1>Red veterinaria premium con cobertura integral</h1>
            <p>
              Vettix es una clínica veterinaria...
            </p>
          </div>

          <div className="admin-products-hero-card">
            
            <ul >
              <li>Urgencias 24/7...</li>
              <li>Internación premium...</li>
              <li>Programas de bienestar...</li>
            </ul>
          </div>
        </section>

        <section className="values-section">
          <h2 className="section-title">Nuestra propuesta de valor</h2>
          <div className="values-grid">
            {capacidades.map((item) => (
              <div key={item.titulo} className="value-card">
                <span className="value-icon" aria-hidden>{item.icono}</span>
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="service-section">
          <h2 className="section-title">Nuestras sucursales</h2>
          <div className="service-grid">
            {sucursales.map((sucursal) => (
              <article key={sucursal.nombre} className="service-card">
                <div className="service-content">
                  <h3>{sucursal.nombre}</h3>
                  <p>{sucursal.descripcion}</p>
                  <span className="service-link">Servicios médicos, boutique premium y atención personalizada</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <br />
        <section id="contacto" className="admin-hero">
          <div className="contact-intro">
            <span className="hero-tag">Contacto directo</span>
            <h2>Coordinemos la próxima visita de tu mascota</h2>
            <p>
              Nuestro equipo responde en menos de un día hábil para ayudarte con turnos,
              internación, traslados, programas preventivos o consultas sobre nuestros servicios.
            </p>
            <div className="contact-info-grid">
              <div className="contact-card">
                <i className="fa-solid fa-phone"></i>
                <div>
                  <strong>Urgencias y turnos</strong>
                  <p>11 5555-1234 · 24/7</p>
                </div>
              </div>
              <div className="contact-card">
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <strong>Belgrano · Núñez</strong>
                  <p>5 sucursales con internación y spa</p>
                </div>
              </div>
              <div className="contact-card">
                <i className="fa-solid fa-envelope-open-text"></i>
                <div>
                  <strong>Consultas personalizadas</strong>
                  <p>hola@vettix.com</p>
                </div>
              </div>
            </div>
          </div>

          <form id="contact-form" className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Tu email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="mensaje"
              placeholder="Contanos qué necesitás para tu mascota"
              value={form.mensaje}
              onChange={handleChange}
              required
              rows={4}
            />
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-paper-plane" style={{ marginRight: "0.6em" }}></i>
              Enviar mensaje
            </button>
            {enviado && (
              <p className="contact-success">¡Mensaje enviado! Nos pondremos en contacto a la brevedad.</p>
            )}
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AcercaDe;







