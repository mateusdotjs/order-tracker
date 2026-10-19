export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'INVALID_REQUEST_BODY'
  | 'INVALID_STATUS'
  | 'INVALID_PARAMETER'
  | 'UNAUTHENTICATED'
  | 'INVALID_CREDENTIALS'
  | 'ORDER_NOT_FOUND'
  | 'EMAIL_ALREADY_USED'
  | 'INTERNAL_ERROR'

export type FieldErrorCode =
  | 'REQUIRED'
  | 'INVALID_EMAIL'
  | 'INVALID_SIZE'
  | 'INVALID_VALUE'
  | 'INVALID_FIELD'

export type ApiErrorBody = {
  code?: string
  message?: string
  errors?: Record<string, string>
}

const ERROR_CODES: readonly ErrorCode[] = [
  'VALIDATION_FAILED',
  'INVALID_REQUEST_BODY',
  'INVALID_STATUS',
  'INVALID_PARAMETER',
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  'ORDER_NOT_FOUND',
  'EMAIL_ALREADY_USED',
  'INTERNAL_ERROR',
]

const FIELD_ERROR_CODES: readonly FieldErrorCode[] = [
  'REQUIRED',
  'INVALID_EMAIL',
  'INVALID_SIZE',
  'INVALID_VALUE',
  'INVALID_FIELD',
]

export function isErrorCode(value: string): value is ErrorCode {
  return (ERROR_CODES as readonly string[]).includes(value)
}

export function isFieldErrorCode(value: string): value is FieldErrorCode {
  return (FIELD_ERROR_CODES as readonly string[]).includes(value)
}

export function parseFieldErrors(
  raw: Record<string, string> | undefined,
): Record<string, FieldErrorCode> | undefined {
  if (!raw) {
    return undefined
  }
  const parsed: Record<string, FieldErrorCode> = {}
  for (const [field, code] of Object.entries(raw)) {
    parsed[field] = isFieldErrorCode(code) ? code : 'INVALID_FIELD'
  }
  return parsed
}
