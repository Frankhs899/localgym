import { expect, test } from '@playwright/test'

// R3-001 (L41): the field contract that `pages/Login.jsx` and `pages/Perfil.jsx`
// copy by hand is documented in a comment and asserted nowhere, so the three
// regressions T7 actually measured are unguarded. Each probe below rebuilds the
// exact failure it guards against and asserts on the *painted* result — computed
// style and geometry — never on the class string that would produce it.

// `/api/me/` decides which screen the SPA boots into (`auth.jsx:12-28`): 200 lands
// on the shell, 404 on Login. Stubbing it keeps the suite free of a backend.
const USER = {
  id: 1,
  username: 'ana',
  first_name: 'Ana',
  last_name: 'Gómez',
  role: 'admin',
  role_display: 'Administradora',
}

async function boot(page, { authed }) {
  await page.route('**/api/me/', (route) =>
    authed
      ? route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(USER),
        })
      : route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: '{}',
        }),
  )
}

// Keyboard focus is the user path that paints `:focus-visible`, and walking to the
// field with Tab also proves the control is reachable without a pointer.
async function tabUntilFocused(page, id, limit = 25) {
  for (let presses = 1; presses <= limit; presses += 1) {
    await page.keyboard.press('Tab')
    const activeId = await page.evaluate(() => document.activeElement?.id ?? '')
    if (activeId === id) {
      return
    }
  }
  throw new Error(`keyboard focus never reached #${id} in ${limit} tabs`)
}

function outlineOf(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      style: style.outlineStyle,
      width: style.outlineWidth,
      color: style.outlineColor,
    }
  })
}

// Typed text against the surface it is actually painted on: the field's computed
// colour, the first opaque ancestor background, and their WCAG contrast ratio.
function textContrastOf(locator) {
  return locator.evaluate((element) => {
    const channels = (value) => value.match(/[\d.]+/g).map(Number)
    const toLinear = (channel) => {
      const scaled = channel / 255
      return scaled <= 0.03928
        ? scaled / 12.92
        : ((scaled + 0.055) / 1.055) ** 2.4
    }
    const luminance = (value) => {
      const [r, g, b] = channels(value)
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    }

    const foreground = getComputedStyle(element).color
    let node = element
    let background = 'rgb(0, 0, 0)'
    while (node) {
      const candidate = getComputedStyle(node).backgroundColor
      const parsed = channels(candidate)
      const alpha = parsed.length > 3 ? parsed[3] : 1
      if (alpha > 0) {
        background = candidate
        break
      }
      node = node.parentElement
    }

    const lighter = Math.max(luminance(foreground), luminance(background))
    const darker = Math.min(luminance(foreground), luminance(background))
    return {
      foreground,
      background,
      ratio: (lighter + 0.05) / (darker + 0.05),
    }
  })
}

// The invalid wiring, read as the browser sees it: `null` is the attribute being
// absent, which is what "stops asserting invalidity" means in markup.
function ariaStateOf(locator) {
  return locator.evaluate((element) => ({
    invalid: element.getAttribute('aria-invalid'),
    describedBy: element.getAttribute('aria-describedby'),
  }))
}

function borderOf(locator) {
  return locator.evaluate(
    (element) => getComputedStyle(element).borderTopColor,
  )
}

// The reveal control's four readings, as the browser exposes them. It used to
// carry a static "Mostrar" in both states (R3-001/L39): the label promised to
// show a password that was already shown, while `aria-pressed` disagreed with
// it. `type` is read as the attribute the module renders, so "password" and
// "text" are what the field actually is.
const REVEAL_HIDDEN = {
  text: 'Mostrar',
  label: 'Mostrar contraseña',
  pressed: 'false',
  type: 'password',
}
const REVEAL_SHOWN = {
  text: 'Ocultar',
  label: 'Ocultar contraseña',
  pressed: 'true',
  type: 'text',
}

// `aria-controls` is the contract that ties one control to one field, and it is
// also how each of the three password fields finds its own control (Login's and
// Mi perfil's two).
function revealControl(page, fieldId) {
  return page.locator(`button[aria-controls="${fieldId}"]`)
}

async function revealStateOf(page, fieldId) {
  const control = revealControl(page, fieldId)
  return {
    text: (await control.textContent()).trim(),
    label: await control.getAttribute('aria-label'),
    pressed: await control.getAttribute('aria-pressed'),
    type: await page.locator(`#${fieldId}`).getAttribute('type'),
  }
}

