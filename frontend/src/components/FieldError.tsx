import { getFieldErrorMessage } from '../constants/errorMessages'
import type { FieldErrorCode } from '../types/errors'

type FieldErrorProps = {
  code?: FieldErrorCode | null
  className?: string
}

const defaultClassName = 'mt-1 text-sm text-red-600'

export function FieldError({ code, className = defaultClassName }: FieldErrorProps) {
  if (!code) {
    return null
  }

  return (
    <p className={className} role="alert">
      {getFieldErrorMessage(code)}
    </p>
  )
}
