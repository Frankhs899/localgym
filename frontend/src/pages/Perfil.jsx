import { useState } from 'react'
import PageShell from '../components/PageShell.jsx'
import { useAuth } from '../auth-context.js'

const inputClass =
  'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'

export default function Perfil() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState(null)
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFieldErrors(null)
    setUpdated(false)
    try {
      // S12: the person stays logged in (the backend keeps the session).
      await changePassword(currentPassword, newPassword)
      setUpdated(true)
      setCurrentPassword('')
      setNewPassword('')
    } catch (apiError) {
      // Field errors (400) carry per-field message arrays from the backend.
      if (
        apiError.data &&
        (apiError.data.current_password || apiError.data.new_password)
      ) {
        setFieldErrors(apiError.data)
      } else {
        setError(apiError.message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Mi perfil">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Usuario</dt>
            <dd className="font-medium text-slate-900">{user.username}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium text-slate-900">
              {user.first_name} {user.last_name}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Rol</dt>
            <dd className="font-medium text-slate-900">{user.role_display}</dd>
          </div>
        </dl>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Cambiar contraseña
        </h2>
        <label className="block text-sm">
          <span className="text-slate-700">Contraseña actual</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
          />
          {fieldErrors?.current_password && (
            <span className="mt-1 block text-sm text-red-600">
              {fieldErrors.current_password[0]}
            </span>
          )}
        </label>
        <label className="block text-sm">
          <span className="text-slate-700">Nueva contraseña</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
          {fieldErrors?.new_password && (
            <span className="mt-1 block text-sm text-red-600">
              {fieldErrors.new_password.join(' ')}
            </span>
          )}
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {updated && (
          <p role="status" className="text-sm text-green-700">
            Contraseña actualizada.
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </PageShell>
  )
}