// Pressing the control flips all four readings together, and pressing it again
// returns them all to where they started — never a half-revealed control whose
// label, state attribute and field type disagree.
async function checkRevealSwap(page, fieldId) {
  const control = revealControl(page, fieldId)
  await expect(control).toBeVisible()
  expect(await revealStateOf(page, fieldId), `${fieldId} before the click`).toEqual(
    REVEAL_HIDDEN,
  )
  await control.click()
  expect(await revealStateOf(page, fieldId), `${fieldId} after the click`).toEqual(
    REVEAL_SHOWN,
  )
  await control.click()
  expect(
    await revealStateOf(page, fieldId),
    `${fieldId} after the second click`,
  ).toEqual(REVEAL_HIDDEN)
}

// The band the field must keep clear is token-derived, so the probe resolves the
// token through CSS itself: the declared value is a `calc()` over
// `--spacing-unit`, and parsing that algebra here would let the probe and the
// stylesheet drift apart. An element asked to paint the token reports pixels.
function tightPixels(page) {
  return page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.paddingRight = 'var(--spacing-tight)'
    document.body.append(probe)
    const pixels = Number.parseFloat(getComputedStyle(probe).paddingRight)
    probe.remove()
    return pixels
  })
}

// Painted geometry, not declarations: the field's right padding and the reveal
// control's own width, both as the browser laid them out.
function reserveOf(page, fieldId) {
  return page.evaluate((id) => {
    const field = document.getElementById(id)
    const control = document.querySelector(`button[aria-controls="${id}"]`)
    return {
      paddingRight: Number.parseFloat(getComputedStyle(field).paddingRight),
      controlWidth: control.getBoundingClientRect().width,
    }
  }, fieldId)
}

// The reservation clears the control plus one `--spacing-tight` gap in the label
// state it is measured in. Shrinking the reservation under the control's own
// width is exactly the failure this asserts against (R2-magic-pr-padding/L39).
async function checkReservation(page, fieldId, stateName, tight) {
  const { paddingRight, controlWidth } = await reserveOf(page, fieldId)
  expect(controlWidth, `${fieldId} (${stateName}) control width`).toBeGreaterThan(
    0,
  )
  expect(
    paddingRight,
    `${fieldId} (${stateName}) right padding`,
  ).toBeGreaterThanOrEqual(controlWidth + tight)
}

const TOKEN_TEXT = 'rgb(243, 245, 247)' // --color-text #f3f5f7
const TOKEN_ACCENT = 'rgb(239, 255, 0)' // --color-accent #efff00
const TOKEN_DANGER = 'rgb(255, 122, 110)' // --color-danger #ff7a6e
const TOKEN_LINE_STRONG = 'rgb(46, 51, 58)' // --color-line-strong #2e333a

test('P1 · the field is 36 px tall, so `min-height` binds on the base-4 scale', async ({
  page,
}) => {
  // `min-h-[36px]` only binds while the control's line-height is the artboard's
  // 16 px. With the inherited `body` 1.45 the field measures 38.3 px and the
  // `min-height` never does anything — the failure L38 recorded, still reachable
  // by deleting one class.
  await boot(page, { authed: false })
  await page.goto('/login')
  const loginField = page.locator('#login-username')
  await expect(loginField).toBeVisible()
  const login = await loginField.evaluate((element) => ({
    lineHeight: getComputedStyle(element).lineHeight,
    minHeight: getComputedStyle(element).minHeight,
  }))
  expect(login.minHeight).toBe('36px')
  expect(login.lineHeight).toBe('16px')
  expect((await loginField.boundingBox()).height).toBe(36)

  // The same contract on the other screen, because `fieldClass` there is a copy
  // and not an import: that duplicate is what can drift silently (R2-001).
  await boot(page, { authed: true })
  await page.goto('/perfil')
  const perfilField = page.locator('#perfil-current')
  await expect(perfilField).toBeVisible()
  const perfil = await perfilField.evaluate((element) => ({
    lineHeight: getComputedStyle(element).lineHeight,
    minHeight: getComputedStyle(element).minHeight,
  }))
  expect(perfil.minHeight).toBe('36px')
  expect(perfil.lineHeight).toBe('16px')
  expect((await perfilField.boundingBox()).height).toBe(36)
})

