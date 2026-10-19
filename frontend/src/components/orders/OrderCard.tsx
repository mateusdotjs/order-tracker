import { Link } from 'react-router'
import { OrderStatusSelect } from './OrderStatusSelect'
import { StatusBadge } from './StatusBadge'
import { truncateText } from '../../lib/truncateText'
import {
  formatAddressShort,
  formatBRL,
  formatDatePtBr,
  orderTotal,
  type Order,
  type OrderStatus,
} from '../../types/orders'

const ORDER_TITLE_MAX_LENGTH = 45

export function OrderCard({
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
  const orderTitle = `Pedido de ${order.customerName}`
  const displayTitle = truncateText(orderTitle, ORDER_TITLE_MAX_LENGTH)

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <header className="mb-3 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-0 flex-1">
            <h2
              className="text-lg font-semibold text-gray-900"
              title={
                orderTitle.length > ORDER_TITLE_MAX_LENGTH
                  ? orderTitle
                  : undefined
              }
            >
              {displayTitle}
            </h2>
            <span className="text-xs text-gray-400">
              ID do pedido: #{order.id}
            </span>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
            <Link
              to={`/orders/${order.id}`}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Detalhes
            </Link>
            <StatusBadge status={order.status} />
            <time
              dateTime={order.createdAt}
              className="whitespace-nowrap text-sm text-gray-500"
            >
              {formatDatePtBr(order.createdAt)}
            </time>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {formatAddressShort(order.address)} · CEP {order.address.zip}
        </p>
      </header>

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

      <OrderStatusSelect
        orderId={order.id}
        status={order.status}
        disabled={isUpdating}
        errorMessage={statusError}
        onChange={onStatusChange}
      />
    </article>
  )
}
