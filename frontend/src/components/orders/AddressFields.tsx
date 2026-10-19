import { FieldError } from '../FieldError'
import { resolveFieldError } from '../../lib/fieldErrors'
import type { Address } from '../../types/orders'

type AddressFieldsProps = {
  address: Address
  fieldErrors: Record<string, string>
  inputClass: string
  onFieldChange: (field: keyof Address, value: string) => void
}

export function AddressFields({
  address,
  fieldErrors,
  inputClass,
  onFieldChange: updateAddressField,
}: AddressFieldsProps) {
  return (
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
        <FieldError
          message={resolveFieldError(fieldErrors, 'address.street')}
        />
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
        <FieldError
          message={resolveFieldError(fieldErrors, 'address.number')}
        />
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
        <FieldError message={resolveFieldError(fieldErrors, 'address.city')} />
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
        <FieldError message={resolveFieldError(fieldErrors, 'address.zip')} />
      </div>
    </fieldset>
  )
}
