import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import { setOnUnauthorized } from '../api/client'
import {
  clearStoredToken,
  readStoredToken,
  writeStoredToken,
} from './tokenStorage'

type AuthContextValue = {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() => readStoredToken())

  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
  }, [])

  const login = useCallback((newToken: string) => {
    writeStoredToken(newToken)
    setToken(newToken)
  }, [])

  useEffect(() => {
    setOnUnauthorized(() => {
      logout()
      navigate('/login', { replace: true })
    })
    return () => setOnUnauthorized(null)
  }, [logout, navigate])

  const value = useMemo(
    () => ({ token, login, logout }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
