import { ORDER_STATUSES, type OrderStatus } from '../../types/orders'

type OrderStatusSelectProps = {
  orderId: number
  status: OrderStatus
  disabled: boolean
  errorMessage: string | null
  onChange: (orderId: number, status: OrderStatus) => void
}

export function OrderStatusSelect({
  orderId,
  status,
  disabled,
  errorMessage,
  onChange,
}: OrderStatusSelectProps) {
  return (
    <div>
      <label
        htmlFor={`status-${orderId}`}
        className="mb-1 block text-sm text-gray-700"
      >
        Alterar status
      </label>
      <select
        id={`status-${orderId}`}
        value={status}
        disabled={disabled}
        onChange={(e) =>
          onChange(orderId, e.target.value as OrderStatus)
        }
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {ORDER_STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {errorMessage ? (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
