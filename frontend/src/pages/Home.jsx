import { Link } from 'react-router'
import PageShell from '../components/PageShell.jsx'
import { useAuth } from '../auth-context.js'
import { SECTIONS } from '../sections.js'

export default function Home() {
  const { user } = useAuth()
  const sections = SECTIONS.filter((section) =>
    section.roles.includes(user.role),
  )
  return (
    <PageShell title={`Hola, ${user.first_name} ${user.last_name}`}>
      <p className="text-slate-600">Tu rol es {user.role_display}.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
          >
            <p className="font-medium text-slate-900">{section.label}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Las pantallas de carga de datos estarán disponibles próximamente.
      </p>
    </PageShell>
  )
}
