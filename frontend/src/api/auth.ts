import { request } from './client'
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../types/auth'

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

export function me(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me')
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', {
    method: 'POST',
  })
}
