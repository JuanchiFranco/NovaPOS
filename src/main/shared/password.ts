import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEY_LENGTH = 64

/**
 * Hashea una contraseña con scrypt (nativo de Node, sin dependencias externas).
 * Formato almacenado: "sal:hash", ambos en hexadecimal.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, 'hex')
  const candidate = scryptSync(password, salt, hashBuffer.length)
  if (candidate.length !== hashBuffer.length) return false
  return timingSafeEqual(candidate, hashBuffer)
}
