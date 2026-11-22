import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth-context.js'
import { ALL_ROLES, SECTIONS } from '../sections.js'

const MENU_ITEMS = [
  { path: '/', label: 'Inicio', roles: ALL_ROLES, end: true },
  ...SECTIONS,
  { path: '/perfil', label: 'Mi perfil', roles: ALL_ROLES },
]

// design/system.md § Componentes — nav item: `rounded-control`, control padding,
// hover is one surface rung (`bg-panel`), the active item sits on the inverted
// surface with accent ink. `aria-current` comes from NavLink, so the active look
// and the accessibility state cannot disagree.
function navLinkClass({ isActive }) {
  return [
    'block rounded-control p-inset text-body transition-colors',
    isActive ? 'bg-invert font-semibold text-accent-ink' : 'text-text hover:bg-panel',
  ].join(' ')
}

// The avatar shows the person's initials; the name itself is next to it, so the
// block is decorative and stays out of the accessibility tree.
function initials(user) {
  const letters = [user.first_name, user.last_name]
    .map((part) => (part || '').trim().charAt(0))
    .join('')
  return (letters || user.username || '').slice(0, 2).toUpperCase()
}

export default function Shell() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const navigate = useNavigate()

  // S9/S24: the menu only shows the sections the person's role may access.
  const items = MENU_ITEMS.filter((item) => item.roles.includes(user.role))

  // The mobile drawer closes with Escape and hands focus back to the button that
  // opened it, as the artboard does.
  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }
    function handleKeyDown(event) {
      if (event.key !== 'Escape') {
        return
      }
      setMenuOpen(false)
      if (menuButtonRef.current) {
        menuButtonRef.current.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    // The shell root owns the dark text tier and the accent focus ring: both are
    // only legible on the system's neutral surfaces, so they stay in the shell
    // subtree and never land on the still-light Login screen (slices 3 and 4).
    <div className="min-h-svh bg-bg text-text [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-2 [&_*:focus-visible]:outline-accent">
      <div className="min-h-svh md:flex">
        {/* Sidebar. On tablet and phone it is a drawer: `hidden` while closed so it
            leaves the accessibility tree and the tab order with it, never a
            transform-only hide that stays focusable off canvas. */}
        <aside
          id="shell-nav"
          className={[
            'flex-col justify-between overflow-y-auto bg-shell px-stack py-group',
            'border-r border-line-strong',
            'fixed inset-y-0 left-0 z-50 w-[260px]',
            menuOpen ? 'flex' : 'hidden',
            'md:static md:z-auto md:flex md:w-[230px] md:shrink-0 md:overflow-visible',
          ].join(' ')}
        >
          <div>
            <p className="mb-group flex items-center gap-inset px-inset font-display text-head font-bold text-text">
              <span
                aria-hidden="true"
                className="inline-flex rounded-control bg-invert p-tight text-accent-ink"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M9 12h6" />
                </svg>
              </span>
              LocalGym
            </p>
            <nav>
              <ul className="grid gap-tight">
                {items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      className={navLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {user.role === 'admin' && (
            <div className="mt-group px-inset">
              <a
                href="/admin/"
                className="text-meta text-text-2 underline hover:text-text"
              >
                Admin Django
              </a>
            </div>
          )}
        </aside>

        {menuOpen && (
          <div
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-scrim md:hidden"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* S9/S22: the logged person shows by real name and surname. */}
          {/* The artboard narrows the topbar gutter below the tablet breakpoint so the
              name, the role and the logout keep their line at phone width. */}
          <header className="sticky top-0 z-20 flex items-center gap-stack border-b border-line bg-panel px-stack py-inset md:px-section">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="shell-nav"
              className="rounded-control border border-line-strong px-stack py-inset text-body text-text md:hidden"
            >
              Menú
            </button>
            <span className="ml-auto flex items-center gap-inset text-body">
              <span
                aria-hidden="true"
                className="grid size-[30px] flex-none place-items-center rounded-pill border border-line-strong bg-panel-2 text-meta font-bold text-text"
              >
                {initials(user)}
              </span>
              <span>
                <b className="block font-semibold text-text">
                  {user.first_name} {user.last_name}
                </b>
                <span className="block text-meta text-text-2">
                  {user.role_display}
                </span>
              </span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[36px] rounded-control border border-line-strong px-stack py-tight text-meta text-text-2 transition-colors hover:bg-panel-2 hover:text-text"
            >
              Cerrar sesión
            </button>
          </header>

          <main className="min-w-0 flex-1 px-stack py-group md:px-section">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
