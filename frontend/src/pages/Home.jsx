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
      <p className="text-text-2">Tu rol es {user.role_display}.</p>
      <div className="mt-section grid gap-stack sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="rounded-panel border border-line-strong bg-panel p-group transition-colors hover:bg-panel-2"
          >
            <p className="font-semibold text-text">{section.label}</p>
          </Link>
        ))}
      </div>
      <p className="mt-section text-meta text-muted">
        Las pantallas de carga de datos estarán disponibles próximamente.
      </p>
    </PageShell>
  )
}
