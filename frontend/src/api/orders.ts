import { request } from './client'
import type {
  CreateOrderPayload,
  Order,
  OrderStatus,
  UpdateOrderStatusPayload,
} from '../types/orders'

export function fetchOrders(): Promise<Order[]> {
  return request<Order[]>('/orders')
}

export function getOrder(id: number): Promise<Order> {
  return request<Order>(`/orders/${id}`)
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    body: payload,
  })
}

export function updateOrderStatus(
  id: number,
  payload: UpdateOrderStatusPayload,
): Promise<Order> {
  return request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: payload,
  })
}

export type UpdateStatusArgs = {
  id: number
  status: OrderStatus
}
