import { resolveErrorCode } from '../constants/errorMessages'
import {
  parseFieldErrors,
  type ApiErrorBody,
  type ErrorCode,
  type FieldErrorCode,
} from '../types/errors'

export class ApiError extends Error {
  status: number
  code: ErrorCode | null
  errors?: Record<string, FieldErrorCode>

  constructor(
    status: number,
    code: ErrorCode | null,
    errors?: Record<string, FieldErrorCode>,
  ) {
    super('ApiError')
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export class NetworkError extends Error {
  constructor() {
    super('NetworkError')
    this.name = 'NetworkError'
  }
}

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type RequestOptions = {
  method?: string
  body?: unknown
}

function normalizePath(path: string): string {
  if (path.startsWith('http')) {
    try {
      return new URL(path).pathname
    } catch {
      return path
    }
  }
  return path
}

function isAuthSessionPath(path: string): boolean {
  const p = normalizePath(path)
  return (
    p === '/auth/login' ||
    p === '/auth/register' ||
    p === '/auth/logout' ||
    p === '/auth/me'
  )
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new NetworkError()
  }

  const text = await res.text()
  let data: unknown = {}

  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      if (!res.ok) {
        throw new ApiError(res.status, resolveErrorCode(undefined, res.status))
      }
      throw new ApiError(res.status, null)
    }
  }

  if (!res.ok) {
    const errorBody = data as ApiErrorBody
    if (res.status === 401 && !isAuthSessionPath(path)) {
      onUnauthorized?.()
    }
    throw new ApiError(
      res.status,
      resolveErrorCode(errorBody, res.status),
      parseFieldErrors(errorBody.errors),
    )
  }

  return data as T
}
