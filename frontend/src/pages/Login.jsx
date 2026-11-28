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
  // S7: one flag per field. The shared message below is a single statement about
  // the credentials as a pair, so it stays one node (S3); only the per-field
  // invalidity splits, because clearing it is per field.
  const [invalidFields, setInvalidFields] = useState({
    username: false,
    password: false,
  })
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setInvalidFields({ username: false, password: false })
    setBusy(true)
    try {
      await login(username.trim(), password)
      navigate('/', { replace: true })
    } catch (apiError) {
      // S8: Spanish, visible; the backend never says which part failed.
      setError(apiError.message)
      // The artboard marks one field red, but the backend never says which
      // credential was wrong (`apps/accounts/views.py`), so both fields are marked
      // invalid and the single message carries the whole statement. Each flag then
      // clears on its own field's next change (S7).
      setInvalidFields({ username: true, password: true })
    } finally {
      setBusy(false)
    }
  }

  // The clearing rule, in one place for this screen (S7): a change clears that
  // field's flag as the value changes and touches nothing else, so the other
  // field keeps its border, its wiring and the shared message while it is still
  // invalid. It lives here and not in `components/field.jsx` because the state it
  // clears is this screen's — the module only renders the three consequences of a
  // flag it is given (S2).
  function edit(field, setValue) {
    return (event) => {
      setValue(event.target.value)
      setInvalidFields((fields) =>
        fields[field] ? { ...fields, [field]: false } : fields,
      )
    }
  }

  // The one shared node below stays while either field is still marked invalid,
  // which is what keeps the statement from vanishing with the first keystroke (S7).
  const anyInvalid = invalidFields.username || invalidFields.password

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
            onChange={edit('username', setUsername)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            required
            invalid={invalidFields.username}
            errorId="login-error"
          />

          <Field
            id="login-password"
            label="Contraseña"
            value={password}
            onChange={edit('password', setPassword)}
            autoComplete="current-password"
            required
            invalid={invalidFields.password}
            errorId="login-error"
            revealed={showPassword}
            onToggleReveal={() => setShowPassword((shown) => !shown)}
          />

          {anyInvalid && <FieldError id="login-error" messages={error} />}

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
