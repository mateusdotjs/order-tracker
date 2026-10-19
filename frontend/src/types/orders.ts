export type OrderStatus =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO'

export type Address = {
  street: string
  number: string
  city: string
  zip: string
}

export type OrderItem = {
  name: string
  quantity: number
  price: number
}

export type Order = {
  id: number
  customerName: string
  address: Address
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
}

export type CreateOrderPayload = {
  customerName: string
  address: Address
  items: OrderItem[]
}

export type UpdateOrderStatusPayload = {
  status: OrderStatus
}

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'EM_PREPARO', label: 'Em preparo' },
  { value: 'SAIU_PARA_ENTREGA', label: 'Saiu para entrega' },
  { value: 'ENTREGUE', label: 'Entregue' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatBRL(value: number): string {
  return brlFormatter.format(value)
}

export function formatDatePtBr(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatAddressShort(address: Address): string {
  return `${address.street}, ${address.number} — ${address.city}`
}

export function orderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
}

export function statusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status
}
