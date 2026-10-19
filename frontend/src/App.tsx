import { Navigate, Route, Routes } from 'react-router'
import { GuestRoute } from './auth/GuestRoute'
import { LoginPage } from './auth/LoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RegisterPage } from './auth/RegisterPage'
import { NewOrderPage } from './orders/NewOrderPage'
import { OrdersPage } from './orders/OrdersPage'

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/new"
        element={
          <ProtectedRoute>
            <NewOrderPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
