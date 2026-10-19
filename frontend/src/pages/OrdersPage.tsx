import { useState } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/client'
import { getErrorMessage } from '../constants/errorMessages'
import { OrderList } from '../components/orders/OrderList'
import { useAuth } from '../context/AuthContext'
import { useOrders, useUpdateOrderStatus } from '../hooks/orders'
import type { OrderStatus } from '../types/orders'

export function OrdersPage() {
  const { logout } = useAuth()
  const { data: orders, isLoading, isError, error } = useOrders()
  const updateStatus = useUpdateOrderStatus()
  const [statusErrorById, setStatusErrorById] = useState<
    Record<number, string>
  >({})
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  function handleStatusChange(orderId: number, status: OrderStatus) {
    setStatusErrorById((prev) => {
      const next = { ...prev }
      delete next[orderId]
      return next
    })
    setUpdatingOrderId(orderId)
    updateStatus.mutate(
      { id: orderId, status },
      {
        onSuccess: () => {
          setUpdatingOrderId(null)
        },
        onError: (err: Error) => {
          setUpdatingOrderId(null)
          const message =
            err instanceof ApiError
              ? getErrorMessage(err.code)
              : 'Não foi possível atualizar o status.'
          setStatusErrorById((prev) => ({ ...prev, [orderId]: message }))
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Pedidos</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/orders/new"
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Novo pedido
          </Link>
          <button
            type="button"
            onClick={() => {
              void logout()
            }}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <OrderList
          orders={orders}
          isLoading={isLoading}
          isError={isError}
          error={error}
          statusErrorById={statusErrorById}
          updatingOrderId={updatingOrderId}
          isPending={updateStatus.isPending}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  )
}
