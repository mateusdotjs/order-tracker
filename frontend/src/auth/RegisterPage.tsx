import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { register } from './api'

export function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: {
          successMessage: 'Cadastro realizado com sucesso. Faça login.',
        },
      })
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
      setGeneralError('Não foi possível cadastrar. Tente novamente.')
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGeneralError(null)
    setFieldErrors({})
    mutation.mutate({ name, email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Cadastro
        </h1>

        {generalError ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {generalError}
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-gray-700">
              Nome
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.name ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            ) : null}
          </div>

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
              autoComplete="new-password"
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
            {mutation.isPending ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
