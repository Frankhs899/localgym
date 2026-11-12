// API client for the Django session contract (issue #4: S11, S19, S20).

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const CSRF_COOKIE = 'csrftoken'

function readCookie(name) {
  const prefix = `${name}=`
  for (const part of document.cookie.split(';')) {
    const value = part.trim()
    if (value.startsWith(prefix)) {
      return decodeURIComponent(value.slice(prefix.length))
    }
  }
  return null
}

async function ensureCsrfToken() {
  // S20: fetch /api/auth/csrf/ first so the JS-readable csrftoken cookie
  // exists; every write then sends its value as X-CSRFToken. The cookie is
  // re-read per request so a rotation on login is picked up automatically.
  if (!readCookie(CSRF_COOKIE)) {
    await fetch('/api/auth/csrf/', { credentials: 'same-origin' })
  }
  return readCookie(CSRF_COOKIE)
}

let sessionExpiredHandler = null

export function onSessionExpired(handler) {
  sessionExpiredHandler = handler
}

async function reconcileSession() {
  // S11/S19: a data call answered 404 — poll /api/me/ to tell an expired
  // session apart from a genuinely missing resource. Only a 404 here means
  // the session is gone.
  const response = await fetch('/api/me/', { credentials: 'same-origin' })
  if (response.status === 404 && sessionExpiredHandler) {
    sessionExpiredHandler()
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const isWrite = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'
  const headers = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (isWrite) {
    const token = await ensureCsrfToken()
    if (token) {
      headers['X-CSRFToken'] = token
    }
  }
  let response
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0, null)
  }
  if (
    response.status === 404 &&
    path !== '/api/me/' &&
    !path.startsWith('/api/auth/')
  ) {
    try {
      await reconcileSession()
    } catch {
      // Network trouble while polling: report the original 404 below.
    }
  }
  if (response.status === 204) {
    return { status: response.status, data: null }
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      (data && data.detail) ||
      (response.status === 403 && 'Fallo de verificación CSRF.') ||
      (response.status === 404 && 'No encontrado.') ||
      'Ocurrió un error inesperado. Intentá de nuevo.'
    throw new ApiError(message, response.status, data)
  }
  return { status: response.status, data }
}
