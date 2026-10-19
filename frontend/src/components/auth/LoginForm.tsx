import type { FormEvent } from 'react'
import { Link } from 'react-router'
import type { ErrorCode, FieldErrorCode } from '../../types/errors'
import { FieldError } from '../FieldError'
import { FormGeneralError } from '../FormGeneralError'

type LoginFormProps = {
  email: string
  password: string
  successMessage?: string
  generalErrorCode: ErrorCode | null
  generalErrorFallback: string | null
  fieldErrors: Record<string, FieldErrorCode>
  isPending: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function LoginForm({
  email,
  password,
  successMessage,
  generalErrorCode,
  generalErrorFallback,
  fieldErrors,
  isPending,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
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

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              maxLength={150}
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              maxLength={50}
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
            className="w-full rounded bg-brand-600 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {isPending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta?{' '}
          <Link to="/register" className="text-brand-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
