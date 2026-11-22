import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth-context.js'

// design/system.md § Formularios — the artboard's field (`03-login.html`): panel
// surface, one hairline below it, 36 px tall so the control height lands on the
// base-4 scale instead of on the padding, and the text tier stated here instead
// of inherited (the base layer deliberately sets no colour on `body`, L34).
// No `outline-none` here: the artboard's focus ring comes from `:focus-visible`,
// and suppressing the outline is what made the ring invisible while the measured
// `outline-color` still read `--color-accent`. `leading-4` is the artboard's own
// `line-height:16px` on the control: without it the inherited 1.45 makes the field
// 38.3 px and the `min-height` never binds.
const fieldClass =
  'min-h-[36px] w-full rounded-control border bg-panel px-stack py-inset text-body leading-4 text-text'

const fieldBorder = (invalid) =>
  invalid ? 'border-danger' : 'border-line-strong'

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

          <div>
            <label
              htmlFor="login-username"
              className="mb-tight block text-label tracking-[0.06em] text-muted uppercase"
            >
              Usuario
            </label>
            <input
              id="login-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              required
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? 'login-error' : undefined}
              className={`${fieldClass} ${fieldBorder(invalid)}`}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-tight block text-label tracking-[0.06em] text-muted uppercase"
            >
              Contraseña
            </label>
            <div className="relative flex">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? 'login-error' : undefined}
                className={`${fieldClass} pr-[calc(var(--spacing-hero)+var(--spacing-page)+var(--spacing-tight))] ${fieldBorder(invalid)}`}
              />
              {/* "Mostrar" is a quiet control inside the field: secondary text, no fill. */}
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-pressed={showPassword}
                aria-controls="login-password"
                aria-label="Mostrar contraseña"
                className={`absolute top-1/2 right-1.5 min-h-8 -translate-y-1/2 rounded-control px-inset py-tight text-meta font-semibold transition-colors hover:text-text ${
                  showPassword ? 'text-accent' : 'text-text-2'
                }`}
              >
                Mostrar
              </button>
            </div>
          </div>

          {invalid && (
            <p
              id="login-error"
              role="alert"
              className="flex items-start gap-inset text-meta text-danger"
            >
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="mt-px flex-none"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7.5v5.5" />
                <path d="M12 16.5h.01" />
              </svg>
              {error}
            </p>
          )}

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
