import { Link } from 'react-router'
import PageShell from '../components/PageShell.jsx'

export default function SinPermiso() {
  return (
    <PageShell title="Sin permiso">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-slate-600">
          No tenés permiso para acceder a esta sección.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-slate-900 underline"
        >
          Volver al inicio
        </Link>
      </div>
    </PageShell>
  )
}
