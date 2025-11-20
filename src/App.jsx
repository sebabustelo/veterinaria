import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from '@/pages/shop/Home'
import Registrarse from '@/pages/auth/Registrarse'
import AcercaDe from '@/pages/info/AcercaDe'
import GaleriaDeProductos from '@/pages/shop/GaleriaDeProductos'
import DetallesProductos from '@/pages/shop/DetallesProductos'
import Contactos from '@/pages/info/Contactos'
import SolicitarTurno from '@/pages/shop/SolicitarTurno'
import NotFound from '@/pages/info/NotFound'
import IniciarSesion from '@/pages/auth/IniciarSesion'
const Admin = lazy(() => import('@/pages/admin/Admin'))
const Users = lazy(() => import('@/pages/admin/Users'))
const AdminProductos = lazy(() => import('@/pages/admin/AdminProductos'))
const AdminApis = lazy(() => import('@/pages/admin/AdminApis'))
const AdminRoles = lazy(() => import('@/pages/admin/AdminRoles'))
const AdminTurnos = lazy(() => import('@/pages/admin/AdminTurnos'))
const AdminHistoriasClinicas = lazy(() => import('@/pages/admin/AdminHistoriasClinicas'))
import Checkout from '@/pages/shop/Checkout'
import MyOrders from '@/pages/shop/MyOrders'
import MyPets from '@/pages/shop/MyPets'
import MyProfile from '@/pages/shop/MyProfile'
import RutasProtegidas from '@/auth/RutasProtegidas'
import { ProductProvider, CartProvider, AuthProvider, useAuth, UserProvider, UsersProvider, ToastProvider, useToast, RealTimeProvider } from '@/context'
import ResetPassword from '@/components/ResetPassword'
const AdminPedidos = lazy(() => import('@/pages/admin/AdminPedidos'))
const AdminEstadisticas = lazy(() => import('@/pages/admin/AdminEstadisticas'))
const AdminSucursales = lazy(() => import('@/pages/admin/AdminSucursales'))
const AdminPromociones = lazy(() => import('@/pages/admin/AdminPromociones'))
import ToastContainer from '@/components/ToastContainer'
import ErrorBoundary from '@/components/ErrorBoundary'
import PWAInstallButton from '@/components/PWAInstallButton'
import ScrollToTop from '@/components/ScrollToTop'
import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserProvider>
            <RealTimeProvider>
              <ProductProvider>
                <CartProvider>
                  <ToastProvider>
                    <Suspense fallback={<div style={{padding:16}}>Cargando…</div>}>
                      <ErrorBoundary>
                        <AppRoutes />
                      </ErrorBoundary>
                    </Suspense>
                  </ToastProvider>
                </CartProvider>
              </ProductProvider>
            </RealTimeProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  )
}

function AppRoutes() {
  const { user } = useAuth();
  const { toasts, removeToast } = useToast();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/acercade' element={<AcercaDe />} />
        <Route path='/productos' element={<GaleriaDeProductos />} />
        <Route path='/productos/:id' element={<DetallesProductos />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/contactos' element={<Contactos />} />
        <Route path='/turnos' element={
          <RutasProtegidas isAuthenticated={!!user}>
            <SolicitarTurno />
          </RutasProtegidas>
        } />
        <Route path='*' element={<NotFound />} />
        <Route path='/admin' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <Admin />
          </RutasProtegidas>
        } />
        <Route path='/users' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <UsersProvider>
              <Users />
            </UsersProvider>
          </RutasProtegidas>
        } />
        <Route path='/login' element={<IniciarSesion />} />
        <Route path='/registrarse' element={<Registrarse />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/admin/productos' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <AdminProductos />
          </RutasProtegidas>
        } />
        <Route path='/admin/apis' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <AdminApis />
          </RutasProtegidas>
        } />
        <Route path='/admin/roles' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <AdminRoles />
          </RutasProtegidas>
        } />
        <Route path='/admin/turnos' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <UsersProvider>
              <AdminTurnos />
            </UsersProvider>
          </RutasProtegidas>
        } />
        <Route path='/admin/pedidos' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <AdminPedidos />
          </RutasProtegidas>
        } />
        <Route path='/admin/estadisticas' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <AdminEstadisticas />
          </RutasProtegidas>
        } />
        <Route path='/admin/sucursales' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <AdminSucursales />
          </RutasProtegidas>
        } />
        <Route path='/admin/historias-clinicas' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <UsersProvider>
              <AdminHistoriasClinicas />
            </UsersProvider>
          </RutasProtegidas>
        } />
        <Route path='/admin/promociones' element={
          <RutasProtegidas isAuthenticated={!!user} roles={['admin']}>
            <AdminPromociones />
          </RutasProtegidas>
        } />

        <Route path='/mi-perfil' element={
          <RutasProtegidas isAuthenticated={!!user}>
            <MyProfile />
          </RutasProtegidas>
        } />
        <Route path='/mis-pedidos' element={
          <RutasProtegidas isAuthenticated={!!user}>
            <MyOrders />
          </RutasProtegidas>
        } />
        <Route path='/mis-mascotas' element={
          <RutasProtegidas isAuthenticated={!!user}>
            <MyPets />
          </RutasProtegidas>
        } />
      </Routes>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <PWAInstallButton />
    </>
  )
}

export default App





