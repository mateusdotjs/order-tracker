import { readStoredToken } from '../context/tokenStorage'

export type ApiErrorBody = {
  message?: string
  errors?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string>

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
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

function isLoginPath(path: string): boolean {
  return path === '/auth/login' || path.endsWith('/auth/login')
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body } = options
  const headers: Record<string, string> = {}

  const token = readStoredToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data: unknown = {}

  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      if (!res.ok) {
        throw new ApiError(text || 'Request failed', res.status)
      }
      throw new ApiError('Invalid JSON response', res.status)
    }
  }

  if (!res.ok) {
    const errorBody = data as ApiErrorBody
    if (res.status === 401 && !isLoginPath(path)) {
      onUnauthorized?.()
    }
    throw new ApiError(
      errorBody.message ?? 'Request failed',
      res.status,
      errorBody.errors,
    )
  }

  return data as T
}
