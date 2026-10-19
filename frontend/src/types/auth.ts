export type AuthUser = {
  id: number
  name: string
  email: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type RegisterResponse = AuthUser

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = AuthUser
