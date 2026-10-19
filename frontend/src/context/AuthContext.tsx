import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import * as authApi from '../api/auth'
import { ApiError, setOnUnauthorized } from '../api/client'
import type { AuthUser, LoginPayload } from '../types/auth'

const ME_QUERY_KEY = ['me'] as const

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchMe(): Promise<AuthUser | null> {
  try {
    return await authApi.me()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user = null, isLoading } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
  })

  const login = useCallback(
    async (payload: LoginPayload) => {
      const loggedInUser = await authApi.login(payload)
      queryClient.setQueryData(ME_QUERY_KEY, loggedInUser)
      return loggedInUser
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        throw error
      }
    }
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [queryClient, navigate])

  useEffect(() => {
    setOnUnauthorized(() => {
      queryClient.clear()
      navigate('/login', { replace: true })
    })
    return () => setOnUnauthorized(null)
  }, [queryClient, navigate])

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
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
