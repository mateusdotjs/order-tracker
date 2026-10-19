type FormGeneralErrorProps = {
  message?: string | null
}

export function FormGeneralError({ message }: FormGeneralErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p className="text-sm text-red-600" role="alert">
      {message}
    </p>
  )
}
