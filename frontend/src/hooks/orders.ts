import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createOrder,
  fetchOrders,
  updateOrderStatus,
  type UpdateStatusArgs,
} from '../api/orders'
import type { CreateOrderPayload, Order } from '../types/orders'

export const ordersQueryKey = ['orders'] as const

function sortOrdersNewestFirst(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function useOrders() {
  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: fetchOrders,
    select: sortOrdersNewestFirst,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: UpdateStatusArgs) =>
      updateOrderStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey })
    },
  })
}
