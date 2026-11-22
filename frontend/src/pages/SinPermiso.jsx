import { Link } from 'react-router'
import PageShell from '../components/PageShell.jsx'

export default function SinPermiso() {
  return (
    <PageShell title="Sin permiso">
      <div className="rounded-panel border border-line-strong bg-panel p-group">
        <p className="text-text-2">
          No tenés permiso para acceder a esta sección.
        </p>
        <Link
          to="/"
          className="mt-group inline-flex min-h-[36px] items-center rounded-control border border-line-strong px-stack text-meta font-semibold text-text transition-colors hover:bg-panel-2"
        >
          Volver al inicio
        </Link>
      </div>
    </PageShell>
  )
}
