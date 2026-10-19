import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { register } from '../api/auth'
import { ApiError } from '../api/client'
import { RegisterForm } from '../components/auth/RegisterForm'

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
    <RegisterForm
      name={name}
      email={email}
      password={password}
      generalError={generalError}
      fieldErrors={fieldErrors}
      isPending={mutation.isPending}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  )
}
