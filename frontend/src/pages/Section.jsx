import PageShell from '../components/PageShell.jsx'
import { useAuth } from '../auth-context.js'

export default function Section({ section }) {
  const { user } = useAuth()
  // S24: the professor reads Socios but cannot manage it.
  const readOnly = section.path === '/socios' && user.role === 'profesor'
  return (
    <PageShell title={section.label}>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-slate-600">
          Las pantallas de {section.label.toLowerCase()} estarán disponibles
          próximamente.
        </p>
        {readOnly && (
          <p className="mt-3 text-sm text-slate-500">
            Tu rol tiene acceso de solo lectura a esta sección.
          </p>
        )}
      </div>
    </PageShell>
  )
}
