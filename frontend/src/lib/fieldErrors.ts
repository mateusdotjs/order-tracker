import type { FieldErrorCode } from '../types/errors'

export function resolveFieldError(
  errors: Record<string, FieldErrorCode>,
  ...keys: string[]
): FieldErrorCode | undefined {
  for (const key of keys) {
    if (errors[key]) {
      return errors[key]
    }
  }
  return undefined
}

export function withoutFieldErrors(
  errors: Record<string, FieldErrorCode>,
  ...keys: string[]
): Record<string, FieldErrorCode> {
  if (keys.length === 0) {
    return errors
  }
  const next = { ...errors }
  for (const key of keys) {
    delete next[key]
  }
  return next
}

export function itemFieldErrorKeys(
  index: number,
  field: 'name' | 'quantity' | 'price',
): [string, string] {
  return [`items[${index}].${field}`, `items.${index}.${field}`]
}
