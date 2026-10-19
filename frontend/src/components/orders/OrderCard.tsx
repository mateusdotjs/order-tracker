import { StatusBadge } from './StatusBadge'
import {
  ORDER_STATUSES,
  formatAddressShort,
  formatBRL,
  formatDatePtBr,
  orderTotal,
  type Order,
  type OrderStatus,
} from '../../types/orders'

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

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <header className="mb-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h2 className="min-w-0 flex-1 text-lg font-semibold text-gray-900">
            Pedido de {order.customerName}
          </h2>
          <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
            <span className="text-xs text-gray-400">ID do pedido: #{order.id}</span>
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
