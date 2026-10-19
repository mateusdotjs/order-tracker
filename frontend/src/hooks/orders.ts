import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createOrder,
  fetchOrders,
  getOrder,
  updateOrderStatus,
  type UpdateStatusArgs,
} from '../api/orders'
import type { CreateOrderPayload, Order } from '../types/orders'

export const ordersQueryKey = ['orders'] as const

export function orderQueryKey(id: number) {
  return ['orders', id] as const
}

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

export function useOrder(id: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: orderQueryKey(id!),
    queryFn: () => getOrder(id!),
    retry: false,
    enabled: enabled && id != null,
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
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey })
      queryClient.invalidateQueries({ queryKey: orderQueryKey(id) })
    },
  })
}
