export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: number | string) {
    super(`${entity} con id ${id} no fue encontrado`)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

/** Convierte cualquier error capturado en un mensaje legible para el usuario final. */
export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.message
  if (error instanceof Error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return 'Ya existe un registro con ese valor único (código, documento o número).'
    }
    return error.message
  }
  return 'Ocurrió un error inesperado.'
}
