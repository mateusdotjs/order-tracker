import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'

export function GuestRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/" replace />
  }

  return children
}
