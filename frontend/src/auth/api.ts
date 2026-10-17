import { request } from '../api/client'

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type RegisterResponse = {
  id: number
  name: string
  email: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  id?: number
  name?: string
  email?: string
}

export function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}
