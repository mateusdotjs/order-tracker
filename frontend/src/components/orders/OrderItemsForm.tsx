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

export function fieldError(
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

type OrderItemsFormProps = {
  items: FormItem[]
  fieldErrors: Record<string, string>
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
  )
}
