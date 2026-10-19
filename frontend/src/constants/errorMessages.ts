/**
 * User-facing error messages (pt-BR). Keep ErrorCode and FieldErrorCode in sync with
 * api/.../common/ErrorCode.java and FieldErrorCode.java.
 */
import {
  isErrorCode,
  type ApiErrorBody,
  type ErrorCode,
  type FieldErrorCode,
} from '../types/errors'

export const GENERIC_ERROR_MESSAGE = 'Algo deu errado. Tente novamente.'
export const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao servidor'

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: 'Verifique os campos destacados',
  INVALID_REQUEST_BODY: 'Dados inválidos. Verifique o formulário',
  INVALID_STATUS: 'Status inválido',
  INVALID_PARAMETER: 'Parâmetro inválido',
  UNAUTHENTICATED: 'Faça login para continuar',
  INVALID_CREDENTIALS: 'E-mail ou senha inválidos',
  ORDER_NOT_FOUND: 'Pedido não encontrado',
  EMAIL_ALREADY_USED: 'Este e-mail já está cadastrado',
  INTERNAL_ERROR: 'Erro inesperado. Tente novamente',
}

const FIELD_ERROR_MESSAGES: Record<FieldErrorCode, string> = {
  REQUIRED: 'Campo obrigatório',
  INVALID_EMAIL: 'E-mail inválido',
  INVALID_SIZE: 'Tamanho fora do permitido',
  INVALID_VALUE: 'Valor inválido',
  INVALID_FIELD: 'Campo inválido',
}

export function getErrorMessage(code: ErrorCode | null | undefined): string {
  if (code == null) {
    return GENERIC_ERROR_MESSAGE
  }
  return ERROR_MESSAGES[code] ?? GENERIC_ERROR_MESSAGE
}

export function getFieldErrorMessage(
  code: FieldErrorCode | null | undefined,
): string {
  if (code == null) {
    return GENERIC_ERROR_MESSAGE
  }
  return FIELD_ERROR_MESSAGES[code] ?? GENERIC_ERROR_MESSAGE
}

export function resolveErrorCode(
  body: ApiErrorBody | undefined,
  status: number,
): ErrorCode | null {
  if (body?.code && isErrorCode(body.code)) {
    return body.code
  }
  if (status === 401) {
    return 'UNAUTHENTICATED'
  }
  if (status === 500) {
    return 'INTERNAL_ERROR'
  }
  return null
}
