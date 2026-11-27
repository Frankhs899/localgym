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
