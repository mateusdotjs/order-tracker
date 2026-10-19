import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { register } from '../api/auth'
import { ApiError, NetworkError } from '../api/client'
import { RegisterForm } from '../components/auth/RegisterForm'
import { NETWORK_ERROR_MESSAGE } from '../constants/errorMessages'
import { withoutFieldErrors } from '../lib/fieldErrors'
import type { ErrorCode, FieldErrorCode } from '../types/errors'

export function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
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
      setGeneralErrorFallback('Não foi possível cadastrar. Tente novamente.')
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGeneralErrorCode(null)
    setGeneralErrorFallback(null)
    setFieldErrors({})
    mutation.mutate({ name, email, password })
  }

  function handleNameChange(value: string) {
    setName(value)
    setFieldErrors((prev) => withoutFieldErrors(prev, 'name'))
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
    <RegisterForm
      name={name}
      email={email}
      password={password}
      generalErrorCode={generalErrorCode}
      generalErrorFallback={generalErrorFallback}
      fieldErrors={fieldErrors}
      isPending={mutation.isPending}
      onNameChange={handleNameChange}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
    />
  )
}
