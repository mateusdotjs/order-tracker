type FieldErrorProps = {
  message?: string | null
  className?: string
}

const defaultClassName = 'mt-1 text-sm text-red-600'

export function FieldError({ message, className = defaultClassName }: FieldErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p className={className} role="alert">
      {message}
    </p>
  )
}
