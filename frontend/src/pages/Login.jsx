import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth-context.js'
import { Field, FieldError } from '../components/field.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username.trim(), password)
      navigate('/', { replace: true })
    } catch (apiError) {
      // S8: Spanish, visible; the backend never says which part failed.
      setError(apiError.message)
    } finally {
      setBusy(false)
    }
  }

  // The artboard marks one field red, but the backend never says which credential
  // was wrong (`apps/accounts/views.py`), so both fields are marked invalid and the
  // single message carries the whole statement.
  const invalid = Boolean(error)

  return (
    // The screen owns the dark text tier and the accent focus ring: the base layer
    // keeps them off the canvas so no light surface inherits them (L34), and this
    // is the subtree that actually paints them.
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg px-section py-page text-text [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-2 [&_*:focus-visible]:outline-accent">
      <div className="w-full max-w-[420px]">
        <header>
          <p className="flex items-center justify-center gap-stack font-display text-title font-bold text-text">
            <span
              aria-hidden="true"
              className="inline-flex rounded-control bg-invert p-tight text-accent-ink"
            >
              <svg
                width="32"
                height="32"
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
          <p className="mt-inset text-center text-meta text-muted">
            Sistema de gestión · funciona sin internet
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-page grid gap-group rounded-panel border border-line-strong bg-panel p-section"
        >
          <div>
            <h1 className="font-display text-head font-bold tracking-[-0.01em] text-text">
              Entrá a tu cuenta
            </h1>
            <p className="mt-tight text-meta text-muted">
              Solo el personal del gimnasio tiene acceso.
            </p>
          </div>

          <Field
            id="login-username"
            label="Usuario"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            required
            invalid={invalid}
            errorId="login-error"
          />

          <Field
            id="login-password"
            label="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            invalid={invalid}
            errorId="login-error"
            revealed={showPassword}
            onToggleReveal={() => setShowPassword((shown) => !shown)}
          />

          {invalid && <FieldError id="login-error" messages={error} />}

          <button
            type="submit"
            disabled={busy}
            className="min-h-[36px] w-full rounded-control bg-accent px-inset py-tight text-body font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? 'Ingresando…' : 'Entrar'}
          </button>

          <p className="text-meta leading-normal text-muted">
            Las cuentas las crea el administrador del gimnasio. Si no podés
            entrar, pedile que te restablezca la contraseña.
          </p>
        </form>

        <p className="mt-page text-center text-meta text-muted">
          LocalGym · los datos quedan en este equipo
        </p>
      </div>
    </main>
  )
}
