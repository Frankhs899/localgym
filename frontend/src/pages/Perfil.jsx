import { useState } from 'react'
import PageShell from '../components/PageShell.jsx'
import { useAuth } from '../auth-context.js'
import { Field } from '../components/field.jsx'

// The field control itself lives in `components/field.jsx` (S2): this screen used
// to carry a byte-identical copy, so a change to either could drift silently.
// Only the definition rows and the role chip below are this screen's own.

// Definition row, the artboard's `.defrow`: label in a fixed 150px column at
// desktop, stacked above the value on phone (artboard rule at 700px).
const defRow = (edge) =>
  [
    'grid items-start gap-tight py-inset [overflow-wrap:anywhere]',
    'sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-stack',
    edge === 'first' ? 'pt-0' : '',
    edge === 'last' ? 'pb-0' : 'border-b border-line',
  ]
    .filter(Boolean)
    .join(' ')

const defLabel = 'text-label uppercase tracking-[0.06em] text-muted'
const defValue = 'min-w-0 text-body text-text'

// The artboard's quiet role chip (`04-perfil.html` pagehead): the `--color-off-*`
// tokens, never the accent.
const roleChip =
  'inline-flex items-center rounded-pill border border-off-line bg-off-bg px-inset py-tight text-meta font-semibold text-off-text'

export default function Perfil() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  // One reveal state per field, so the control toggles only its own field (S5).
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [fieldErrors, setFieldErrors] = useState(null)
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState(false)
  const [busy, setBusy] = useState(false)

  const currentInvalid = Boolean(fieldErrors?.current_password)
  const newInvalid = Boolean(fieldErrors?.new_password)

  // The clearing rule, in one place for this screen (S7): a change removes that
  // field's key from `fieldErrors` as the value changes, so its border, its
  // `aria-invalid`/`aria-describedby` wiring and its node all go together — they
  // are three readings of one key — while the other field keeps its own. The
  // form-level `error` node and the success line are different state and are not
  // touched here. It lives on the screen and not in `components/field.jsx`
  // because the keyed state is this screen's: the module renders from a flag (S2).
  function edit(field, setValue) {
    return (event) => {
      setValue(event.target.value)
      setFieldErrors((errors) => {
        if (!errors || !errors[field]) {
          return errors
        }
        const rest = Object.fromEntries(
          Object.entries(errors).filter(([key]) => key !== field),
        )
        // `null` stays the one representation of "no field errors" (the submit
        // reset above sets it), so an empty object never leaks into that slot.
        return Object.keys(rest).length > 0 ? rest : null
      })
    }
  }

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
      {/* The artboard's pagehead pairs the title with the role chip; PageShell owns
          the `h1`, so the chip hugs it from the children side (-mt-2 keeps it
          inside the title gap instead of opening a new block). */}
      <p className="-mt-2">
        <span className={roleChip}>{user.role_display}</span>
      </p>

      {/* Account data: only what `user_payload()` returns, in the artboard's
          definition-row pattern. No invented fields or placeholder rows. */}
      <section className="mt-group rounded-panel border border-line-strong bg-panel p-stack sm:p-group">
        <h2 className="mb-stack font-display text-head font-semibold text-text">
          Datos de la cuenta
        </h2>
        <dl>
          <div className={defRow('first')}>
            <dt className={defLabel}>Nombre completo</dt>
            <dd className={defValue}>
              {user.first_name} {user.last_name}
            </dd>
          </div>
          <div className={defRow()}>
            <dt className={defLabel}>Usuario</dt>
            <dd className={defValue}>{user.username}</dd>
          </div>
          <div className={defRow('last')}>
            <dt className={defLabel}>Rol</dt>
            <dd className={defValue}>{user.role_display}</dd>
          </div>
        </dl>
      </section>

      {/* The artboard's "Sesión" block says the administrator resets the password,
          but the product has a working form (`PUT /api/me/password/`), so it stays —
          painted as the Login card. */}
      <form
        onSubmit={handleSubmit}
        className="mt-group grid max-w-md gap-group rounded-panel border border-line-strong bg-panel p-section"
      >
        <h2 className="font-display text-head font-semibold text-text">
          Cambiar contraseña
        </h2>

        <Field
          id="perfil-current"
          label="Contraseña actual"
          value={currentPassword}
          onChange={edit('current_password', setCurrentPassword)}
          autoComplete="current-password"
          required
          invalid={currentInvalid}
          errorId="perfil-current-error"
          error={fieldErrors?.current_password}
          revealed={showCurrent}
          onToggleReveal={() => setShowCurrent((shown) => !shown)}
        />

        <Field
          id="perfil-new"
          label="Nueva contraseña"
          value={newPassword}
          onChange={edit('new_password', setNewPassword)}
          autoComplete="new-password"
          required
          invalid={newInvalid}
          errorId="perfil-new-error"
          error={fieldErrors?.new_password}
          revealed={showNew}
          onToggleReveal={() => setShowNew((shown) => !shown)}
        />

        {error && (
          <p role="alert" className="text-meta text-danger">
            {error}
          </p>
        )}
        {updated && (
          <p role="status" className="text-meta text-ok-text">
            Contraseña actualizada.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="min-h-[36px] w-full rounded-control bg-accent px-inset py-tight text-body font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </PageShell>
  )
}
