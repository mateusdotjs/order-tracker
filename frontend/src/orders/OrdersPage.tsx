import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useOrders, useUpdateOrderStatus } from './hooks'
import { StatusBadge } from './StatusBadge'
import {
  ORDER_STATUSES,
  formatAddressShort,
  formatBRL,
  formatDatePtBr,
  orderTotal,
  type Order,
  type OrderStatus,
} from './types'

function OrderCard({
  order,
  onStatusChange,
  statusError,
  isUpdating,
}: {
  order: Order
  onStatusChange: (orderId: number, status: OrderStatus) => void
  statusError: string | null
  isUpdating: boolean
}) {
  const total = orderTotal(order.items)

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Pedido #{order.id}
          </h2>
          <p className="text-sm text-gray-600">{order.customerName}</p>
          <p className="text-sm text-gray-500">
            {formatAddressShort(order.address)} · CEP {order.address.zip}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <StatusBadge status={order.status} />
          <p className="mt-1">{formatDatePtBr(order.createdAt)}</p>
        </div>
      </div>

      <ul className="mb-3 space-y-1 text-sm text-gray-700">
        {order.items.map((item, index) => (
          <li key={`${index}-${item.name}`}>
            {item.name} × {item.quantity} — {formatBRL(item.price)} un.
          </li>
        ))}
      </ul>

      <p className="mb-3 font-medium text-gray-900">
        Total: {formatBRL(total)}
      </p>

      <div>
        <label
          htmlFor={`status-${order.id}`}
          className="mb-1 block text-sm text-gray-700"
        >
          Alterar status
        </label>
        <select
          id={`status-${order.id}`}
          value={order.status}
          disabled={isUpdating}
          onChange={(e) =>
            onStatusChange(order.id, e.target.value as OrderStatus)
          }
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {ORDER_STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {statusError ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {statusError}
          </p>
        ) : null}
      </div>
    </article>
  )
}

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
              ? err.message
              : 'Não foi possível atualizar o status.'
          setStatusErrorById((prev) => ({ ...prev, [orderId]: message }))
        },
      },
    )
  }

  let listContent: ReactNode

  if (isLoading) {
    listContent = (
      <p className="text-center text-gray-600" role="status">
        Carregando pedidos…
      </p>
    )
  } else if (isError) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Não foi possível carregar os pedidos.'
    listContent = (
      <p className="text-center text-red-600" role="alert">
        {message}
      </p>
    )
  } else if (!orders?.length) {
    listContent = (
      <p className="text-center text-gray-600">Nenhum pedido cadastrado.</p>
    )
  } else {
    listContent = (
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard
              order={order}
              onStatusChange={handleStatusChange}
              statusError={statusErrorById[order.id] ?? null}
              isUpdating={
                updatingOrderId === order.id && updateStatus.isPending
              }
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Pedidos</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/orders/new"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Novo pedido
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{listContent}</main>
    </div>
  )
}