test('P2 · keyboard focus paints the accent ring', async ({ page }) => {
  // The ring is `[&_*:focus-visible]:outline-*` on the screen root. `focus:outline-none`
  // used to set `outline-style: none` while `outline-color` still measured the
  // accent token, so every style-based check passed and nothing was painted (L38).
  await boot(page, { authed: false })
  await page.goto('/login')
  await expect(page.locator('#login-username')).toBeVisible()
  await tabUntilFocused(page, 'login-username')
  const loginRing = await outlineOf(page.locator('#login-username'))
  expect(loginRing.style).not.toBe('none')
  expect(loginRing.width).toBe('2px')
  expect(loginRing.color).toBe(TOKEN_ACCENT)

  // Mi perfil renders inside the shell, which owns the ring for that subtree
  // (`components/Shell.jsx`), so it needs its own reading.
  await boot(page, { authed: true })
  await page.goto('/perfil')
  await expect(page.locator('#perfil-current')).toBeVisible()
  await tabUntilFocused(page, 'perfil-current')
  const perfilRing = await outlineOf(page.locator('#perfil-current'))
  expect(perfilRing.style).not.toBe('none')
  expect(perfilRing.width).toBe('2px')
  expect(perfilRing.color).toBe(TOKEN_ACCENT)
})

test('P3 · typed text resolves to the text token and stays legible on the field', async ({
  page,
}) => {
  // The base layer deliberately sets no colour on `body` (L34), so the tier that
  // reaches typed text comes from the painted subtree. This asserts the outcome and
  // not the declaration: the colour typed text actually gets is the text token, and
  // it clears 4.5:1 against the field's own painted background. When the field went
  // light, near-white text landed on it at 1.08:1 and typed credentials were
  // invisible. Measured while writing this (RED check): a light *card* around a
  // still-dark field is not a failure, and deleting the field's `text-text` is not
  // one either while the screen root states the tier — the ratio is what bites.
  await boot(page, { authed: false })
  await page.goto('/login')
  const loginField = page.locator('#login-username')
  await expect(loginField).toBeVisible()
  await loginField.fill('recepcion')
  const login = await textContrastOf(loginField)
  expect(login.foreground).toBe(TOKEN_TEXT)
  expect(login.ratio).toBeGreaterThanOrEqual(4.5)

  await boot(page, { authed: true })
  await page.goto('/perfil')
  const perfilField = page.locator('#perfil-current')
  await expect(perfilField).toBeVisible()
  await perfilField.fill('secreta')
  const perfil = await textContrastOf(perfilField)
  expect(perfil.foreground).toBe(TOKEN_TEXT)
  expect(perfil.ratio).toBeGreaterThanOrEqual(4.5)
})

