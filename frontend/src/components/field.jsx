// design/system.md § Formularios — the artboard's field (`03-login.html`): panel
// surface, one hairline below it, 36 px tall so the control height lands on the
// base-4 scale instead of on the padding, and the text tier stated here instead
// of inherited (the base layer deliberately sets no colour on `body`, L34).
// No `outline-none` here: the artboard's focus ring comes from `:focus-visible`,
// and suppressing the outline is what made the ring invisible while the measured
// `outline-color` still read `--color-accent`. `leading-4` is the artboard's own
// `line-height:16px` on the control: without it the inherited 1.45 makes the field
// 38.3 px and the `min-height` never binds.
//
// One owner for the contract above: `pages/Login.jsx` and `pages/Perfil.jsx` used
// to carry byte-identical copies, so a change to either could drift silently
// (R2-001/R2-002, S2).
const fieldClass =
  'min-h-[36px] w-full rounded-control border bg-panel px-stack py-inset text-body leading-4 text-text'

const fieldBorder = (invalid) =>
  invalid ? 'border-danger' : 'border-line-strong'

const labelClass =
  'mb-tight block text-label tracking-[0.06em] text-muted uppercase'

// The control, its label and — on a revealable field — the reveal button and the
// right padding that keeps typed text out from under it. `invalid` is per field:
// it drives the danger border, `aria-invalid` and the `aria-describedby` pointer
// to that field's own error node, so the three cannot disagree (S2).
//
// `error` is the per-field node (Mi perfil, S4): when the field is invalid the
// module renders it with the messages it is given, right under its own control.
// Login leaves it unset on purpose — its one node is a grid child of the form, so
// one server message can carry the whole statement (S3).
export function Field({
  id,
  label,
  invalid = false,
  errorId,
  error,
  revealed = false,
  onToggleReveal,
  type,
  ...inputProps
}) {
  // The reveal control is opt-in: a password field passes a handler, and the field
  // owns the `type` its state flips.
  const reveal = typeof onToggleReveal === 'function'
  const describedBy = invalid && errorId ? errorId : undefined

  const control = (
    <input
      {...inputProps}
      id={id}
      type={reveal ? (revealed ? 'text' : 'password') : type}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`${fieldClass} ${
        reveal
          ? 'pr-[calc(var(--spacing-hero)+var(--spacing-page)+var(--spacing-tight))] '
          : ''
      }${fieldBorder(invalid)}`}
    />
  )

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {reveal ? (
        <div className="relative flex">
          {control}
          {/* "Mostrar" is a quiet control inside the field: secondary text, no fill. */}
          <button
            type="button"
            onClick={onToggleReveal}
            aria-pressed={revealed}
            aria-controls={id}
            aria-label="Mostrar contraseña"
            className={`absolute top-1/2 right-1.5 min-h-8 -translate-y-1/2 rounded-control px-inset py-tight text-meta font-semibold transition-colors hover:text-text ${
              revealed ? 'text-accent' : 'text-text-2'
            }`}
          >
            Mostrar
          </button>
        </div>
      ) : (
        control
      )}
      {invalid && error && (
        <FieldError
          id={errorId}
          messages={error}
          icon={false}
          className="mt-tight"
        />
      )}
    </div>
  )
}

// The error node: `role="alert"`, the id the field above points at, and the
// messages it is given — an array joins with one space, so the caller never
// decides how many of them reach the person (S2/S4). Login deliberately renders
// one node for both fields (S3); Mi perfil renders one per field, icon-less and
// tight under its control, which is what `icon` and `className` are for. Both
// default to Login's presentation, so its node keeps the icon and no margin.
export function FieldError({ id, messages, icon = true, className = '' }) {
  return (
    <p
      id={id}
      role="alert"
      className={
        `flex items-start${icon ? ' gap-inset' : ''} text-meta text-danger` +
        (className ? ` ${className}` : '')
      }
    >
      {icon && (
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
      )}
      {Array.isArray(messages) ? messages.join(' ') : messages}
    </p>
  )
}
