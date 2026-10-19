import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { login } from '../api/auth'
import { ApiError, NetworkError } from '../api/client'
import { LoginForm } from '../components/auth/LoginForm'
import { NETWORK_ERROR_MESSAGE } from '../constants/errorMessages'
import { useAuth } from '../context/AuthContext'
import { withoutFieldErrors } from '../lib/fieldErrors'
import type { ErrorCode, FieldErrorCode } from '../types/errors'

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
  const [generalErrorCode, setGeneralErrorCode] = useState<ErrorCode | null>(
    null,
  )
  const [generalErrorFallback, setGeneralErrorFallback] = useState<
    string | null
  >(null)
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, FieldErrorCode>
  >({})

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      saveToken(data.token)
      navigate('/', { replace: true })
    },
    onError: (error: Error) => {
      setFieldErrors({})
      setGeneralErrorCode(null)
      setGeneralErrorFallback(null)
      if (error instanceof ApiError) {
        setGeneralErrorCode(error.code)
        if (error.errors) {
          setFieldErrors(error.errors)
        }
        return
      }
      if (error instanceof NetworkError) {
        setGeneralErrorFallback(NETWORK_ERROR_MESSAGE)
        return
      }
      setGeneralErrorFallback('Não foi possível entrar. Tente novamente.')
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGeneralErrorCode(null)
    setGeneralErrorFallback(null)
    setFieldErrors({})
    mutation.mutate({ email, password })
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    setFieldErrors((prev) => withoutFieldErrors(prev, 'email'))
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setFieldErrors((prev) => withoutFieldErrors(prev, 'password'))
  }

  return (
    <LoginForm
      email={email}
      password={password}
      successMessage={successMessage}
      generalErrorCode={generalErrorCode}
      generalErrorFallback={generalErrorFallback}
      fieldErrors={fieldErrors}
      isPending={mutation.isPending}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
    />
  )
}