test('P4 · typing in a field clears that field’s error and nothing else', async ({
  page,
}) => {
  // The invalid state used to outlive the value that produced it: after a failed
  // submit the danger border, `aria-invalid` and the message stayed on both fields
  // while the person was already correcting one of them (R3-002/L41). The rule is
  // per field — the corrected field stops asserting invalidity in all three places
  // and the other field keeps all three, because only that field is still wrong.

  // Login: one server message marks both fields invalid (S3), so this screen is
  // the one where clearing must not take the shared statement with it.
  await boot(page, { authed: false })
  await page.route('**/api/auth/login/', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Usuario o contraseña incorrectos.' }),
    }),
  )
  await page.goto('/login')
  const loginUser = page.locator('#login-username')
  const loginPass = page.locator('#login-password')
  const loginError = page.locator('#login-error')
  await loginUser.fill('ana')
  await loginPass.fill('mala')
  await page.getByRole('button', { name: 'Entrar' }).click()

  // The failed submit marks both fields and paints the one shared node.
  await expect(loginError).toBeVisible()
  await expect(loginError).toHaveText('Usuario o contraseña incorrectos.')
  expect(await borderOf(loginUser)).toBe(TOKEN_DANGER)
  expect(await borderOf(loginPass)).toBe(TOKEN_DANGER)
  expect(await ariaStateOf(loginUser)).toEqual({
    invalid: 'true',
    describedBy: 'login-error',
  })
  expect(await ariaStateOf(loginPass)).toEqual({
    invalid: 'true',
    describedBy: 'login-error',
  })

  // One typed character in the first field clears that field only.
  await loginUser.press('x')
  expect(await borderOf(loginUser)).toBe(TOKEN_LINE_STRONG)
  expect(await ariaStateOf(loginUser)).toEqual({
    invalid: null,
    describedBy: null,
  })
  expect(await borderOf(loginPass)).toBe(TOKEN_DANGER)
  expect(await ariaStateOf(loginPass)).toEqual({
    invalid: 'true',
    describedBy: 'login-error',
  })
  await expect(loginError).toBeVisible()

  // Typing in the second field leaves no invalid field, so the node goes too.
  await loginPass.press('x')
  expect(await borderOf(loginPass)).toBe(TOKEN_LINE_STRONG)
  expect(await ariaStateOf(loginPass)).toEqual({
    invalid: null,
    describedBy: null,
  })
  await expect(loginError).toHaveCount(0)

  // Mi perfil: one node per field (S4), and the form-level node belongs to a
  // whole-request failure — it is not painted on this per-field path, so the
  // alert count below is the check that nothing extra appears as one clears.
  await boot(page, { authed: true })
  await page.route('**/api/me/password/', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        current_password: ['La contraseña actual no es correcta.'],
        new_password: ['Muy corta.', 'Usá al menos 8 caracteres.'],
      }),
    }),
  )
  await page.goto('/perfil')
  const perfilCurrent = page.locator('#perfil-current')
  const perfilNew = page.locator('#perfil-new')
  const currentError = page.locator('#perfil-current-error')
  const newError = page.locator('#perfil-new-error')
  await perfilCurrent.fill('vieja')
  await perfilNew.fill('1234')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()

  await expect(currentError).toHaveText('La contraseña actual no es correcta.')
  await expect(newError).toHaveText('Muy corta. Usá al menos 8 caracteres.')
  await expect(page.getByRole('alert')).toHaveCount(2)
  expect(await borderOf(perfilCurrent)).toBe(TOKEN_DANGER)
  expect(await borderOf(perfilNew)).toBe(TOKEN_DANGER)

  // One typed character clears the current-password field only: its key leaves
  // `fieldErrors`, which drops its border, its wiring and its node together.
  await perfilCurrent.press('x')
  expect(await borderOf(perfilCurrent)).toBe(TOKEN_LINE_STRONG)
  expect(await ariaStateOf(perfilCurrent)).toEqual({
    invalid: null,
    describedBy: null,
  })
  await expect(currentError).toHaveCount(0)
  expect(await borderOf(perfilNew)).toBe(TOKEN_DANGER)
  expect(await ariaStateOf(perfilNew)).toEqual({
    invalid: 'true',
    describedBy: 'perfil-new-error',
  })
  await expect(newError).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(1)

  await perfilNew.press('x')
  expect(await borderOf(perfilNew)).toBe(TOKEN_LINE_STRONG)
  expect(await ariaStateOf(perfilNew)).toEqual({
    invalid: null,
    describedBy: null,
  })
  await expect(newError).toHaveCount(0)
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('P5 · the reveal label follows the state on all three password fields', async ({
  page,
}) => {
  // S11 probe (a)/S5. The label is the control's promise: while the password is
  // hidden it offers to show it, and while it is shown it offers to hide it, with
  // `aria-label` following the visible text and `aria-pressed` kept as the state
  // (the owner's chosen pattern, not the toggle-only one where the name never
  // changes). All three fields are checked because the control has one
  // implementation in `components/field.jsx` and two screens render it.

  await boot(page, { authed: false })
  await page.goto('/login')
  await expect(page.locator('#login-password')).toBeVisible()
  await checkRevealSwap(page, 'login-password')

  await boot(page, { authed: true })
  await page.goto('/perfil')
  await expect(page.locator('#perfil-current')).toBeVisible()
  await checkRevealSwap(page, 'perfil-current')
  await checkRevealSwap(page, 'perfil-new')
})

test('P6 · the field reserves room for the reveal control in both label states', async ({
  page,
}) => {
  // S11 probe (c)/S6. The password field carries a token-derived `calc()` on its
  // right padding so typed text cannot run under the reveal control. The label
  // now changes width with its state, so the reservation is measured in both —
  // "Ocultar" is not "Mostrar" and a reservation sized for one of them would
  // let typed text slide under the other (R2-magic-pr-padding/L39).

  await boot(page, { authed: false })
  await page.goto('/login')
  await expect(page.locator('#login-password')).toBeVisible()
  const tight = await tightPixels(page)
  expect(tight).toBeGreaterThan(0)
  await checkReservation(page, 'login-password', 'Mostrar', tight)
  await revealControl(page, 'login-password').click()
  await checkReservation(page, 'login-password', 'Ocultar', tight)

  await boot(page, { authed: true })
  await page.goto('/perfil')
  await expect(page.locator('#perfil-current')).toBeVisible()
  for (const fieldId of ['perfil-current', 'perfil-new']) {
    await checkReservation(page, fieldId, 'Mostrar', tight)
    await revealControl(page, fieldId).click()
    await checkReservation(page, fieldId, 'Ocultar', tight)
  }
})
