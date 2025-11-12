import React, { useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/estaticos/Header';
import Footer from '@/components/estaticos/Footer';
import loadingGif from '@/assets/loading.gif';
import ordersData from '@/data/orders.json';
import './MyOrders.css';
import '../admin/AdminPedidos.css';

const MyOrders = () => {
  const { user } = useAuth();

  const { orders, loading, error } = useMemo(() => {
    if (!user) {
      return {
        orders: [],
        loading: false,
        error: new Error('Necesitas iniciar sesión para ver tus pedidos.')
      };
    }

    const allOrders = Array.isArray(ordersData?.orders) ? ordersData.orders : [];
    const userEmail = String(user.email || '').toLowerCase();
    const userOrders = allOrders.filter(
      (order) => String(order.user_email || '').toLowerCase() === userEmail
    );

    return {
      orders: userOrders,
      loading: false,
      error: null
    };
  }, [user]);

  const summary = useMemo(() => {
    const completedStatuses = new Set(['delivered', 'completed']);
    const inProgressStatuses = new Set(['pending', 'processing', 'confirmed', 'shipped']);

    const totals = orders.reduce(
      (acc, order) => {
        const status = String(order.status || '').toLowerCase();
        const amount = Number(order.total_amount) || 0;

        if (completedStatuses.has(status)) {
          acc.completed += 1;
        } else if (inProgressStatuses.has(status)) {
          acc.inProgress += 1;
        }

        if (order.created_at) {
          const timestamp = new Date(order.created_at).getTime();
          if (!Number.isNaN(timestamp) && timestamp > acc.lastOrderDate) {
            acc.lastOrderDate = timestamp;
          }
        }

        acc.totalAmount += amount;
        return acc;
      },
      {
        total: orders.length,
        completed: 0,
        inProgress: 0,
        totalAmount: 0,
        lastOrderDate: 0
      }
    );

    return totals;
  }, [orders]);

  const lastOrderLabel = useMemo(() => {
    if (!summary.lastOrderDate) {
      return 'Sin registros';
    }

    return new Date(summary.lastOrderDate).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [summary.lastOrderDate]);

  const formatCurrency = (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return '$0';
    }
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getStatusText = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'processing':
        return 'Procesando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'completed':
        return 'Completo';
      case 'refunded':
        return 'Reintegrado';
      case 'cancelled':
      case 'canceled':
        return 'Cancelado';
      default:
        return status || 'Sin estado';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';

    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAuthenticated = Boolean(user);
  const hasOrders = orders.length > 0;
  const showErrorCard = Boolean(error);
  const requiresLogin = showErrorCard && !isAuthenticated;
  const handleImageError = useCallback((event) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied === 'true') return;
    target.dataset.fallbackApplied = 'true';
    target.src = '/img/logo.png';
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="orders-page">
          <section className="orders-hero">
            <div className="orders-hero__content">
              <span className="orders-hero__tag">Mis pedidos</span>
              <h1 className="orders-hero__title">Historial de compras</h1>
              <p className="orders-hero__subtitle">
                Reunimos tus pedidos y servicios para que puedas consultarlos en cualquier momento.
              </p>
            </div>
            <div className="orders-hero__stats">
              <div className="orders-stat-card">
                <span className="orders-stat-card__label">Total pedidos</span>
                <strong className="orders-stat-card__value">—</strong>
                <small className="orders-stat-card__hint">Cargando información</small>
              </div>
              <div className="orders-stat-card">
                <span className="orders-stat-card__label">En curso</span>
                <strong className="orders-stat-card__value">—</strong>
                <small className="orders-stat-card__hint">Actualizando estado</small>
              </div>
              <div className="orders-stat-card">
                <span className="orders-stat-card__label">Último pedido</span>
                <strong className="orders-stat-card__value">—</strong>
                <small className="orders-stat-card__hint">Procesando…</small>
              </div>
            </div>
          </section>

          <section className="orders-section">
            <div className="orders-card orders-card--loading">
              <img src={loadingGif} alt="Cargando..." className="orders-card__img" />
              <p>Estamos preparando tus pedidos…</p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="main-content">
      <section className="pets-hero">
          <div className="orders-hero__content">
            <span className="orders-hero__tag">Historial</span>
            <h1 className="orders-hero__title">Mis pedidos</h1>
            <p className="orders-hero__subtitle">
              {isAuthenticated
                ? ''
                : 'Iniciá sesión para revisar y seguir el estado de tus compras.'}
            </p>
          </div>
          <div className="orders-hero__stats">
            <div className="orders-stat-card">
              <span className="orders-stat-card__label">Total pedidos</span>
              <strong className="orders-stat-card__value">{summary.total}</strong>
              <small className="orders-stat-card__hint">
                {summary.total === 1 ? 'Pedido registrado' : 'Pedidos registrados'}
              </small>
            </div>
            <div className="orders-stat-card">
              <span className="orders-stat-card__label">En curso</span>
              <strong className="orders-stat-card__value">{summary.inProgress}</strong>
              <small className="orders-stat-card__hint">
                {summary.inProgress === 1 ? 'Seguimiento activo' : 'Seguimientos activos'}
              </small>
            </div>
            <div className="orders-stat-card">
              <span className="orders-stat-card__label">Último pedido</span>
              <strong className="orders-stat-card__value">{lastOrderLabel}</strong>
              <small className="orders-stat-card__hint">
                Total acumulado {formatCurrency(summary.totalAmount)}
              </small>
            </div>
          </div>
        </section>

        <section className="orders-section">
          {showErrorCard ? (
            <div className="orders-card orders-card--error">
              <div className="orders-card__icon">
                <i className="fa-solid fa-circle-exclamation" />
              </div>
              <div className="orders-card__content">
                <h2>Acceso restringido</h2>
                <p>{error.message || 'Ocurrió un inconveniente al obtener tus pedidos.'}</p>
              </div>
              {requiresLogin && (
                <button
                  className="orders-card__button"
                  onClick={() => (window.location.href = '/login')}
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          ) : !hasOrders ? (
            <div className="orders-card orders-card--empty">
              <div className="orders-card__icon">
                <i className="fa-solid fa-box-open" />
              </div>
              <div className="orders-card__content">
                <h2>Aún no tenés pedidos</h2>
                <p>
                  Explorá los productos y servicios disponibles y volvé cuando concretes tu primera
                  compra.
                </p>
              </div>
              <button
                className="orders-card__button"
                onClick={() => (window.location.href = '/productos')}
              >
                Ir a Productos
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Pedido #{order.order_number}</h3>
                      <p className="order-date">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge status-${order.status}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="item-image">
                          <img
                            src={
                              typeof (item.product_image || item.imagen || item.image) === 'string' &&
                              (item.product_image || item.imagen || item.image)
                                ? item.product_image || item.imagen || item.image
                                : '/img/placeholder.jpg'
                            }
                            alt={item.product_name || item.nombre || 'Producto'}
                            onError={handleImageError}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{item.product_name || item.nombre || 'Producto'}</h4>
                          <p>Cantidad: {item.quantity}</p>
                          <p>
                            Precio unitario:{' '}
                            {formatCurrency(
                              Number(item.unit_price) || Number(item.precio_unitario) || 0
                            )}
                          </p>
                        </div>
                        <div className="item-total">
                          {formatCurrency(Number(item.total_price) || Number(item.precio_total) || 0)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Envío</span>
                      <span>{formatCurrency(Number(order.shipping_cost) || 0)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>{formatCurrency(Number(order.total_amount) || 0)}</span>
                    </div>
                  </div>

                  {order.shipping && (
                    <div className="shipping-info">
                      <h4>Información de envío</h4>
                      <p>
                        <strong>Destinatario</strong>
                        {order.shipping.recipient_name || 'Sin datos'}
                      </p>
                      <p>
                        <strong>Dirección</strong>
                        {order.shipping.shipping_address || 'Sin datos'}
                      </p>
                      <p>
                        <strong>Ciudad</strong>
                        {order.shipping.shipping_city || 'Sin datos'}
                      </p>
                      <p>
                        <strong>Estado</strong>
                        <span className={`status-badge status-${order.shipping.shipping_status}`}>
                          {getStatusText(order.shipping.shipping_status)}
                        </span>
                      </p>
                      {order.shipping.tracking_number && (
                        <p>
                          <strong>Seguimiento</strong>
                          {order.shipping.tracking_number}
                        </p>
                      )}
                    </div>
                  )}

                  {order.payment && (
                    <div className="payment-info">
                      <h4>Información de pago</h4>
                      <p>
                        <strong>Método</strong>
                        {order.payment.payment_method || 'Sin datos'}
                      </p>
                      <p>
                        <strong>Estado</strong>
                        <span className={`status-badge status-${order.payment.payment_status}`}>
                          {order.payment.payment_status === 'completed'
                            ? 'Completo'
                            : getStatusText(order.payment.payment_status)}
                        </span>
                      </p>
                      <p>
                        <strong>Monto</strong>
                        {formatCurrency(Number(order.payment.amount) || 0)}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MyOrders;