import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth-context.js'
import { ALL_ROLES, SECTIONS } from '../sections.js'

const MENU_ITEMS = [
  { path: '/', label: 'Inicio', roles: ALL_ROLES, end: true },
  ...SECTIONS,
  { path: '/perfil', label: 'Mi perfil', roles: ALL_ROLES },
]

function sidebarLinkClass({ isActive }) {
  return [
    'block rounded-md px-3 py-2 text-sm',
    isActive ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-slate-700',
  ].join(' ')
}

function mobileLinkClass({ isActive }) {
  return [
    'block rounded-md px-3 py-2 text-sm',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200',
  ].join(' ')
}

export default function Shell() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  // S9/S24: the menu only shows the sections the person's role may access.
  const items = MENU_ITEMS.filter((item) => item.roles.includes(user.role))

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-slate-100">
      {/* Mobile top bar (S13): hamburger + slide-down menu. */}
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white md:hidden">
        <span className="text-lg font-semibold">LocalGym</span>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          className="rounded-md border border-slate-600 px-3 py-1 text-sm"
        >
          Menú
        </button>
      </header>
      {menuOpen && (
        <nav className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="px-3 text-sm font-medium text-slate-900">
            {user.first_name} {user.last_name}
          </p>
          <p className="px-3 pb-2 text-xs text-slate-500">{user.role_display}</p>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {user.role === 'admin' && (
            <a
              href="/admin/"
              className="mt-3 block px-3 text-sm text-slate-500 underline"
            >
              Admin Django
            </a>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            Cerrar sesión
          </button>
        </nav>
      )}

      <div className="md:flex">
        {/* Desktop sidebar with the role-aware menu. */}
        <aside className="hidden w-60 shrink-0 flex-col justify-between bg-slate-900 p-4 text-white md:flex md:min-h-svh">
          <div>
            <p className="mb-6 px-3 text-lg font-semibold">LocalGym</p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={sidebarLinkClass}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            {user.role === 'admin' && (
              <a
                href="/admin/"
                className="mt-4 block px-3 text-sm text-slate-400 underline"
              >
                Admin Django
              </a>
            )}
          </div>
          <div className="mt-6 border-t border-slate-700 pt-4">
            {/* S9/S22: the logged person shows by real name and surname. */}
            <p className="px-3 text-sm font-medium">
              {user.first_name} {user.last_name}
            </p>
            <p className="px-3 text-xs text-slate-400">{user.role_display}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-md border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
