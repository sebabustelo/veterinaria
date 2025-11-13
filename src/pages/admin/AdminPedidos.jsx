import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../components/estaticos/HeaderAdmin";
import Footer from "../../components/estaticos/Footer";
import salesData from "@/data/adminSales.json";
import "./AdminPedidos.css";

const formatCurrency = (value) =>
  value?.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }) ?? "$0,00";

const formatDateTime = (dateString) =>
  new Date(dateString).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminPedidos = () => {
  const pedidos = salesData.ventas ?? [];
  const metadata = salesData.metadata ?? {};

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const resumen = useMemo(() => {
    const totalIngresos = pedidos.reduce((acc, pedido) => acc + (pedido.total ?? 0), 0);
    const totalServicios = pedidos.reduce(
      (acc, pedido) => acc + pedido.items.filter((item) => item.tipo === "servicio").length,
      0
    );
    const totalProductos = pedidos.reduce(
      (acc, pedido) => acc + pedido.items.filter((item) => item.tipo === "producto").length,
      0
    );
    const ticketPromedio = pedidos.length ? totalIngresos / pedidos.length : 0;

    return {
      totalIngresos,
      totalServicios,
      totalProductos,
      ticketPromedio,
      totalPedidos: pedidos.length,
    };
  }, [pedidos]);

  const filteredPedidos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pedidos;

    return pedidos.filter((pedido) => {
      const cliente = pedido.cliente_nombre?.toLowerCase() ?? "";
      const sucursal = pedido.sucursal_nombre?.toLowerCase() ?? "";
      const idMatch = pedido.id?.toString().includes(term);
      const itemMatch = pedido.items?.some((item) =>
        (item.producto_nombre || item.servicio_nombre)?.toLowerCase().includes(term)
      );
      return cliente.includes(term) || sucursal.includes(term) || idMatch || itemMatch;
    });
  }, [pedidos, searchTerm]);

  return (
    <div className="admin-page">
      <Helmet>
        <title>Ventas y Pedidos | Vettix</title>
        <meta
          name="description"
          content="Resumen de pedidos con detalle de productos y servicios clínicos de Vettix."
        />
      </Helmet>
      <HeaderAdmin />
      <main className="main-content">
        <section className="admin-hero">
          <div>
            <span className="hero-tag hero-tag-contrast">Resumen de ventas</span>
            <h1>Ventas y Pedidos</h1>
            <p>
              Consultá el historial completo de ventas, pedidos y transacciones de la clínica. 
              Visualizá detalles de productos y servicios vendidos, ingresos generados y el 
              desempeño comercial por sucursal y cliente.
            </p>
          </div>
          <div className="admin-products-hero-card">
            <ul>
              <li>Total ventas: {metadata.total_ventas ?? pedidos.length}</li>
              <li>Ingresos totales: {formatCurrency(resumen.totalIngresos)}</li>              
              <li>Servicios clínicos: {resumen.totalServicios} (Consultas, cirugías y wellness)</li>
              <li>Productos boutique: {resumen.totalProductos} (Farmacia, alimentos y accesorios)</li>
              <li>Pedidos registrados: {resumen.totalPedidos} operaciones históricas</li>
              <li>
                Actualización: {metadata.fecha_actualizacion
                  ? new Date(metadata.fecha_actualizacion).toLocaleString("es-AR")
                  : "No informado"}
              </li>
            </ul>
          </div>
        </section>

        <section className="orders-search">
          <div className="search-box">
            <i className="fa-solid fa-search search-icon"></i>&nbsp;
            <input
              type="text"
              placeholder="Buscar por cliente, sucursal o producto..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpiar búsqueda">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <Link to="/admin" className="admin-card-link">
            <i className="fa-solid fa-arrow-left"></i>
            Volver al Admin
          </Link>
        </section>

        <section className="orders-grid">
          {filteredPedidos.length === 0 ? (
            <div className="orders-empty">
              <i className="fa-solid fa-dog"></i>
              <h3>No encontramos pedidos</h3>
              <p>Ajustá la búsqueda o revisá otro período.</p>
            </div>
          ) : (
            filteredPedidos.map((pedido) => {
              const servicios = pedido.items.filter((item) => item.tipo === "servicio");
              const productos = pedido.items.filter((item) => item.tipo === "producto");
              const isOpen = selectedOrderId === pedido.id;

              return (
                <article key={pedido.id} className="order-card">
                  <header className="order-card-header">
                    <div>
                      <h3>Pedido #{pedido.id}</h3>
                      <p>
                        {pedido.cliente_nombre} · {pedido.sucursal_nombre}
                      </p>
                    </div>
                    <span className="order-amount">{formatCurrency(pedido.total)}</span>
                  </header>
                  <div className="order-meta">
                    <span>
                      <i className="fa-solid fa-calendar-day"></i> {formatDateTime(pedido.fecha)}
                    </span>
                    <span>
                      <i className="fa-solid fa-stethoscope"></i> {servicios.length} servicios
                    </span>
                    <span>
                      <i className="fa-solid fa-bone"></i> {productos.length} productos
                    </span>
                  </div>
                  <button
                    type="button"
                    className="order-detail-toggle"
                    onClick={() => setSelectedOrderId(isOpen ? null : pedido.id)}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? "Ocultar detalle" : "Ver detalle"}
                    <i className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                  </button>
                  {isOpen && (
                    <div className="order-items">
                      <h4>Detalle de ítems</h4>
                      <ul>
                        {pedido.items.map((item) => (
                          <li key={item.id}>
                            <div className="item-header">
                              <strong>{item.producto_nombre || item.servicio_nombre}</strong>
                              <span className={`item-tag item-${item.tipo}`}>
                                <i
                                  className={`fa-solid ${
                                    item.tipo === "servicio" ? "fa-stethoscope" : "fa-paw"
                                  }`}
                                ></i>
                                {item.tipo}
                              </span>
                            </div>
                            <div className="item-meta">
                              <span>Cant. {item.cantidad}</span>
                              <span>Unit. {formatCurrency(item.precio_unitario)}</span>
                              <span>Total {formatCurrency(item.subtotal)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPedidos;
