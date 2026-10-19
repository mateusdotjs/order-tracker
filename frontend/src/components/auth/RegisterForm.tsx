import type { FormEvent } from 'react'
import { Link } from 'react-router'
import type { ErrorCode, FieldErrorCode } from '../../types/errors'
import { FieldError } from '../FieldError'
import { FormGeneralError } from '../FormGeneralError'

type RegisterFormProps = {
  name: string
  email: string
  password: string
  generalErrorCode: ErrorCode | null
  generalErrorFallback: string | null
  fieldErrors: Record<string, FieldErrorCode>
  isPending: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function RegisterForm({
  name,
  email,
  password,
  generalErrorCode,
  generalErrorFallback,
  fieldErrors,
  isPending,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Cadastro
        </h1>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FieldError code={fieldErrors.name} />
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
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FieldError code={fieldErrors.email} />
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
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FieldError code={fieldErrors.password} />
          </div>

          <FormGeneralError
            code={generalErrorCode}
            fallback={generalErrorFallback}
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Cadastrando…' : 'Cadastrar'}
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
