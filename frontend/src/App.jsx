import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AuthProvider from './auth.jsx'
import { useAuth } from './auth-context.js'
import Shell from './components/Shell.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Perfil from './pages/Perfil.jsx'
import Section from './pages/Section.jsx'
import SinPermiso from './pages/SinPermiso.jsx'
import { SECTIONS } from './sections.js'

function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">Cargando…</p>
    </div>
  )
}

function LoginRoute() {
  const { status } = useAuth()
  if (status === 'loading') {
    return <Loading />
  }
  if (status === 'authed') {
    return <Navigate to="/" replace />
  }
  return <Login />
}

function ProtectedShell() {
  const { status } = useAuth()
  if (status === 'loading') {
    return <Loading />
  }
  if (status === 'anon') {
    return <Navigate to="/login" replace />
  }
  return <Shell />
}

function RequireRoles({ roles, children }) {
  const { user, status } = useAuth()
  if (status === 'loading') {
    return <Loading />
  }
  if (status === 'anon') {
    return <Navigate to="/login" replace />
  }
  // S10: roles without permission for the route see the "Sin permiso" screen.
  if (!roles.includes(user.role)) {
    return <SinPermiso />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedShell />}>
            <Route path="/" element={<Home />} />
            {SECTIONS.map((section) => (
              <Route
                key={section.path}
                path={section.path}
                element={
                  <RequireRoles roles={section.roles}>
                    <Section section={section} />
                  </RequireRoles>
                }
              />
            ))}
            <Route path="/perfil" element={<Perfil />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
