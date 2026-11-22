import PageShell from '../components/PageShell.jsx'
import { useAuth } from '../auth-context.js'

export default function Section({ section }) {
  const { user } = useAuth()
  // S24: the professor reads Socios but cannot manage it.
  const readOnly = section.path === '/socios' && user.role === 'profesor'
  return (
    <PageShell title={section.label}>
      <div className="rounded-panel border border-line-strong bg-panel p-group">
        <p className="text-text-2">
          Las pantallas de {section.label.toLowerCase()} estarán disponibles
          próximamente.
        </p>
        {readOnly && (
          <p className="mt-stack text-meta text-muted">
            Tu rol tiene acceso de solo lectura a esta sección.
          </p>
        )}
      </div>
    </PageShell>
  )
}
