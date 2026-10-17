import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from './AuthContext'
import { login } from './api'

type LocationState = {
  successMessage?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: saveToken } = useAuth()
  const successMessage = (location.state as LocationState | null)?.successMessage

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      saveToken(data.token)
      navigate('/', { replace: true })
    },
    onError: (error: Error) => {
      setFieldErrors({})
      if (error instanceof ApiError) {
        setGeneralError(error.message)
        if (error.errors) {
          setFieldErrors(error.errors)
        }
        return
      }
      setGeneralError('Não foi possível entrar. Tente novamente.')
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGeneralError(null)
    setFieldErrors({})
    mutation.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Entrar
        </h1>

        {successMessage ? (
          <p className="mb-4 text-sm text-green-600" role="status">
            {successMessage}
          </p>
        ) : null}

        {generalError ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {generalError}
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.email ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
