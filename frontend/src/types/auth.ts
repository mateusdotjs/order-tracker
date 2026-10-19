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
