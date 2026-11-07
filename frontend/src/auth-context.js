import { createContext, useContext } from 'react'

// The context lives apart from the provider so every file keeps a single
// fast-refreshable export (the provider in auth.jsx, the hook here).
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}
