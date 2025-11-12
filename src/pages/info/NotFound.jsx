import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async';

function NotFound() {
  return (
    <div className="not-found">
      <Helmet>
        <title>404 - Página no encontrada | E-commerce de Mascotas</title>
        <meta name="description" content="La página que buscas no existe. Vuelve al inicio para seguir explorando nuestros productos para mascotas." />
      </Helmet>
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}

export default NotFound 