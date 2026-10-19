import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useCreateOrder } from './hooks'
import type { Address } from './types'

type FormItem = {
  clientKey: string
  name: string
  quantity: string
  price: string
}

function newItem(): FormItem {
  return {
    clientKey: crypto.randomUUID(),
    name: '',
    quantity: '1',
    price: '',
  }
}

function fieldError(
  errors: Record<string, string>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    if (errors[key]) {
      return errors[key]
    }
  }
  return undefined
}

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
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mutation = useCreateOrder()

  function updateAddressField(field: keyof Address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  function updateItem(
    index: number,
    field: 'name' | 'quantity' | 'price',
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  function addItem() {
    setItems((prev) => [...prev, newItem()])
  }

  function removeItem(index: number) {
    if (items.length <= 1) {
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault()
    setGeneralError(null)
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
          if (error instanceof ApiError) {
            setGeneralError(error.message)
            if (error.errors) {
              setFieldErrors(error.errors)
            }
            return
          }
          setGeneralError('Não foi possível criar o pedido. Tente novamente.')
        },
      },
    )
  }

  const inputClass =
    'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

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
          {generalError ? (
            <p className="mb-4 text-sm text-red-600" role="alert">
              {generalError}
            </p>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
              />
              {fieldError(fieldErrors, 'customerName') ? (
                <p className="mt-1 text-sm text-red-600">
                  {fieldError(fieldErrors, 'customerName')}
                </p>
              ) : null}
            </div>

            <fieldset className="space-y-3 rounded border border-gray-200 p-3">
              <legend className="px-1 text-sm font-medium text-gray-700">
                Endereço
              </legend>
              <div>
                <label htmlFor="street" className="mb-1 block text-sm text-gray-700">
                  Rua
                </label>
                <input
                  id="street"
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => updateAddressField('street', e.target.value)}
                  className={inputClass}
                />
                {fieldError(fieldErrors, 'address.street') ? (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldError(fieldErrors, 'address.street')}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="number" className="mb-1 block text-sm text-gray-700">
                  Número
                </label>
                <input
                  id="number"
                  type="text"
                  required
                  value={address.number}
                  onChange={(e) => updateAddressField('number', e.target.value)}
                  className={inputClass}
                />
                {fieldError(fieldErrors, 'address.number') ? (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldError(fieldErrors, 'address.number')}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="city" className="mb-1 block text-sm text-gray-700">
                  Cidade
                </label>
                <input
                  id="city"
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => updateAddressField('city', e.target.value)}
                  className={inputClass}
                />
                {fieldError(fieldErrors, 'address.city') ? (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldError(fieldErrors, 'address.city')}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="zip" className="mb-1 block text-sm text-gray-700">
                  CEP
                </label>
                <input
                  id="zip"
                  type="text"
                  required
                  value={address.zip}
                  onChange={(e) => updateAddressField('zip', e.target.value)}
                  className={inputClass}
                />
                {fieldError(fieldErrors, 'address.zip') ? (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldError(fieldErrors, 'address.zip')}
                  </p>
                ) : null}
              </div>
            </fieldset>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Itens</span>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Adicionar item
                </button>
              </div>
              {fieldError(fieldErrors, 'items') ? (
                <p className="mb-2 text-sm text-red-600">
                  {fieldError(fieldErrors, 'items')}
                </p>
              ) : null}
              <ul className="space-y-4">
                {items.map((item, index) => (
                  <li
                    key={item.clientKey}
                    className="space-y-2 rounded border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Item {index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={items.length <= 1}
                        onClick={() => removeItem(index)}
                        className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        Remover
                      </button>
                    </div>
                    <div>
                      <label
                        htmlFor={`item-name-${index}`}
                        className="mb-1 block text-sm text-gray-700"
                      >
                        Nome
                      </label>
                      <input
                        id={`item-name-${index}`}
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, 'name', e.target.value)
                        }
                        className={inputClass}
                      />
                      {fieldError(
                        fieldErrors,
                        `items[${index}].name`,
                        `items.${index}.name`,
                      ) ? (
                        <p className="mt-1 text-sm text-red-600">
                          {fieldError(
                            fieldErrors,
                            `items[${index}].name`,
                            `items.${index}.name`,
                          )}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor={`item-qty-${index}`}
                          className="mb-1 block text-sm text-gray-700"
                        >
                          Quantidade
                        </label>
                        <input
                          id={`item-qty-${index}`}
                          type="number"
                          required
                          min={1}
                          step={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', e.target.value)
                          }
                          className={inputClass}
                        />
                        {fieldError(
                          fieldErrors,
                          `items[${index}].quantity`,
                          `items.${index}.quantity`,
                        ) ? (
                          <p className="mt-1 text-sm text-red-600">
                            {fieldError(
                              fieldErrors,
                              `items[${index}].quantity`,
                              `items.${index}.quantity`,
                            )}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label
                          htmlFor={`item-price-${index}`}
                          className="mb-1 block text-sm text-gray-700"
                        >
                          Preço (R$)
                        </label>
                        <input
                          id={`item-price-${index}`}
                          type="number"
                          required
                          min={0.01}
                          step={0.01}
                          value={item.price}
                          onChange={(e) =>
                            updateItem(index, 'price', e.target.value)
                          }
                          className={inputClass}
                        />
                        {fieldError(
                          fieldErrors,
                          `items[${index}].price`,
                          `items.${index}.price`,
                        ) ? (
                          <p className="mt-1 text-sm text-red-600">
                            {fieldError(
                              fieldErrors,
                              `items[${index}].price`,
                              `items.${index}.price`,
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Salvando…' : 'Criar pedido'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
