import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { AuthLoadingScreen } from './AuthLoadingScreen'

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
