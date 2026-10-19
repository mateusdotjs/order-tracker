import type { ReactNode } from 'react'
import { ApiError } from '../../api/client'
import { getErrorMessage } from '../../constants/errorMessages'
import type { Order, OrderStatus } from '../../types/orders'
import { OrderCard } from './OrderCard'

type OrderListProps = {
  orders: Order[] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  statusErrorById: Record<number, string>
  updatingOrderId: number | null
  isPending: boolean
  onStatusChange: (orderId: number, status: OrderStatus) => void
}

export function OrderList({
  orders,
  isLoading,
  isError,
  error,
  statusErrorById,
  updatingOrderId,
  isPending,
  onStatusChange,
}: OrderListProps) {
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
        ? getErrorMessage(error.code)
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
              onStatusChange={onStatusChange}
              statusError={statusErrorById[order.id] ?? null}
              isUpdating={updatingOrderId === order.id && isPending}
            />
          </li>
        ))}
      </ul>
    )
  }

  return listContent
}
