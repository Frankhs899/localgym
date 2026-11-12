import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, onSessionExpired } from './api.js'
import { AuthContext } from './auth-context.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'loading' | 'authed' | 'anon' — resolved by the boot call to /api/me/.
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    // S2/S19: 200 with the user payload, or 404 without a session.
    let active = true
    api('/api/me/')
      .then((result) => {
        if (active) {
          setUser(result.data)
          setStatus('authed')
        }
      })
      .catch(() => {
        if (active) {
          setStatus('anon')
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    // S11: after a data call 404s, the API client polls /api/me/; if the
    // session is gone it drops the local user so the guards send the person
    // to /login.
    onSessionExpired(() => {
      setUser(null)
      setStatus('anon')
    })
  }, [])

  const login = useCallback(async (username, password) => {
    const result = await api('/api/auth/login/', {
      method: 'POST',
      body: { username, password },
    })
    setUser(result.data)
    setStatus('authed')
  }, [])

  const logout = useCallback(async () => {
    // Defined without a session too (S19); clearing local state always runs.
    try {
      await api('/api/auth/logout/', { method: 'POST' })
    } finally {
      setUser(null)
      setStatus('anon')
    }
  }, [])

  const changePassword = useCallback(
    (currentPassword, newPassword) =>
      api('/api/me/password/', {
        method: 'PUT',
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      }),
    [],
  )

  const value = useMemo(
    () => ({ user, status, login, logout, changePassword }),
    [user, status, login, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
