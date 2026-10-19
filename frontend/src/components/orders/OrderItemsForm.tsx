import { FieldError } from '../FieldError'
import { itemFieldErrorKeys, resolveFieldError } from '../../lib/fieldErrors'
import type { FieldErrorCode } from '../../types/errors'

export type FormItem = {
  clientKey: string
  name: string
  quantity: string
  price: string
}

export function newItem(): FormItem {
  return {
    clientKey: crypto.randomUUID(),
    name: '',
    quantity: '1',
    price: '',
  }
}

type OrderItemsFormProps = {
  items: FormItem[]
  fieldErrors: Record<string, FieldErrorCode>
  inputClass: string
  onAdd: () => void
  onRemove: (index: number) => void
  onItemChange: (
    index: number,
    field: 'name' | 'quantity' | 'price',
    value: string,
  ) => void
}

export function OrderItemsForm({
  items,
  fieldErrors,
  inputClass,
  onAdd: addItem,
  onRemove: removeItem,
  onItemChange: updateItem,
}: OrderItemsFormProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Itens</span>
        <button
          type="button"
          disabled={items.length >= 50}
          onClick={addItem}
          className="text-sm text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Adicionar item
        </button>
      </div>
      <FieldError
        code={resolveFieldError(fieldErrors, 'items')}
        className="mb-2 text-sm text-red-600"
      />
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
                maxLength={100}
                value={item.name}
                onChange={(e) =>
                  updateItem(index, 'name', e.target.value)
                }
                className={inputClass}
              />
              <FieldError
                code={resolveFieldError(
                  fieldErrors,
                  ...itemFieldErrorKeys(index, 'name'),
                )}
              />
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
                  step={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, 'quantity', e.target.value)
                  }
                  className={inputClass}
                />
                <FieldError
                  code={resolveFieldError(
                    fieldErrors,
                    ...itemFieldErrorKeys(index, 'quantity'),
                  )}
                />
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
                  step={0.01}
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, 'price', e.target.value)
                  }
                  className={inputClass}
                />
                <FieldError
                  code={resolveFieldError(
                    fieldErrors,
                    ...itemFieldErrorKeys(index, 'price'),
                  )}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
