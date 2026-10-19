import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError, NetworkError } from '../api/client'
import {
  getErrorMessage,
  NETWORK_ERROR_MESSAGE,
} from '../constants/errorMessages'
import { OrderStatusSelect } from '../components/orders/OrderStatusSelect'
import { StatusBadge } from '../components/orders/StatusBadge'
import { useOrder, useUpdateOrderStatus } from '../hooks/orders'
import {
  formatAddressShort,
  formatBRL,
  formatDatePtBr,
  orderTotal,
  type OrderStatus,
} from '../types/orders'

function parseOrderId(raw: string | undefined): number | null {
  if (raw == null || raw === '') {
    return null
  }
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

function NotFoundContent() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
      <p className="text-gray-700" role="alert">
        {getErrorMessage('ORDER_NOT_FOUND')}
      </p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-800 hover:underline"
      >
        Voltar para pedidos
      </Link>
    </div>
  )
}

export function OrderDetailPage() {
  const { id: idParam } = useParams()
  const orderId = parseOrderId(idParam)
  const queryEnabled = orderId != null

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrder(orderId ?? undefined, queryEnabled)

  const updateStatus = useUpdateOrderStatus()
  const [statusError, setStatusError] = useState<string | null>(null)

  function handleStatusChange(id: number, status: OrderStatus) {
    setStatusError(null)
    updateStatus.mutate(
      { id, status },
      {
        onError: (err: Error) => {
          const message =
            err instanceof ApiError
              ? getErrorMessage(err.code)
              : 'Não foi possível atualizar o status.'
          setStatusError(message)
        },
      },
    )
  }

  const headerTitle =
    orderId != null ? `Pedido #${orderId}` : 'Pedido'

  let mainContent

  if (!queryEnabled) {
    mainContent = <NotFoundContent />
  } else if (isLoading) {
    mainContent = (
      <p className="text-center text-gray-600" role="status">
        Carregando pedidos…
      </p>
    )
  } else if (isError) {
    const isNotFound =
      error instanceof ApiError &&
      (error.code === 'ORDER_NOT_FOUND' || error.status === 404)

    if (isNotFound) {
      mainContent = <NotFoundContent />
    } else {
      const message =
        error instanceof NetworkError
          ? NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
            ? getErrorMessage(error.code)
            : 'Não foi possível carregar o pedido.'
      mainContent = (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-gray-700" role="alert">
            {message}
          </p>
          <button
            type="button"
            onClick={() => {
              void refetch()
            }}
            className="mt-4 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
  } else if (order) {
    const total = orderTotal(order.items)

    mainContent = (
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Pedido #{order.id}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={order.status} />
              <time
                dateTime={order.createdAt}
                className="text-sm text-gray-500"
              >
                {formatDatePtBr(order.createdAt)}
              </time>
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-1 text-sm font-medium text-gray-700">Cliente</h2>
          <p className="text-gray-900">{order.customerName}</p>
        </section>

        <section>
          <h2 className="mb-1 text-sm font-medium text-gray-700">Endereço</h2>
          <p className="text-gray-900">
            {formatAddressShort(order.address)} · CEP {order.address.zip}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-700">Itens</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="pb-2 pr-3 font-medium">Nome</th>
                  <th className="pb-2 pr-3 font-medium">Qtd.</th>
                  <th className="pb-2 pr-3 font-medium">Preço unit.</th>
                  <th className="pb-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr
                    key={`${index}-${item.name}`}
                    className="border-b border-gray-100 text-gray-900"
                  >
                    <td className="py-2 pr-3">{item.name}</td>
                    <td className="py-2 pr-3">{item.quantity}</td>
                    <td className="py-2 pr-3">{formatBRL(item.price)}</td>
                    <td className="py-2 text-right">
                      {formatBRL(item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={3}
                    className="pt-3 text-right font-medium text-gray-700"
                  >
                    Total
                  </td>
                  <td className="pt-3 text-right font-semibold text-gray-900">
                    {formatBRL(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <OrderStatusSelect
          orderId={order.id}
          status={order.status}
          disabled={updateStatus.isPending}
          errorMessage={statusError}
          onChange={handleStatusChange}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{headerTitle}</h1>
        <Link
          to="/"
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Voltar
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{mainContent}</main>
    </div>
  )
}
