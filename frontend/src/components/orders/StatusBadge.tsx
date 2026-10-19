import type { OrderStatus } from '../../types/orders'
import { statusLabel } from '../../types/orders'

const statusStyles: Record<OrderStatus, string> = {
  RECEBIDO: 'bg-gray-100 text-gray-800',
  EM_PREPARO: 'bg-amber-100 text-amber-900',
  SAIU_PARA_ENTREGA: 'bg-blue-100 text-blue-900',
  ENTREGUE: 'bg-green-100 text-green-900',
  CANCELADO: 'bg-red-100 text-red-900',
}

type StatusBadgeProps = {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabel(status)}
    </span>
  )
}
