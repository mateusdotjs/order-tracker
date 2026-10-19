import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError, NetworkError } from '../api/client'
import { NETWORK_ERROR_MESSAGE } from '../constants/errorMessages'
import type { ErrorCode, FieldErrorCode } from '../types/errors'
import { FieldError } from '../components/FieldError'
import { FormGeneralError } from '../components/FormGeneralError'
import { AddressFields } from '../components/orders/AddressFields'
import {
  OrderItemsForm,
  newItem,
  type FormItem,
} from '../components/orders/OrderItemsForm'
import { useCreateOrder } from '../hooks/orders'
import {
  itemFieldErrorKeys,
  resolveFieldError,
  withoutFieldErrors,
} from '../lib/fieldErrors'
import type { Address } from '../types/orders'

export function NewOrderPage() {
  const navigate = useNavigate()

  const [customerName, setCustomerName] = useState('')
  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    city: '',
    zip: '',
  })
  const [items, setItems] = useState<FormItem[]>([newItem()])
  const [generalErrorCode, setGeneralErrorCode] = useState<ErrorCode | null>(
    null,
  )
  const [generalErrorFallback, setGeneralErrorFallback] = useState<
    string | null
  >(null)
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, FieldErrorCode>
  >({})

  const mutation = useCreateOrder()

  function updateAddressField(field: keyof Address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => withoutFieldErrors(prev, `address.${field}`))
  }

  function updateItem(
    index: number,
    field: 'name' | 'quantity' | 'price',
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
    setFieldErrors((prev) =>
      withoutFieldErrors(prev, ...itemFieldErrorKeys(index, field)),
    )
  }

  function addItem() {
    if (items.length >= 50) {
      return
    }
    setItems((prev) => [...prev, newItem()])
  }

  function removeItem(index: number) {
    if (items.length <= 1) {
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleCustomerNameChange(value: string) {
    setCustomerName(value)
    setFieldErrors((prev) => withoutFieldErrors(prev, 'customerName'))
  }

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault()
    setGeneralErrorCode(null)
    setGeneralErrorFallback(null)
    setFieldErrors({})

    mutation.mutate(
      {
        customerName,
        address,
        items: items.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      },
      {
        onSuccess: () => {
          navigate('/', { replace: true })
        },
        onError: (error: Error) => {
          setFieldErrors({})
          setGeneralErrorCode(null)
          setGeneralErrorFallback(null)
          if (error instanceof ApiError) {
            setGeneralErrorCode(error.code)
            if (error.errors) {
              setFieldErrors(error.errors)
            }
            return
          }
          if (error instanceof NetworkError) {
            setGeneralErrorFallback(NETWORK_ERROR_MESSAGE)
            return
          }
          setGeneralErrorFallback(
            'Não foi possível criar o pedido. Tente novamente.',
          )
        },
      },
    )
  }

  const inputClass =
    'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Novo pedido</h1>
        <Link
          to="/"
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="customerName"
                className="mb-1 block text-sm text-gray-700"
              >
                Cliente
              </label>
              <input
                id="customerName"
                type="text"
                maxLength={100}
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                className={inputClass}
              />
              <FieldError
                code={resolveFieldError(fieldErrors, 'customerName')}
              />
            </div>

            <AddressFields
              address={address}
              fieldErrors={fieldErrors}
              inputClass={inputClass}
              onFieldChange={updateAddressField}
            />

            <OrderItemsForm
              items={items}
              fieldErrors={fieldErrors}
              inputClass={inputClass}
              onAdd={addItem}
              onRemove={removeItem}
              onItemChange={updateItem}
            />

            <FormGeneralError
              code={generalErrorCode}
              fallback={generalErrorFallback}
            />

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Salvando…' : 'Criar pedido'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
