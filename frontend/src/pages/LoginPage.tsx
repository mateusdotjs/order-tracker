import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { login } from '../api/auth'
import { ApiError } from '../api/client'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../context/AuthContext'

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
    <LoginForm
      email={email}
      password={password}
      successMessage={successMessage}
      generalError={generalError}
      fieldErrors={fieldErrors}
      isPending={mutation.isPending}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  )
}
