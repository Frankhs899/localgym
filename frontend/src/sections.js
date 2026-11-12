// Role matrix (S24) as the single source for menu, routes and guards.
// The CRUD screens arrive with issues #5-#9; today each section renders a
// placeholder (S18).

export const ALL_ROLES = ['admin', 'recepcion', 'profesor']

export const SECTIONS = [
  {
    path: '/socios',
    label: 'Socios',
    roles: ['admin', 'recepcion', 'profesor'],
  },
  { path: '/membresias', label: 'Membresías', roles: ['admin', 'recepcion'] },
  { path: '/pagos', label: 'Pagos', roles: ['admin', 'recepcion'] },
  { path: '/dashboard', label: 'Dashboard', roles: ['admin', 'recepcion'] },
  { path: '/respaldos', label: 'Respaldos', roles: ['admin'] },
]
