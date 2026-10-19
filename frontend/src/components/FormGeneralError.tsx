import { getErrorMessage } from '../constants/errorMessages'
import type { ErrorCode } from '../types/errors'

type FormGeneralErrorProps = {
  code?: ErrorCode | null
  fallback?: string | null
}

export function FormGeneralError({ code, fallback }: FormGeneralErrorProps) {
  const message =
    code != null ? getErrorMessage(code) : fallback != null ? fallback : null

  if (!message) {
    return null
  }

  return (
    <p className="text-sm text-red-600" role="alert">
      {message}
    </p>
  )
}
