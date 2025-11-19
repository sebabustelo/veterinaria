import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import HeaderAdmin from '../../components/estaticos/HeaderAdmin';
import Footer from '../../components/estaticos/Footer';
import statsData from '@/data/adminStats.json';
import './AdminEstadisticas.css';

const sparklineStyle = { strokeWidth: 2, dot: false };

const appointmentTrend = [
  { label: 'Lun', value: 18 },
  { label: 'Mar', value: 22 },
  { label: 'Mié', value: 21 },
  { label: 'Jue', value: 25 },
  { label: 'Vie', value: 30 },
  { label: 'Sáb', value: 40 },
  { label: 'Dom', value: 30 }
];

const revenueTrend = [
  { label: 'Semana 1', value: 4200000 },
  { label: 'Semana 2', value: 4380000 },
  { label: 'Semana 3', value: 4620000 },
  { label: 'Semana 4', value: 5240000 }
];

const AdminEstadisticas = () => {
  const navigate = useNavigate();
  const { totals, appointmentsByService, revenueStreams, occupancyByBranch, petHotelStats, alerts, reportPeriod } = statsData;

  return (
    <div className="admin-page">
      <Helmet>
        <title>KPIs Veterinaria | Admin Vettix</title>
        <meta name="description" content="Indicadores clave del ecosistema veterinario Vettix." />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content admin-stats">
        <section className="admin-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Reporte mensual</span>
            <h1>KPIs operativos</h1>
            <p>
              Resumen de métricas clave de atención clínica, bienestar, telemedicina y rendimiento comercial correspondientes a {reportPeriod}.
            </p>
          </div>
          <div className="admin-stats-hero-card">
            <ul>
              <li>186 turnos clínicos · 24 emergencias resueltas</li>
              <li>122 vacunas aplicadas · 42 sesiones de telemedicina</li>
              <li>Ingresos totales ${totals.revenue.toLocaleString('es-AR')}</li>
            </ul>
          </div>
        </section>

        <div className="admin-actions-bar">
          <button
            type="button"
            className="admin-card-link"
            onClick={() => navigate('/admin')}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al Admin
          </button>
        </div>

        <section className="stats-grid">
          <article className="stat-tile">
            <header>
              <h3>Turnos clínicos</h3>
              <span className="stat-value">{totals.appointments}</span>
              <p className="stat-subinfo">Media diaria: 26 turnos</p>
            </header>
            <div className="stat-chart">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={appointmentTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c7cb5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c7cb5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="value" stroke="#3d407d" fill="url(#colorAppointments)" {...sparklineStyle} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="stat-tile">
            <header>
              <h3>Ingresos totales</h3>
              <span className="stat-value">${totals.revenue.toLocaleString('es-AR')}</span>
              <p className="stat-subinfo">Valor promedio: ${totals.avgAppointmentValue.toLocaleString('es-AR')}</p>
            </header>
            <div className="stat-chart">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={revenueTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString('es-AR')}`} />
                  <Line type="monotone" dataKey="value" stroke="#65ccec" {...sparklineStyle} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="stat-tile">
            <header>
              <h3>Telemedicina & Emergencias</h3>
              <span className="stat-value">{totals.telemedicineSessions} sesiones</span>
              <p className="stat-subinfo">Emergencias resueltas: {totals.emergencyAppointments}</p>
            </header>
            <ul className="stat-list">
              <li><strong>{totals.avgWaitTime} min</strong> tiempo de espera promedio</li>
              <li><strong>{totals.newClients}</strong> nuevos clientes fidelizados</li>
              <li><strong>{totals.vaccinesApplied}</strong> vacunas preventivas aplicadas</li>
            </ul>
          </article>

          <article className="stat-tile">
            <header>
              <h3>Hotel & Bienestar</h3>
              <span className="stat-value">{totals.petHotelOccupancy}% ocupación</span>
              <p className="stat-subinfo">Estadía promedio: {petHotelStats.avgStay} noches</p>
            </header>
            <ul className="stat-list">
              <li>Razas frecuentes: {petHotelStats.topBreeds.join(', ')}</li>
              <li>Servicios favoritos: {petHotelStats.favoriteServices.join(', ')}</li>
            </ul>
          </article>
        </section>

        <section className="stats-dual-grid">
          <article className="stats-card">
            <h2>Turnos por servicio</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={appointmentsByService} margin={{ left: 0, right: 0, top: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="service" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value} turnos`} />
                <Line type="monotone" dataKey="count" stroke="#3d407d" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </article>

          <article className="stats-card">
            <h2>Ingresos por unidad de negocio</h2>
            <ul className="revenue-list">
              {revenueStreams.map((item) => (
                <li key={item.area}>
                  <span>{item.area}</span>
                  <strong>${item.amount.toLocaleString('es-AR')}</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>
<br />
        <section className="stats-card occupancy-card">
          <h2>Ocupación por sede</h2>
          <table>
            <thead>
              <tr>
                <th>Sucursal</th>
                <th>Hospitalización</th>
                <th>Pet Hotel</th>
              </tr>
            </thead>
            <tbody>
              {occupancyByBranch.map((row) => (
                <tr key={row.branch}>
                  <td>{row.branch}</td>
                  <td>{row.hospitalization}%</td>
                  <td>{row.hotel}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="alerts-section">
          <h2>Alertas operativas</h2>
          <div className="alert-grid">
            {alerts.map((alert) => (
              <article key={alert.id} className={`alert-card alert-${alert.severity}`}>
                <h3>{alert.title}</h3>
                <p>{alert.message}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminEstadisticas; 