import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Footer from "../../components/estaticos/Footer";
import "./Admin.css";
import HeaderAdmin from "../../components/estaticos/HeaderAdmin";

const negocioCards = [
  {
    icon: "fa-solid fa-box",
    title: "Productos y Servicios",
    description: "Administrá el catálogo, stock y promociones de la boutique.",
    to: "/admin/productos",
    label: "Ir a productos",
  },
  {
    icon: "fa-solid fa-receipt",
    title: "Ventas",
    description: "Supervisá las ventas en curso y actualizá su estado en segundos.",
    to: "/admin/pedidos",
    label: "Ver ventas",
  },
  {
    icon: "fa-solid fa-calendar-check",
    title: "Turnos",
    description: "Agenda de turnos asignando y controlando turnos clínicos.",
    to: "/admin/turnos",
    label: "Ver turnos",
  },
  
];

const operativaCards = [
  {
    icon: "fa-solid fa-users",
    title: "Usuarios",
    description: "Gestioná clientes, equipos internos y su información de contacto.",
    to: "/users",
    label: "Ir a usuarios",
  },
  {
    icon: "fa-solid fa-chart-bar",
    title: "Estadísticas",
    description: "Visualizá KPIs de ventas, turnos y performance del equipo.",
    to: "/admin/estadisticas",
    label: "Ver estadísticas",
  },
 /* {
    icon: "fa-solid fa-user-tag",
    title: "Roles",
    description: "Definí permisos y accesos específicos para cada rol de la organización.",
    to: "/admin/roles",
    label: "Ver roles",
  },
  {
    icon: "fa-solid fa-code",
    title: "Gestión de APIs",
    description: "Controlá los endpoints disponibles y sus credenciales de acceso.",
    to: "/admin/apis",
    label: "Ver APIs",
  },*/
];

const Admin = () => {
  const [openGroup, setOpenGroup] = useState({ negocio: true, operativa: true });

  const sections = [
    {
      key: "negocio",
      title: "Gestión de negocio",
      description: "Controlá todos los módulos orientados a la experiencia del cliente y los servicios de Vettix.",
      cards: negocioCards,
    },
    {
      key: "operativa",
      title: "Gestión operativa",
      description: "Configurá la operación interna, administrá tu equipo y asegurá el acceso correcto a cada funcionalidad.",
      cards: operativaCards,
    },
  ];

  return (
    <div className="admin-page">
      <Helmet>
        <title>Panel de Administración | Vettix</title>
        <meta
          name="description"
          content="Panel administrativo de Vettix: gestioná productos, pedidos, turnos, usuarios y configuraciones internas desde un mismo lugar."
        />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content admin-main">
      <section className="turnos-hero admin-stats-hero">
          <div className="boutique-hero-header">
            <span className="hero-tag hero-tag-contrast">Panel administrativo</span>
            <h1>Gestion administrativa</h1>
            <p>
              Controlá catálogos, turnos, ventas y equipos con una interfaz unificada.
            </p>
          </div>
         
        </section>

        {sections.map((section) => (
          <section key={section.key} className="admin-panel-section">
            <button
              type="button"
              className="admin-section-toggle"
              onClick={() => setOpenGroup((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
              aria-expanded={openGroup[section.key]}
            >
              <div className="admin-section-header">
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
              <span className="admin-toggle-icon" aria-hidden>
                <i className={`fa-solid ${openGroup[section.key] ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
              </span>
            </button>

            {openGroup[section.key] && (
              <div className="admin-cards-grid">
                {section.cards.map((card) => (
                  <article key={card.title} className="admin-dashboard-card">
                    <div className="admin-card-icon" aria-hidden>
                      <i className={card.icon}></i>
                    </div>
                    <div className="admin-card-body">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                    <Link to={card.to} className="admin-card-link">
                      <span>{card.label}</span>
                      <i className="fa-solid fa-arrow-right" aria-hidden></i>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Admin;